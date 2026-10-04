import { BoundingBox } from '../types/vision';

export interface EyeAnalysisResult {
  leftEyeDetected: boolean;
  rightEyeDetected: boolean;
  eyeDetected: boolean;
  leftOpenness: number;
  rightOpenness: number;
  eyeOpenness: number;
  eyeStatus: 'Both Eyes Detected' | 'One Eye Detected' | 'No Eyes Detected' | 'Not Available';
  eyeBoundingBoxes: BoundingBox[];
}

/**
 * Computes an authentic continuous eye openness measurement (0.0 to 1.0)
 * based on the contrast between the dark central pupil valley and the bright sclera/cornea,
 * factoring in standard deviation of pixel luminance inside the palpebral aperture.
 */
function computeApertureOpenness(
  pixels: Uint8Array,
  imageWidth: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): { openness: number; mean: number; stdDev: number } {
  const vals: number[] = [];
  let sum = 0;

  for (let y = 0; y < rh; ++y) {
    const rowOffset = (ry + y) * imageWidth;
    for (let x = 0; x < rw; ++x) {
      const v = pixels[rowOffset + rx + x];
      vals.push(v);
      sum += v;
    }
  }

  if (vals.length === 0) {
    return { openness: 0, mean: 0, stdDev: 0 };
  }

  vals.sort((a, b) => a - b);
  const mean = sum / vals.length;

  // 10th percentile luminance represents the dark iris/pupil
  const pDark = vals[Math.floor(vals.length * 0.10)];
  // 90th percentile luminance represents the bright sclera
  const pBright = vals[Math.floor(vals.length * 0.90)];

  let varianceSum = 0;
  for (let i = 0; i < vals.length; ++i) {
    const diff = vals[i] - mean;
    varianceSum += diff * diff;
  }
  const stdDev = Math.sqrt(varianceSum / vals.length);

  // Palpebral contrast ratio
  const contrast = (pBright - pDark) / (pBright + 1);

  // Pupil core vs peripheral wing calculation
  // Pupil is located in the horizontal middle (25% to 75%) and vertical upper-mid (15% to 75%)
  const coreX1 = rx + Math.round(rw * 0.25);
  const coreX2 = rx + Math.round(rw * 0.75);
  const coreY1 = ry + Math.round(rh * 0.15);
  const coreY2 = ry + Math.round(rh * 0.75);

  let coreSum = 0;
  let coreCount = 0;
  for (let y = coreY1; y <= coreY2; ++y) {
    const rowOffset = y * imageWidth;
    for (let x = coreX1; x <= coreX2; ++x) {
      coreSum += pixels[rowOffset + x];
      coreCount++;
    }
  }
  const coreMean = coreSum / (coreCount || 1);

  let wingSum = 0;
  let wingCount = 0;
  for (let y = coreY1; y <= coreY2; ++y) {
    const rowOffset = y * imageWidth;
    for (let x = rx; x < coreX1; ++x) {
      wingSum += pixels[rowOffset + x];
      wingCount++;
    }
    for (let x = coreX2 + 1; x < rx + rw; ++x) {
      wingSum += pixels[rowOffset + x];
      wingCount++;
    }
  }
  const wingMean = wingSum / (wingCount || 1);

  // Valley ratio: how much darker is the central pupil compared to surrounding sclera?
  // When eye is open: pupil is a deep dark valley -> valleyRatio ~ 0.25 to 0.45
  // When eye is closed: eyelid covers pupil -> valleyRatio ~ 0.00 to 0.08
  const valleyRatio = Math.max(0, (wingMean - coreMean) / (wingMean + 1));

  // Combined real openness measurement (open ~0.60-0.85, closed ~0.08-0.22)
  const openness = Math.min(1.0, Math.max(0.0, valleyRatio * 1.6 + contrast * 0.45));

  return {
    openness: Math.round(openness * 100) / 100,
    mean,
    stdDev,
  };
}

/**
 * Analyzes eye regions within the detected primary face bounding box.
 * Computes real continuous eye openness metrics and classifies Both/One/No eyes detected.
 */
export function analyzeEyes(
  grayPixels: Uint8Array,
  imageWidth: number,
  imageHeight: number,
  faceBox: { x: number; y: number; width: number; height: number }
): EyeAnalysisResult {
  const { x: fx, y: fy, width: fw, height: fh } = faceBox;

  // Anatomical eye band: upper 20% to 48% of the face height
  const eyeY = Math.max(0, Math.round(fy + fh * 0.22));
  const eyeH = Math.min(imageHeight - eyeY, Math.round(fh * 0.24));

  // Left Eye Region (from viewer perspective, candidate's right eye)
  const leftEyeX = Math.max(0, Math.round(fx + fw * 0.16));
  const leftEyeW = Math.min(imageWidth - leftEyeX, Math.round(fw * 0.30));

  // Right Eye Region (from viewer perspective, candidate's left eye)
  const rightEyeX = Math.max(0, Math.round(fx + fw * 0.54));
  const rightEyeW = Math.min(imageWidth - rightEyeX, Math.round(fw * 0.30));

  if (eyeH < 4 || leftEyeW < 4 || rightEyeW < 4) {
    return {
      leftEyeDetected: false,
      rightEyeDetected: false,
      eyeDetected: false,
      leftOpenness: 0,
      rightOpenness: 0,
      eyeOpenness: 0,
      eyeStatus: 'Not Available',
      eyeBoundingBoxes: [],
    };
  }

  // Focus specifically on the palpebral aperture band (excludes the eyebrow at the top)
  const apertureY = eyeY + Math.round(eyeH * 0.32);
  const apertureH = Math.max(3, Math.round(eyeH * 0.58));

  const leftApertureX = leftEyeX + Math.round(leftEyeW * 0.10);
  const leftApertureW = Math.max(3, Math.round(leftEyeW * 0.80));

  const rightApertureX = rightEyeX + Math.round(rightEyeW * 0.10);
  const rightApertureW = Math.max(3, Math.round(rightEyeW * 0.80));

  const leftResult = computeApertureOpenness(
    grayPixels,
    imageWidth,
    leftApertureX,
    apertureY,
    leftApertureW,
    apertureH
  );

  const rightResult = computeApertureOpenness(
    grayPixels,
    imageWidth,
    rightApertureX,
    apertureY,
    rightApertureW,
    apertureH
  );

  // An eye is classified as detected/open when openness >= 0.26
  const leftOpen = leftResult.openness >= 0.26;
  const rightOpen = rightResult.openness >= 0.26;
  const eyeDetected = true; // Eye ROIs were located within primary face

  // Aggregate eye openness (average of both eyes, or the more visible eye)
  const eyeOpenness = Math.round(((leftResult.openness + rightResult.openness) / 2) * 100) / 100;

  const eyeBoundingBoxes: BoundingBox[] = [];

  // Left Eye box
  eyeBoundingBoxes.push({
    x: leftEyeX,
    y: eyeY,
    width: leftEyeW,
    height: eyeH,
    label: leftOpen ? 'Left Eye (Open)' : 'Left Eye (Closed)',
    boxType: 'eye',
  });

  // Right Eye box
  eyeBoundingBoxes.push({
    x: rightEyeX,
    y: eyeY,
    width: rightEyeW,
    height: eyeH,
    label: rightOpen ? 'Right Eye (Open)' : 'Right Eye (Closed)',
    boxType: 'eye',
  });

  let eyeStatus: 'Both Eyes Detected' | 'One Eye Detected' | 'No Eyes Detected' | 'Not Available';
  if (leftOpen && rightOpen) {
    eyeStatus = 'Both Eyes Detected';
  } else if (leftOpen || rightOpen) {
    eyeStatus = 'One Eye Detected';
  } else {
    eyeStatus = 'No Eyes Detected';
  }

  return {
    leftEyeDetected: leftOpen,
    rightEyeDetected: rightOpen,
    eyeDetected,
    leftOpenness: leftResult.openness,
    rightOpenness: rightResult.openness,
    eyeOpenness,
    eyeStatus,
    eyeBoundingBoxes,
  };
}
