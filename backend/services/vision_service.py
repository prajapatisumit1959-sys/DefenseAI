import sys
import os
import time
import base64
from datetime import datetime, timezone
from typing import List, Optional, Tuple

try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    cv2 = None
    np = None
    OPENCV_AVAILABLE = False

from backend.models.vision_models import VisionSignals, BoundingBox

# =====================================================================
# Configurable Computer Vision Constants
# Prototype thresholds for consecutive-frame blink detection
# =====================================================================
BLINK_CLOSED_FRAMES = 1      # Minimum consecutive frames with eyes closed to register state
MAX_BLINK_CLOSED_FRAMES = 10 # Maximum closed frames; beyond this, considered looking away / eyes closed

# Maximum width for detection frame downsampling (ensures real-time speed on older laptops)
DETECTION_TARGET_WIDTH = 640

class VisionService:
    def __init__(self):
        self.face_cascade = None
        self.eye_cascade = None
        self.face_cascade_loaded = False
        self.eye_cascade_loaded = False
        self.clahe = None
        self._init_cascades()

        # Blink counter state machine
        self.blink_count = 0
        self._consecutive_closed_frames = 0
        self._eyes_were_open = False

        # FPS & Timing tracking
        self._last_frame_timestamp: Optional[float] = None
        self._current_fps: float = 0.0

        # Initial default signals
        self.latest_signals = VisionSignals(
            faceCount=0,
            primaryFaceDetected=False,
            multiplePersonDetected=False,
            personStatus="No Face Detected",
            blinkCount=0,
            eyeStatus="Not Available",
            mouthStatus="not_available",
            cameraActive=False,
            fps=None,
            processingTimeMs=None,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    @staticmethod
    def _find_cascade_path(filename: str) -> Optional[str]:
        """
        Locates Haar Cascade XML file across local app directory, cv2 data module, and system paths.
        """
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        candidates = [
            os.path.join(base_dir, "cascades", filename),
            os.path.join("/backend", "cascades", filename),
            os.path.join(os.getcwd(), "backend", "cascades", filename),
        ]
        if OPENCV_AVAILABLE and cv2 is not None:
            if hasattr(cv2, 'data') and hasattr(cv2.data, 'haarcascades'):
                candidates.append(os.path.join(cv2.data.haarcascades, filename))
        candidates.extend([
            os.path.join("/usr/share/opencv4/haarcascades", filename),
            os.path.join("/usr/share/opencv/haarcascades", filename),
            os.path.join("/usr/local/share/opencv4/haarcascades", filename),
        ])
        for path in candidates:
            if os.path.isfile(path):
                return os.path.abspath(path)
        return None

    def _init_cascades(self):
        """
        Initializes OpenCV Haar Cascade classifiers for both frontal face and eye detection.
        Initializes CLAHE for adaptive local contrast enhancement.
        Handles missing files gracefully without breaking the service.
        """
        if not OPENCV_AVAILABLE or cv2 is None:
            return

        # 1. Frontal Face Cascade
        try:
            face_path = self._find_cascade_path('haarcascade_frontalface_default.xml')
            if face_path:
                self.face_cascade = cv2.CascadeClassifier(face_path)
                self.face_cascade_loaded = not self.face_cascade.empty()
            else:
                self.face_cascade = None
                self.face_cascade_loaded = False
            if not self.face_cascade_loaded:
                print("[VisionService] Warning: haarcascade_frontalface_default.xml not found or empty", file=sys.stderr)
        except Exception as e:
            self.face_cascade = None
            self.face_cascade_loaded = False
            print(f"[VisionService] Warning: Failed to load face Haar Cascade: {e}", file=sys.stderr)

        # 2. Eye Cascade (haarcascade_eye.xml)
        try:
            eye_path = self._find_cascade_path('haarcascade_eye.xml')
            if eye_path:
                self.eye_cascade = cv2.CascadeClassifier(eye_path)
                self.eye_cascade_loaded = not self.eye_cascade.empty()
            else:
                self.eye_cascade = None
                self.eye_cascade_loaded = False
            if not self.eye_cascade_loaded:
                print("[VisionService] Warning: haarcascade_eye.xml not found or empty", file=sys.stderr)
        except Exception as e:
            self.eye_cascade = None
            self.eye_cascade_loaded = False
            print(f"[VisionService] Warning: Failed to load eye Haar Cascade: {e}", file=sys.stderr)

        # 3. CLAHE Contrast Enhancer (Adaptive Histogram Equalization for dim/harsh webcam lighting)
        try:
            self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        except Exception as e:
            self.clahe = None
            print(f"[VisionService] Note: CLAHE not initialized, falling back to equalizeHist: {e}", file=sys.stderr)

    def is_ready(self) -> bool:
        return OPENCV_AVAILABLE and self.face_cascade_loaded

    def is_eye_ready(self) -> bool:
        return OPENCV_AVAILABLE and self.eye_cascade_loaded

    def get_opencv_version(self) -> Optional[str]:
        if OPENCV_AVAILABLE and cv2 is not None:
            return getattr(cv2, '__version__', 'unknown')
        return None

    def decode_base64_image(self, base64_str: str) -> Optional[bytes]:
        """
        Extracts raw image bytes from either data-URL (data:image/jpeg;base64,...)
        or clean base64 strings.
        """
        try:
            if "," in base64_str:
                base64_str = base64_str.split(",", 1)[1]
            return base64.b64decode(base64_str)
        except Exception as e:
            print(f"[VisionService] Error decoding base64 image: {e}", file=sys.stderr)
            return None

    def preprocess_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, float, int, int]:
        """
        Optimized preprocessing pipeline for low-quality / older webcams:
        1. Downsamples frames exceeding 640px width for real-time latency on older hardware.
        2. Converts frame to grayscale.
        3. Applies light Gaussian smoothing (3x3) to remove webcam sensor noise/grain.
        4. Applies CLAHE (or standard histogram equalization) to handle uneven lighting,
           underexposure, or backlight typical of older webcams.
        Returns: (enhanced_gray, scale_ratio, original_width, original_height)
        """
        orig_h, orig_w = frame.shape[:2]

        if orig_w > DETECTION_TARGET_WIDTH:
            scale_ratio = float(DETECTION_TARGET_WIDTH) / float(orig_w)
            target_h = int(orig_h * scale_ratio)
            proc_frame = cv2.resize(frame, (DETECTION_TARGET_WIDTH, target_h), interpolation=cv2.INTER_AREA)
        else:
            scale_ratio = 1.0
            proc_frame = frame

        # Convert to grayscale
        gray = cv2.cvtColor(proc_frame, cv2.COLOR_BGR2GRAY)

        # Light noise reduction to eliminate high-frequency webcam sensor grain
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)

        # Contrast enhancement (CLAHE preferred for local adaptation without washing out)
        if self.clahe is not None:
            enhanced_gray = self.clahe.apply(blurred)
        else:
            enhanced_gray = cv2.equalizeHist(blurred)

        return enhanced_gray, scale_ratio, orig_w, orig_h

    def analyze_frame_bytes(self, image_bytes: bytes) -> VisionSignals:
        """
        Processes image buffer:
        1. Preprocessing: Resizing, Grayscale, Noise Reduction, Contrast Enhancement (CLAHE)
        2. Multi-face Haar Cascade detection with tuned parameters for low-res webcams
        3. Primary face identification (largest detected face area)
        4. Haar Cascade eye detection restricted strictly to the upper face ROI with local enhancement
        5. Candidate eye filtering (left vs right eye separation) to prevent false duplicates
        6. Prototype consecutive-frame blink counter (open -> closed -> open)
        7. Multiple person detection
        8. FPS and processing latency measurement
        """
        start_time = time.time()
        now_iso = datetime.now(timezone.utc).isoformat()

        if not OPENCV_AVAILABLE or not self.face_cascade_loaded:
            return VisionSignals(
                faceCount=0,
                primaryFaceDetected=False,
                multiplePersonDetected=False,
                personStatus="No Face Detected",
                blinkCount=self.blink_count,
                eyeStatus="Not Available",
                mouthStatus="not_available",
                cameraActive=False,
                explanation="OpenCV Haar Cascade classifier is not initialized",
                timestamp=now_iso
            )

        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                return VisionSignals(
                    faceCount=0,
                    primaryFaceDetected=False,
                    multiplePersonDetected=False,
                    personStatus="No Face Detected",
                    blinkCount=self.blink_count,
                    eyeStatus="Not Available",
                    mouthStatus="not_available",
                    cameraActive=False,
                    explanation="Failed to decode video frame into image matrix",
                    timestamp=now_iso
                )

            # Update FPS tracking
            now_sec = time.time()
            if self._last_frame_timestamp is not None:
                dt = now_sec - self._last_frame_timestamp
                if dt > 0.001:
                    instant_fps = 1.0 / dt
                    if self._current_fps <= 0.0:
                        self._current_fps = instant_fps
                    else:
                        self._current_fps = 0.85 * self._current_fps + 0.15 * instant_fps
            self._last_frame_timestamp = now_sec
            current_fps_rounded = round(self._current_fps, 1) if self._current_fps > 0 else None

            # 1. Preprocess Frame for Low-Quality Webcams
            enhanced_gray, scale_ratio, orig_w, orig_h = self.preprocess_frame(frame)

            # 2. Detect Faces using tuned Haar Cascade
            # scaleFactor=1.1, minNeighbors=5 balances recall on noisy frames against false positives
            raw_faces = self.face_cascade.detectMultiScale(
                enhanced_gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(40, 40),
                flags=cv2.CASCADE_SCALE_IMAGE
            )

            # Fallback pass with minNeighbors=4 if lighting is extremely dim
            if len(raw_faces) == 0:
                raw_faces = self.face_cascade.detectMultiScale(
                    enhanced_gray,
                    scaleFactor=1.1,
                    minNeighbors=4,
                    minSize=(35, 35),
                    flags=cv2.CASCADE_SCALE_IMAGE
                )

            # Sort detected faces by area (width * height) descending:
            # Largest face is designated as the primary candidate face
            faces = sorted(raw_faces, key=lambda f: f[2] * f[3], reverse=True)
            face_count = len(faces)
            primary_detected = face_count >= 1
            multiple_detected = face_count > 1

            # Person Status determination
            if face_count == 0:
                person_status = "No Face Detected"
            elif face_count == 1:
                person_status = "Single Person"
            else:
                person_status = "Multiple Persons Detected"

            # Multi-person explanation (objective decision support, never assumes misconduct)
            explanation = None
            if multiple_detected:
                explanation = "Multiple visible faces detected in camera frame. Manual review recommended."

            # Face bounding boxes mapped back to original frame dimensions
            boxes: List[BoundingBox] = []
            for idx, (fx, fy, fw, fh) in enumerate(faces):
                is_primary = (idx == 0)
                label = "Primary Face" if is_primary else f"Subject #{idx + 1}"

                # Map back to original coordinate system
                orig_x = max(0, int(fx / scale_ratio))
                orig_y = max(0, int(fy / scale_ratio))
                orig_w_box = min(orig_w - orig_x, int(fw / scale_ratio))
                orig_h_box = min(orig_h - orig_y, int(fh / scale_ratio))

                boxes.append(BoundingBox(
                    x=orig_x,
                    y=orig_y,
                    width=orig_w_box,
                    height=orig_h_box,
                    label=label,
                    isPrimary=is_primary,
                    boxType="face"
                ))

            # 3. Eye Detection & Blink Counting strictly on Primary Face
            eye_status = "Not Available"
            eye_boxes: List[BoundingBox] = []

            if not self.eye_cascade_loaded or self.eye_cascade is None:
                eye_status = "Not Available"
            elif not primary_detected:
                eye_status = "Not Available"
                # When face leaves the frame, reset closed frame counter to avoid counting absence as a blink
                self._consecutive_closed_frames = 0
                self._eyes_were_open = False
            else:
                # Primary face coordinates in enhanced_gray space
                p_fx, p_fy, p_fw, p_fh = faces[0]

                # Constrain search strictly to the anatomical eye band (18% to 58% of face height)
                # Excludes forehead/hairline above, and nostrils/mouth/chin below to prevent false positives
                eye_y_start = int(p_fh * 0.18)
                eye_y_end = int(p_fh * 0.58)
                eye_roi_h = eye_y_end - eye_y_start

                roi_gray = enhanced_gray[p_fy + eye_y_start : p_fy + eye_y_end, p_fx : p_fx + p_fw]

                if roi_gray.shape[0] > 12 and roi_gray.shape[1] > 12:
                    # Apply local contrast enhancement and light smoothing on eye ROI
                    if self.clahe is not None:
                        roi_enhanced = self.clahe.apply(roi_gray)
                    else:
                        roi_enhanced = cv2.equalizeHist(roi_gray)
                    roi_enhanced = cv2.GaussianBlur(roi_enhanced, (3, 3), 0)

                    min_eye_w = max(10, int(p_fw * 0.10))
                    min_eye_h = max(8, int(p_fh * 0.08))
                    max_eye_w = int(p_fw * 0.45)
                    max_eye_h = int(p_fh * 0.35)

                    raw_eyes = self.eye_cascade.detectMultiScale(
                        roi_enhanced,
                        scaleFactor=1.08,
                        minNeighbors=3,
                        minSize=(min_eye_w, min_eye_h),
                        maxSize=(max_eye_w, max_eye_h),
                        flags=cv2.CASCADE_SCALE_IMAGE
                    )

                    # Separate candidate eyes into left and right half of the face to prevent duplicate boxes
                    mid_x = p_fw / 2.0
                    left_candidates = []   # Viewer's left (candidate's right)
                    right_candidates = []  # Viewer's right (candidate's left)

                    for (ex, ey, ew, eh) in raw_eyes:
                        center_x = ex + (ew / 2.0)
                        if center_x < mid_x:
                            left_candidates.append((ex, ey, ew, eh))
                        else:
                            right_candidates.append((ex, ey, ew, eh))

                    # Select at most the best candidate for each half (largest box area)
                    selected_eyes = []
                    if left_candidates:
                        left_candidates.sort(key=lambda b: b[2] * b[3], reverse=True)
                        selected_eyes.append(left_candidates[0])
                    if right_candidates:
                        right_candidates.sort(key=lambda b: b[2] * b[3], reverse=True)
                        selected_eyes.append(right_candidates[0])

                    # Map selected eye coordinates back to original frame coordinate system
                    for (ex, ey, ew, eh) in selected_eyes:
                        orig_ex = max(0, int((p_fx + ex) / scale_ratio))
                        orig_ey = max(0, int((p_fy + eye_y_start + ey) / scale_ratio))
                        orig_ew = min(orig_w - orig_ex, int(ew / scale_ratio))
                        orig_eh = min(orig_h - orig_ey, int(eh / scale_ratio))

                        eye_boxes.append(BoundingBox(
                            x=orig_ex,
                            y=orig_ey,
                            width=orig_ew,
                            height=orig_eh,
                            label="Eye",
                            isPrimary=False,
                            boxType="eye"
                        ))

                    eye_count = len(selected_eyes)

                    # Determine categorical eye status string
                    if eye_count >= 2:
                        eye_status = "Both Eyes Detected"
                    elif eye_count == 1:
                        eye_status = "One Eye Detected"
                    else:
                        eye_status = "No Eyes Detected"

                    # 4. Blink Detection State Machine
                    # When at least 1 eye is clearly visible, subject's eyes are open
                    if eye_count >= 1:
                        if (
                            not self._eyes_were_open
                            and (BLINK_CLOSED_FRAMES <= self._consecutive_closed_frames <= MAX_BLINK_CLOSED_FRAMES)
                        ):
                            # Transition: open -> closed -> open detected
                            self.blink_count += 1

                        self._consecutive_closed_frames = 0
                        self._eyes_were_open = True
                    else:
                        # Eyes not visible in this frame (potential blink or looking away)
                        self._consecutive_closed_frames += 1
                        if self._consecutive_closed_frames >= BLINK_CLOSED_FRAMES:
                            self._eyes_were_open = False
                else:
                    eye_status = "No Eyes Detected"

            processing_time_ms = round((time.time() - start_time) * 1000.0, 1)

            signals = VisionSignals(
                faceCount=face_count,
                primaryFaceDetected=primary_detected,
                multiplePersonDetected=multiple_detected,
                personStatus=person_status,
                explanation=explanation,
                blinkCount=self.blink_count,
                eyeStatus=eye_status,
                mouthStatus="not_available",
                cameraActive=True,
                boundingBoxes=boxes,
                eyeBoundingBoxes=eye_boxes,
                fps=current_fps_rounded,
                processingTimeMs=processing_time_ms,
                timestamp=now_iso
            )

            self.latest_signals = signals
            return signals

        except Exception as e:
            print(f"[VisionService] Frame analysis exception: {e}", file=sys.stderr)
            return VisionSignals(
                faceCount=0,
                primaryFaceDetected=False,
                multiplePersonDetected=False,
                personStatus="No Face Detected",
                blinkCount=self.blink_count,
                eyeStatus="Not Available",
                mouthStatus="not_available",
                cameraActive=False,
                explanation=f"Computer vision processing error: {str(e)}",
                timestamp=now_iso
            )

    def draw_overlay(self, frame: np.ndarray, signals: VisionSignals) -> np.ndarray:
        """
        Draws visual HUD overlay on local camera frames:
        Face Count: X
        Eye Status: XXXXX
        Blink Count: X
        Multiple Person: YES/NO
        Camera: ACTIVE
        FPS: X
        Draws bounding boxes around primary face (cyan/green), secondary faces (amber), and eyes.
        """
        if frame is None or not OPENCV_AVAILABLE or cv2 is None:
            return frame

        annotated = frame.copy()

        # 1. Draw face bounding boxes
        for box in signals.boundingBoxes:
            color = (255, 200, 0) if box.isPrimary else (0, 165, 255) # BGR
            cv2.rectangle(annotated, (box.x, box.y), (box.x + box.width, box.y + box.height), color, 2)
            label = box.label or ("Primary Face" if box.isPrimary else "Secondary Subject")
            cv2.putText(
                annotated,
                label,
                (box.x, max(box.y - 8, 15)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                1,
                cv2.LINE_AA
            )

        # 2. Draw eye bounding boxes
        for ebox in signals.eyeBoundingBoxes:
            cv2.rectangle(
                annotated,
                (ebox.x, ebox.y),
                (ebox.x + ebox.width, ebox.y + ebox.height),
                (0, 255, 255),
                1
            )

        # 3. Simple, readable HUD panel
        hud_lines = [
            f"Face Count: {signals.faceCount}",
            f"Eye Status: {signals.eyeStatus}",
            f"Blink Count: {signals.blinkCount}",
            f"Multiple Person: {'YES' if signals.multiplePersonDetected else 'NO'}",
            f"Camera: {'ACTIVE' if signals.cameraActive else 'INACTIVE'}",
            f"FPS: {signals.fps if signals.fps is not None else 0.0}"
        ]

        # Draw dark background box for HUD
        cv2.rectangle(annotated, (10, 10), (280, 20 + len(hud_lines) * 22), (15, 15, 15), -1)
        cv2.rectangle(annotated, (10, 10), (280, 20 + len(hud_lines) * 22), (60, 60, 60), 1)

        for i, line in enumerate(hud_lines):
            y_pos = 32 + (i * 22)
            cv2.putText(
                annotated,
                line,
                (20, y_pos),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (220, 220, 220),
                1,
                cv2.LINE_AA
            )

        return annotated

    def analyze_base64_frame(self, base64_str: str) -> VisionSignals:
        image_bytes = self.decode_base64_image(base64_str)
        if not image_bytes:
            return VisionSignals(
                faceCount=0,
                primaryFaceDetected=False,
                multiplePersonDetected=False,
                personStatus="No Face Detected",
                blinkCount=self.blink_count,
                eyeStatus="Not Available",
                mouthStatus="not_available",
                cameraActive=False,
                explanation="Invalid base64 video frame provided",
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        return self.analyze_frame_bytes(image_bytes)

    def get_latest_signals(self) -> VisionSignals:
        return self.latest_signals

    def reset(self):
        """
        Resets blink counter and accumulated telemetry signals to baseline.
        """
        self.blink_count = 0
        self._consecutive_closed_frames = 0
        self._eyes_were_open = False
        self._last_frame_timestamp = None
        self._current_fps = 0.0

        self.latest_signals = VisionSignals(
            faceCount=0,
            primaryFaceDetected=False,
            multiplePersonDetected=False,
            personStatus="No Face Detected",
            blinkCount=0,
            eyeStatus="Not Available",
            mouthStatus="not_available",
            cameraActive=False,
            fps=None,
            processingTimeMs=None,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

# Global singleton instance
vision_service = VisionService()
