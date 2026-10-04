export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  isPrimary?: boolean;
  boxType?: 'face' | 'eye' | string;
}

export interface VisionSignals {
  faceCount: number;
  primaryFaceDetected: boolean;
  multiplePersonDetected: boolean;
  personStatus?: string;
  explanation?: string | null;
  blinkCount: number;
  eyeDetected?: boolean;
  eyeOpenness?: number;
  baselineOpenness?: number;
  blinkTrackingState?: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  consecutiveClosedFrames?: number;
  lastBlinkTimestamp?: number;
  eyeStatus: string; // 'Both Eyes Detected' | 'One Eye Detected' | 'No Eyes Detected' | 'Not Available'
  mouthStatus: string;
  cameraActive: boolean;
  boundingBoxes?: BoundingBox[];
  eyeBoundingBoxes?: BoundingBox[];
  fps?: number | null;
  processingTimeMs?: number | null;
  timestamp?: string;
}

export interface VisionStatusResponse {
  connected: boolean;
  service: string;
  haarCascadeLoaded?: boolean;
  eyeCascadeLoaded?: boolean;
  version?: string;
  message?: string;
  blinkClosedFramesThreshold?: number;
}

export interface HealthResponse {
  status: string;
  service: string;
}
