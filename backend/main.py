import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware

from backend.models.vision_models import (
    VisionSignals,
    AnalyzeFrameRequest,
    VisionStatusResponse,
    HealthResponse,
)
from backend.services.vision_service import vision_service

app = FastAPI(
    title="DefenseAI Computer Vision Service",
    description="Real-time Computer Vision signal extraction for interview monitoring using OpenCV",
    version="1.0.0",
)

# Allow CORS for React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
def get_health():
    """
    Health check endpoint.
    Returns status: ok and service identifier.
    """
    return HealthResponse(
        status="ok",
        service="DefenseAI Computer Vision"
    )

@app.get("/vision/status", response_model=VisionStatusResponse)
def get_vision_status():
    """
    Computer Vision status endpoint.
    Indicates whether the OpenCV vision engine is loaded and operational.
    Does NOT claim camera detection is active just because the server is running.
    """
    ready = vision_service.is_ready()
    eye_ready = vision_service.is_eye_ready()
    version = vision_service.get_opencv_version()

    return VisionStatusResponse(
        connected=True,
        service="opencv",
        haarCascadeLoaded=ready,
        eyeCascadeLoaded=eye_ready,
        version=version,
        blinkClosedFramesThreshold=1,
        message="OpenCV Computer Vision engine loaded and awaiting video frames." if ready else "OpenCV or Haar cascades not loaded."
    )

@app.post("/vision/analyze-frame", response_model=VisionSignals)
def analyze_frame(request: AnalyzeFrameRequest):
    """
    Analyzes an incoming webcam frame from the browser video element.
    Detects faces using OpenCV Haar Cascade and computes explainable signals.
    """
    if not request.image:
        raise HTTPException(status_code=400, detail="Missing frame image data")

    signals = vision_service.analyze_base64_frame(request.image)
    return signals

@app.get("/vision/signals", response_model=VisionSignals)
def get_latest_signals():
    """
    Returns the most recently computed vision signals.
    """
    return vision_service.get_latest_signals()

@app.post("/vision/reset")
def reset_signals():
    """
    Resets accumulated vision signals to baseline.
    """
    vision_service.reset()
    return {"status": "reset", "signals": vision_service.get_latest_signals()}

@app.get("/")
def root():
    return {
        "service": "DefenseAI Computer Vision Backend",
        "status": "operational",
        "endpoints": [
            "/health",
            "/vision/status",
            "/vision/analyze-frame",
            "/vision/signals",
        ],
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
