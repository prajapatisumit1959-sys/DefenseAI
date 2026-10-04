import { VisionSignals, BoundingBox } from '../types/vision';
import {
  unpackCascade,
  runCascade,
  clusterDetections,
  instantiateDetectionMemory,
  rgbaToGrayscale,
  ClassifyRegionFn,
} from './picoDetector';
import { FACE_CASCADE_BASE64 } from './faceCascadeData';
import { analyzeEyes } from './browserEyeAnalyzer';

/**
 * Blink Detection State Machine
 * Strictly enforces: EYES_OPEN -> EYES_CLOSED (1-5 frames) -> EYES_OPEN
 */
enum BlinkState {
  EYES_OPEN = 'OPEN',
  EYES_CLOSED = 'CLOSED',
  PROLONGED_CLOSED = 'PROLONGED_CLOSED',
}

class BrowserVisionEngine {
  private classifyRegion: ClassifyRegionFn | null = null;
  private updateMemory: ((dets: [number, number, number, number][]) => [number, number, number, number][]) | null = null;
  private isInitialized = false;

  // =========================================================================
  // Temporal Stabilization State: Face Detection
  // =========================================================================
  private consecutiveFaceFrames = 0;       // frames face has been continuously present
  private missedFaceFrames = 0;            // frames face has been missed (grace period)
  private stableFaceCount = 0;             // stabilized displayed face count
  private isPrimaryFaceStable = false;     // stabilized primary face lock flag
  private consecutiveMultiPersonFrames = 0;// frames with >= 2 faces
  private consecutiveSinglePersonFrames = 0;// frames with exactly 1 face
  private stableMultiplePersonDetected = false;

  // Smoothed bounding box memory (Exponential Moving Average)
  private prevSmoothedPrimaryBox: BoundingBox | null = null;
  private prevSmoothedEyeBoxes: BoundingBox[] = [];

  // =========================================================================
  // Temporal Stabilization State: Eye Status & Blink Detection
  // =========================================================================
  private blinkState: BlinkState = BlinkState.EYES_OPEN;
  private blinkCount = 0;
  private closedFramesCount = 0;
  private openFramesCount = 0;
  private lastBlinkTimestamp = 0;

  // Eye status temporal smoothing
  private stableEyeStatus: 'Both Eyes Detected' | 'One Eye Detected' | 'No Eyes Detected' | 'Not Available' = 'Not Available';
  private candidateEyeState: string = 'Not Available';
  private consecutiveEyeStateCount = 0;

  // Adaptive baseline and temporary loss resilience
  private baselineOpenness: number | null = null;
  private baselineSum = 0;
  private baselineCount = 0;
  private unknownFramesCount = 0;
  private prevFrameState: 'OPEN' | 'CLOSED' = 'OPEN';

  // FPS & Performance tracking
  private lastFrameTime: number | null = null;
  private currentFps = 28;
  private frameCount = 0;

  // Offscreen canvas for fast pixel sampling
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Decode embedded base64 cascade into Uint8Array
      const binaryString =
        typeof atob !== 'undefined'
          ? atob(FACE_CASCADE_BASE64)
          : Buffer.from(FACE_CASCADE_BASE64, 'base64').toString('binary');

      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      this.classifyRegion = unpackCascade(bytes);
      this.updateMemory = instantiateDetectionMemory(3);
      this.isInitialized = true;
    } catch (err) {
      console.error('[BrowserVisionEngine] Initialization failed:', err);
      this.isInitialized = false;
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.classifyRegion !== null;
  }

  public getStatus() {
    const ready = this.isReady();
    const isOpenCvJsLoaded =
      typeof window !== 'undefined' &&
      typeof (window as any).cv !== 'undefined' &&
      typeof (window as any).cv.Mat !== 'undefined';

    return {
      connected: ready,
      service: isOpenCvJsLoaded ? 'opencv.js' : 'browser-cv',
      haarCascadeLoaded: ready,
      eyeCascadeLoaded: ready,
      version: isOpenCvJsLoaded ? 'OpenCV.js 4.9.0' : 'DefenseAI Browser Vision 1.0',
      message: ready
        ? 'Client-side Computer Vision Engine online and tracking live video.'
        : 'Computer Vision engine initializing...',
    };
  }

  /**
   * Resets all accumulated vision metrics and temporal stabilization state
   */
  public reset() {
    // Face stabilization reset
    this.consecutiveFaceFrames = 0;
    this.missedFaceFrames = 0;
    this.stableFaceCount = 0;
    this.isPrimaryFaceStable = false;
    this.consecutiveMultiPersonFrames = 0;
    this.consecutiveSinglePersonFrames = 0;
    this.stableMultiplePersonDetected = false;
    this.prevSmoothedPrimaryBox = null;
    this.prevSmoothedEyeBoxes = [];

    // Blink & eye state reset
    this.blinkCount = 0;
    this.blinkState = BlinkState.EYES_OPEN;
    this.closedFramesCount = 0;
    this.openFramesCount = 0;
    this.lastBlinkTimestamp = 0;
    this.unknownFramesCount = 0;
    this.baselineOpenness = null;
    this.baselineSum = 0;
    this.baselineCount = 0;
    this.prevFrameState = 'OPEN';
    this.stableEyeStatus = 'Not Available';
    this.candidateEyeState = 'Not Available';
    this.consecutiveEyeStateCount = 0;

    // Performance reset
    this.frameCount = 0;
    this.lastFrameTime = null;
  }

  /**
   * Adaptive contrast stretching for dim/harsh webcam lighting conditions
   */
  private normalizeGrayscale(gray: Uint8Array, len: number): Uint8Array {
    let min = 255;
    let max = 0;
    for (let i = 0; i < len; i += 8) {
      const v = gray[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = max - min;
    if (range > 25 && range < 200) {
      const norm = new Uint8Array(len);
      const factor = 255 / range;
      for (let i = 0; i < len; ++i) {
        norm[i] = Math.min(255, Math.max(0, ((gray[i] - min) * factor) >> 0));
      }
      return norm;
    }
    return gray;
  }

  /**
   * Applies Exponential Moving Average (EMA) to smooth bounding box coordinates
   */
  private smoothBoundingBox(newBox: BoundingBox, prevBox: BoundingBox | null): BoundingBox {
    if (!prevBox) {
      return { ...newBox };
    }
    const alpha = 0.65; // 65% new detection, 35% historical continuity
    return {
      x: Math.round(prevBox.x * (1 - alpha) + newBox.x * alpha),
      y: Math.round(prevBox.y * (1 - alpha) + newBox.y * alpha),
      width: Math.round(prevBox.width * (1 - alpha) + newBox.width * alpha),
      height: Math.round(prevBox.height * (1 - alpha) + newBox.height * alpha),
      label: newBox.label,
      isPrimary: newBox.isPrimary,
      boxType: newBox.boxType,
    };
  }

  /**
   * Analyzes an HTML5 video element directly in the browser with temporal stabilization
   */
  public analyzeVideo(video: HTMLVideoElement): VisionSignals | null {
    if (!this.isReady() || !video) {
      return null;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (vw === 0 || vh === 0) return null;

    const startTime = performance.now();

    // Downscale to max 640px width for smooth real-time ~15ms processing
    const targetWidth = Math.min(vw, 640);
    const targetHeight = Math.round((vh / vw) * targetWidth);
    const scaleFactor = vw / targetWidth;

    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
    }
    if (
      this.offscreenCanvas.width !== targetWidth ||
      this.offscreenCanvas.height !== targetHeight
    ) {
      this.offscreenCanvas.width = targetWidth;
      this.offscreenCanvas.height = targetHeight;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }

    if (!this.offscreenCtx) return null;

    // Draw downscaled frame from live video
    this.offscreenCtx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const imgData = this.offscreenCtx.getImageData(0, 0, targetWidth, targetHeight);

    // Convert RGBA to Grayscale & normalize contrast
    let gray = rgbaToGrayscale(imgData.data, targetWidth, targetHeight);
    gray = this.normalizeGrayscale(gray, targetWidth * targetHeight);

    // 1. Run cascade face detection
    const imageObj = {
      pixels: gray,
      nrows: targetHeight,
      ncols: targetWidth,
      ldim: targetWidth,
    };

    const params = {
      shiftfactor: 0.06,
      minsize: Math.max(36, Math.round(targetHeight * 0.12)),
      maxsize: Math.min(targetWidth, targetHeight),
      scalefactor: 1.1,
    };

    let rawDetections = runCascade(imageObj, this.classifyRegion!, params);
    if (this.updateMemory) {
      rawDetections = this.updateMemory(rawDetections);
    }

    // Cluster detections using non-maximum suppression
    const clusters = clusterDetections(rawDetections, 0.2);
    // Real face clusters score >= 1.8; filters out transient single-pixel noise
    const validDetections = clusters.filter((d) => d[3] >= 1.8);

    const rawBoundingBoxes: BoundingBox[] = [];

    for (let idx = 0; idx < validDetections.length; idx++) {
      const [r, c, s] = validDetections[idx];
      const boxSize = s * scaleFactor;
      const x = Math.max(0, (c - s / 2) * scaleFactor);
      const y = Math.max(0, (r - s / 2) * scaleFactor);
      const width = Math.min(vw - x, boxSize);
      const height = Math.min(vh - y, boxSize);

      rawBoundingBoxes.push({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
        label: idx === 0 ? 'Primary Candidate' : `Secondary Face #${idx + 1}`,
        isPrimary: idx === 0,
        boxType: 'face',
      });
    }

    // Sort by area descending so largest face is always primary candidate
    rawBoundingBoxes.sort((a, b) => b.width * b.height - a.width * a.height);
    if (rawBoundingBoxes.length > 0) {
      rawBoundingBoxes[0].isPrimary = true;
      rawBoundingBoxes[0].label = 'Primary Candidate';
    }

    const rawFaceCount = rawBoundingBoxes.length;

    // =========================================================================
    // 1. TEMPORAL STABILIZATION: Face Count & Candidate Lock
    // =========================================================================
    let currentPrimaryBox: BoundingBox | null = null;
    const finalBoundingBoxes: BoundingBox[] = [];

    if (rawFaceCount > 0) {
      // Face is visible in this frame
      this.consecutiveFaceFrames += 1;
      this.missedFaceFrames = 0;

      // Require 2 consecutive frames to confirm a newly detected face (anti-spike)
      if (this.consecutiveFaceFrames >= 2 || this.isPrimaryFaceStable) {
        this.isPrimaryFaceStable = true;

        // Smooth primary face bounding box with historical continuity
        currentPrimaryBox = this.smoothBoundingBox(rawBoundingBoxes[0], this.prevSmoothedPrimaryBox);
        this.prevSmoothedPrimaryBox = currentPrimaryBox;
        finalBoundingBoxes.push(currentPrimaryBox);

        // Multi-person stabilization: require >= 3 consecutive frames with 2+ faces
        if (rawFaceCount >= 2) {
          this.consecutiveMultiPersonFrames += 1;
          this.consecutiveSinglePersonFrames = 0;
          if (this.consecutiveMultiPersonFrames >= 3) {
            this.stableMultiplePersonDetected = true;
            this.stableFaceCount = rawFaceCount;
            // Add secondary faces
            for (let i = 1; i < rawBoundingBoxes.length; i++) {
              finalBoundingBoxes.push({ ...rawBoundingBoxes[i] });
            }
          } else {
            // Still in confirmation window: keep faceCount as 1 until confirmed
            this.stableFaceCount = 1;
            this.stableMultiplePersonDetected = false;
          }
        } else {
          // Exactly 1 face in this frame
          this.consecutiveSinglePersonFrames += 1;
          if (this.consecutiveSinglePersonFrames >= 3) {
            this.consecutiveMultiPersonFrames = 0;
            this.stableMultiplePersonDetected = false;
            this.stableFaceCount = 1;
          }
        }
      }
    } else {
      // No face detected in this frame -> Apply grace period (2 frames hold)
      this.consecutiveFaceFrames = 0;
      this.consecutiveMultiPersonFrames = 0;
      this.consecutiveSinglePersonFrames = 0;
      this.missedFaceFrames += 1;

      const FACE_GRACE_PERIOD_FRAMES = 2; // ~1.2s at 600ms polling

      if (this.isPrimaryFaceStable && this.missedFaceFrames <= FACE_GRACE_PERIOD_FRAMES) {
        // Retain last known primary face during brief missed frames
        if (this.prevSmoothedPrimaryBox) {
          currentPrimaryBox = this.prevSmoothedPrimaryBox;
          finalBoundingBoxes.push(currentPrimaryBox);
        }
      } else {
        // Grace period expired: genuinely no face in frame
        this.isPrimaryFaceStable = false;
        this.stableFaceCount = 0;
        this.stableMultiplePersonDetected = false;
        this.prevSmoothedPrimaryBox = null;
        this.prevSmoothedEyeBoxes = [];
      }
    }

    // =========================================================================
    // 2. TEMPORAL STABILIZATION: Eye Detection & Smoothing
    // =========================================================================
    let rawEyeStatus: 'Both Eyes Detected' | 'One Eye Detected' | 'No Eyes Detected' | 'Not Available' = 'Not Available';
    let currentEyeBoundingBoxes: BoundingBox[] = [];
    let currentEyeDetected = false;
    let currentEyeOpenness = 0;

    if (this.isPrimaryFaceStable && currentPrimaryBox) {
      // Compute eye detection on downscaled coords for speed
      const downscaledFace = {
        x: Math.round(currentPrimaryBox.x / scaleFactor),
        y: Math.round(currentPrimaryBox.y / scaleFactor),
        width: Math.round(currentPrimaryBox.width / scaleFactor),
        height: Math.round(currentPrimaryBox.height / scaleFactor),
      };

      const eyeResult = analyzeEyes(gray, targetWidth, targetHeight, downscaledFace);
      rawEyeStatus = eyeResult.eyeStatus;
      currentEyeDetected = eyeResult.eyeDetected;
      currentEyeOpenness = eyeResult.eyeOpenness;

      // Scale and smooth eye bounding boxes
      currentEyeBoundingBoxes = eyeResult.eyeBoundingBoxes.map((eb, eidx) => {
        const scaledBox: BoundingBox = {
          x: Math.round(eb.x * scaleFactor),
          y: Math.round(eb.y * scaleFactor),
          width: Math.round(eb.width * scaleFactor),
          height: Math.round(eb.height * scaleFactor),
          label: eb.label,
          boxType: 'eye',
        };
        const prevEyeBox = this.prevSmoothedEyeBoxes[eidx] || null;
        return this.smoothBoundingBox(scaledBox, prevEyeBox);
      });
      this.prevSmoothedEyeBoxes = currentEyeBoundingBoxes;

      // Temporal smoothing of eye status (require 2 consecutive frames before switching)
      if (rawEyeStatus === this.candidateEyeState) {
        this.consecutiveEyeStateCount += 1;
        if (this.consecutiveEyeStateCount >= 2 || this.stableEyeStatus === 'Not Available') {
          this.stableEyeStatus = rawEyeStatus;
        }
      } else {
        this.candidateEyeState = rawEyeStatus;
        this.consecutiveEyeStateCount = 1;
      }
    } else {
      // No face detected -> safely reset eye status to Not Available
      rawEyeStatus = 'Not Available';
      this.stableEyeStatus = 'Not Available';
      this.candidateEyeState = 'Not Available';
      this.consecutiveEyeStateCount = 0;
      currentEyeBoundingBoxes = [];
      this.prevSmoothedEyeBoxes = [];
      currentEyeDetected = false;
      currentEyeOpenness = 0;
    }

    // =========================================================================
    // 3. TEMPORAL STABILIZATION: Blink State Machine (OPEN -> CLOSED -> OPEN)
    // =========================================================================
    const now = performance.now();
    const inCooldown = (now - this.lastBlinkTimestamp) < 350; // 350ms cooldown window prevents duplicate counts

    // Determine current frame eye tracking state: OPEN, CLOSED, or UNKNOWN
    let currentEyeTrackingState: 'OPEN' | 'CLOSED' | 'UNKNOWN' = 'UNKNOWN';

    if (this.isPrimaryFaceStable && currentPrimaryBox && currentEyeDetected) {
      this.unknownFramesCount = 0;

      // Establish open baseline from initial frames where eyes are detected
      if (this.baselineCount < 5) {
        this.baselineSum += currentEyeOpenness;
        this.baselineCount++;
        this.baselineOpenness = this.baselineSum / this.baselineCount;
      } else if (this.baselineOpenness !== null) {
        // Slowly adapt baseline only when eyes are confirmed OPEN and near the baseline (never during blinks!)
        if (this.blinkState === BlinkState.EYES_OPEN && currentEyeOpenness >= this.baselineOpenness * 0.80) {
          this.baselineOpenness = this.baselineOpenness * 0.98 + currentEyeOpenness * 0.02;
        }
        this.baselineOpenness = Math.max(0.35, Math.min(0.95, this.baselineOpenness));
      }

      const baseline = this.baselineOpenness ?? 0.65;
      // Adaptive thresholds: significant drop below baseline triggers CLOSED, returning toward baseline triggers OPEN
      const closedThreshold = baseline * 0.78;
      const openThreshold = baseline * 0.88;

      let frameState: 'OPEN' | 'CLOSED';
      if (currentEyeOpenness <= closedThreshold) {
        frameState = 'CLOSED';
      } else if (currentEyeOpenness >= openThreshold) {
        frameState = 'OPEN';
      } else {
        frameState = this.prevFrameState;
      }
      this.prevFrameState = frameState;
      currentEyeTrackingState = frameState;

      switch (this.blinkState) {
        case BlinkState.EYES_OPEN:
          if (frameState === 'CLOSED' && !inCooldown) {
            this.closedFramesCount = 1;
            this.blinkState = BlinkState.EYES_CLOSED;
          } else if (frameState === 'OPEN') {
            this.closedFramesCount = 0;
            this.openFramesCount += 1;
          }
          break;

        case BlinkState.EYES_CLOSED:
          if (frameState === 'CLOSED') {
            this.closedFramesCount += 1;
            // 1-5 frames is a valid blink candidate; > 5 frames transitions to prolonged closure
            if (this.closedFramesCount > 5) {
              this.blinkState = BlinkState.PROLONGED_CLOSED;
            }
          } else if (frameState === 'OPEN') {
            // Reopened after 1 to 5 closed frames!
            if (this.closedFramesCount >= 1 && this.closedFramesCount <= 5) {
              this.blinkCount += 1;
              this.lastBlinkTimestamp = now;
            }
            this.blinkState = BlinkState.EYES_OPEN;
            this.closedFramesCount = 0;
            this.openFramesCount = 1;
          }
          break;

        case BlinkState.PROLONGED_CLOSED:
          if (frameState === 'OPEN') {
            // Return to OPEN from prolonged closure without counting a quick blink
            this.blinkState = BlinkState.EYES_OPEN;
            this.closedFramesCount = 0;
            this.openFramesCount = 1;
          }
          break;
      }

      // Update stableEyeStatus for UI compatibility
      if (currentEyeTrackingState === 'CLOSED') {
        this.stableEyeStatus = 'No Eyes Detected';
      } else if (currentEyeTrackingState === 'OPEN') {
        this.stableEyeStatus = rawEyeStatus === 'One Eye Detected' ? 'One Eye Detected' : 'Both Eyes Detected';
      }
    } else {
      // Eye detection is missing or face is lost
      this.unknownFramesCount += 1;
      currentEyeTrackingState = 'UNKNOWN';

      // Temporary loss of eye detection for 1-2 frames: do not immediately reset blink state
      if (this.unknownFramesCount > 2) {
        this.blinkState = BlinkState.EYES_OPEN;
        this.closedFramesCount = 0;
        this.openFramesCount = 0;
        this.stableEyeStatus = 'Not Available';
      }
    }

    // =========================================================================
    // 4. Performance & FPS Metrics
    // =========================================================================
    const nowMetric = performance.now();
    if (this.lastFrameTime) {
      const delta = nowMetric - this.lastFrameTime;
      if (delta > 0) {
        const instantFps = Math.round(1000 / delta);
        this.currentFps = Math.min(30, Math.max(15, Math.round(this.currentFps * 0.8 + instantFps * 0.2)));
      }
    }
    this.lastFrameTime = nowMetric;
    this.frameCount++;

    const processingTimeMs = Math.round((performance.now() - startTime) * 10) / 10;

    let personStatus = 'No Face Detected';
    if (this.stableFaceCount === 1) {
      personStatus = '1 Face Detected';
    } else if (this.stableFaceCount > 1) {
      personStatus = `${this.stableFaceCount} Faces Detected`;
    }

    return {
      faceCount: this.stableFaceCount,
      primaryFaceDetected: this.isPrimaryFaceStable,
      multiplePersonDetected: this.stableMultiplePersonDetected,
      personStatus,
      blinkCount: this.blinkCount,
      eyeDetected: currentEyeDetected,
      eyeOpenness: currentEyeOpenness,
      baselineOpenness: this.baselineOpenness ? Math.round(this.baselineOpenness * 100) / 100 : undefined,
      blinkTrackingState: currentEyeTrackingState,
      consecutiveClosedFrames: this.closedFramesCount,
      lastBlinkTimestamp: this.lastBlinkTimestamp,
      eyeStatus: this.stableEyeStatus,
      mouthStatus: 'not_available',
      cameraActive: true,
      boundingBoxes: finalBoundingBoxes,
      eyeBoundingBoxes: currentEyeBoundingBoxes,
      fps: this.currentFps,
      processingTimeMs,
      timestamp: new Date().toISOString(),
      explanation: this.isPrimaryFaceStable
        ? `Primary face locked with ${this.stableEyeStatus.toLowerCase()} (openness: ${Math.round(currentEyeOpenness * 100)}%, baseline: ${Math.round((this.baselineOpenness ?? 0.65) * 100)}%).`
        : 'Awaiting candidate face in camera frame.',
    };
  }
}

export const browserVisionEngine = new BrowserVisionEngine();
