from typing import Optional, List
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: int = Field(..., description="Top-left X coordinate of bounding box")
    y: int = Field(..., description="Top-left Y coordinate of bounding box")
    width: int = Field(..., description="Width of bounding box")
    height: int = Field(..., description="Height of bounding box")
    label: Optional[str] = Field(default=None, description="Label for bounding box (e.g., 'Primary Face', 'Subject #2', 'Eye')")
    isPrimary: Optional[bool] = Field(default=False, description="Whether this box represents the primary subject face")
    boxType: str = Field(default="face", description="Type of detected feature: 'face' or 'eye'")

class VisionSignals(BaseModel):
    """
    Structured Computer Vision Telemetry Signals.
    Derived strictly from OpenCV Haar Cascade analysis without synthetic or random data.
    Unimplemented metrics remain strictly 'not_available'.
    """
    faceCount: int = Field(default=0, description="Total number of detected faces")
    primaryFaceDetected: bool = Field(default=False, description="Whether primary subject face is detected")
    multiplePersonDetected: bool = Field(default=False, description="Triggered when faceCount > 1")
    personStatus: str = Field(
        default="No Face Detected",
        description="Categorical status: 'No Face Detected', 'Single Person', or 'Multiple Persons Detected'"
    )
    explanation: Optional[str] = Field(default=None, description="Objective review note when flags trigger")
    blinkCount: int = Field(default=0, description="Consecutive-frame blink counter")
    eyeStatus: str = Field(
        default="Not Available",
        description="Eye detection status: 'Both Eyes Detected', 'One Eye Detected', 'No Eyes Detected', or 'Not Available'"
    )
    mouthStatus: str = Field(default="not_available", description="Mouth movement tracking status ('not_available' pending mouth model)")
    cameraActive: bool = Field(default=False, description="Whether camera feed is actively providing video frames")
    boundingBoxes: List[BoundingBox] = Field(default_factory=list, description="Coordinates of detected faces in the frame")
    eyeBoundingBoxes: List[BoundingBox] = Field(default_factory=list, description="Coordinates of detected eyes in the primary face")
    fps: Optional[float] = Field(default=None, description="Processed frames per second")
    processingTimeMs: Optional[float] = Field(default=None, description="Processing latency in milliseconds")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp of signal generation")

class AnalyzeFrameRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded video frame (data URL or raw base64 string)")

class VisionStatusResponse(BaseModel):
    connected: bool = Field(default=True, description="Service operational state")
    service: str = Field(default="opencv", description="Vision engine name")
    haarCascadeLoaded: bool = Field(default=True, description="Whether face Haar cascade classifier loaded successfully")
    eyeCascadeLoaded: bool = Field(default=True, description="Whether eye Haar cascade classifier loaded successfully")
    version: Optional[str] = Field(default=None, description="OpenCV library version")
    message: Optional[str] = Field(default=None, description="Status detail message")
    blinkClosedFramesThreshold: int = Field(default=1, description="Configured consecutive closed frames required to detect a blink")

class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Server health status")
    service: str = Field(default="DefenseAI Computer Vision", description="Service identifier")
