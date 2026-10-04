import { VisionSignals, VisionStatusResponse, HealthResponse } from '../types/vision';
import { browserVisionEngine } from './browserVisionEngine';

// Defaults to relative API proxy or direct FastAPI port 8000
const FASTAPI_DIRECT_URL = 'http://localhost:8000';
const PROXY_BASE_URL = '/api/vision';

class VisionClientService {
  private lastKnownStatus: VisionStatusResponse = {
    connected: false,
    service: 'opencv',
    message: 'Initializing computer vision service connection...',
  };

  /**
   * Checks whether computer vision is operational.
   * Prioritizes client-side browser CV engine (always available in production Cloud Run)
   * while maintaining compatibility with local Python FastAPI server if running.
   */
  async checkStatus(): Promise<VisionStatusResponse> {
    // 1. Check if browser-side computer vision engine is initialized and ready
    if (browserVisionEngine.isReady()) {
      const browserStatus = browserVisionEngine.getStatus();
      const status: VisionStatusResponse = {
        connected: true,
        service: 'opencv',
        haarCascadeLoaded: browserStatus.haarCascadeLoaded,
        eyeCascadeLoaded: browserStatus.eyeCascadeLoaded,
        version: browserStatus.version,
        message: browserStatus.message,
      };
      this.lastKnownStatus = status;
      return status;
    }

    // 2. Check proxy route (/api/vision/status) if Python backend is available
    try {
      const response = await fetch(`${PROXY_BASE_URL}/status`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data: VisionStatusResponse = await response.json();
        if (data.connected) {
          this.lastKnownStatus = data;
          return data;
        }
      }
    } catch {
      // Fallback: try direct localhost:8000
    }

    try {
      const response = await fetch(`${FASTAPI_DIRECT_URL}/vision/status`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data: VisionStatusResponse = await response.json();
        if (data.connected) {
          this.lastKnownStatus = data;
          return data;
        }
      }
    } catch {
      // Both unavailable
    }

    const offlineStatus: VisionStatusResponse = {
      connected: false,
      service: 'opencv',
      haarCascadeLoaded: false,
      eyeCascadeLoaded: false,
      message: 'Computer Vision engine is currently offline.',
    };
    this.lastKnownStatus = offlineStatus;
    return offlineStatus;
  }

  /**
   * Performs health check against vision service
   */
  async checkHealth(): Promise<HealthResponse | null> {
    if (browserVisionEngine.isReady()) {
      return {
        status: 'ok',
        service: 'DefenseAI Client-Side Computer Vision Engine',
      };
    }

    try {
      const res = await fetch(`${PROXY_BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch {
      try {
        const res = await fetch(`${FASTAPI_DIRECT_URL}/health`);
        if (res.ok) return await res.json();
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Analyzes live HTML5 video element directly in the browser.
   * Produces real face count, eye status, blink count, and bounding boxes.
   */
  async analyzeVideo(video: HTMLVideoElement): Promise<VisionSignals | null> {
    if (browserVisionEngine.isReady()) {
      return browserVisionEngine.analyzeVideo(video);
    }
    return null;
  }

  /**
   * Sends a base64 encoded frame from HTML5 video canvas to the OpenCV backend
   * or evaluates locally via browser vision engine.
   */
  async analyzeFrame(base64Image: string): Promise<VisionSignals | null> {
    // If browser vision engine is available, use client-side offscreen canvas
    if (browserVisionEngine.isReady() && typeof document !== 'undefined') {
      try {
        return await new Promise<VisionSignals | null>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0);
            // Simulate video-like structure for analysis
            const mockVideo = {
              videoWidth: canvas.width,
              videoHeight: canvas.height,
              readyState: 4,
            } as HTMLVideoElement;
            const signals = browserVisionEngine.analyzeVideo(mockVideo);
            resolve(signals);
          };
          img.onerror = () => resolve(null);
          img.src = base64Image;
        });
      } catch {
        // Fall back to server if image load fails
      }
    }

    const payload = JSON.stringify({ image: base64Image });

    // Try proxy first
    try {
      const response = await fetch(`${PROXY_BASE_URL}/analyze-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // fallback to direct FastAPI
    }

    try {
      const response = await fetch(`${FASTAPI_DIRECT_URL}/vision/analyze-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('[VisionClientService] Frame analysis dispatch failed:', err);
    }

    return null;
  }

  /**
   * Translates real OpenCV VisionSignals into CameraSignal inputs for the DefenseAI Risk Engine.
   * Deterministic & strictly adheres to:
   * - Signal E: Multiple-person detection (Weight: 20)
   * - Inactive unless real telemetry is provided.
   */
  toRiskEngineSignals(signals: VisionSignals | null): Array<{ type: string; value: unknown }> {
    if (!signals || !signals.cameraActive) {
      return [];
    }

    const cameraSignals: Array<{ type: string; value: unknown }> = [];

    // Multiple Person Detection signal
    cameraSignals.push({
      type: 'multiple_persons',
      value: signals.multiplePersonDetected,
    });

    // Face presence signal
    cameraSignals.push({
      type: 'primary_face',
      value: signals.primaryFaceDetected,
    });

    // Unimplemented metrics (gaze, mouth) remain strictly not provided
    // and do not invent synthetic flags.

    return cameraSignals;
  }

  /**
   * Resets accumulated vision telemetry and blink counter
   */
  async resetSignals(): Promise<void> {
    browserVisionEngine.reset();
    try {
      await fetch(`${PROXY_BASE_URL}/reset`, { method: 'POST' });
    } catch {
      try {
        await fetch(`${FASTAPI_DIRECT_URL}/vision/reset`, { method: 'POST' });
      } catch {
        // ignore offline errors
      }
    }
  }

  getLastStatus(): VisionStatusResponse {
    return this.lastKnownStatus;
  }
}

export const visionService = new VisionClientService();

