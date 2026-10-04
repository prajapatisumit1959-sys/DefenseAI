/**
 * Pico Face Detector TypeScript implementation
 * Ported from Pico.js (MIT License, Nenad Markuš)
 * Highly optimized for real-time in-browser face detection.
 */

export type ClassifyRegionFn = (
  r: number,
  c: number,
  s: number,
  pixels: Uint8Array,
  ldim: number
) => number;

export interface DetectionParams {
  shiftfactor: number;
  minsize: number;
  maxsize: number;
  scalefactor: number;
}

export type RawDetection = [number, number, number, number]; // [r, c, size, score]

export interface FaceDetectionResult {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export function unpackCascade(bytes: Uint8Array): ClassifyRegionFn {
  const dview = new DataView(new ArrayBuffer(4));
  let p = 8;

  dview.setUint8(0, bytes[p + 0]);
  dview.setUint8(1, bytes[p + 1]);
  dview.setUint8(2, bytes[p + 2]);
  dview.setUint8(3, bytes[p + 3]);
  const tdepth = dview.getInt32(0, true);
  p += 4;

  dview.setUint8(0, bytes[p + 0]);
  dview.setUint8(1, bytes[p + 1]);
  dview.setUint8(2, bytes[p + 2]);
  dview.setUint8(3, bytes[p + 3]);
  const ntrees = dview.getInt32(0, true);
  p += 4;

  const tcodes_ls: number[] = [];
  const tpreds_ls: number[] = [];
  const thresh_ls: number[] = [];

  const pow2tdepth = Math.pow(2, tdepth) >> 0;
  const tcodes_len = 4 * pow2tdepth - 4;

  for (let t = 0; t < ntrees; ++t) {
    tcodes_ls.push(0, 0, 0, 0);
    for (let i = 0; i < tcodes_len; ++i) {
      tcodes_ls.push(bytes[p + i]);
    }
    p += tcodes_len;

    for (let i = 0; i < pow2tdepth; ++i) {
      dview.setUint8(0, bytes[p + 0]);
      dview.setUint8(1, bytes[p + 1]);
      dview.setUint8(2, bytes[p + 2]);
      dview.setUint8(3, bytes[p + 3]);
      tpreds_ls.push(dview.getFloat32(0, true));
      p += 4;
    }

    dview.setUint8(0, bytes[p + 0]);
    dview.setUint8(1, bytes[p + 1]);
    dview.setUint8(2, bytes[p + 2]);
    dview.setUint8(3, bytes[p + 3]);
    thresh_ls.push(dview.getFloat32(0, true));
    p += 4;
  }

  const tcodes = new Int8Array(tcodes_ls);
  const tpreds = new Float32Array(tpreds_ls);
  const thresh = new Float32Array(thresh_ls);

  return function classifyRegion(
    r: number,
    c: number,
    s: number,
    pixels: Uint8Array,
    ldim: number
  ): number {
    r = (256 * r) >> 0;
    c = (256 * c) >> 0;
    let root = 0;
    let o = 0.0;

    for (let i = 0; i < ntrees; ++i) {
      let idx = 1;
      for (let j = 0; j < tdepth; ++j) {
        const root4 = root + 4 * idx;
        const r1 = (r + tcodes[root4 + 0] * s) >> 8;
        const c1 = (c + tcodes[root4 + 1] * s) >> 8;
        const r2 = (r + tcodes[root4 + 2] * s) >> 8;
        const c2 = (c + tcodes[root4 + 3] * s) >> 8;
        idx =
          2 * idx +
          (pixels[r1 * ldim + c1] <= pixels[r2 * ldim + c2] ? 1 : 0);
      }

      o += tpreds[pow2tdepth * i + idx - pow2tdepth];
      if (o <= thresh[i]) return -1.0;
      root += 4 * pow2tdepth;
    }
    return o - thresh[ntrees - 1];
  };
}

export function runCascade(
  image: { pixels: Uint8Array; nrows: number; ncols: number; ldim: number },
  classifyRegion: ClassifyRegionFn,
  params: DetectionParams
): RawDetection[] {
  const { pixels, nrows, ncols, ldim } = image;
  const { shiftfactor, minsize, maxsize, scalefactor } = params;

  let scale = minsize;
  const detections: RawDetection[] = [];

  while (scale <= maxsize) {
    const step = Math.max((shiftfactor * scale) >> 0, 1);
    const offset = ((scale / 2 + 1) >> 0);

    for (let r = offset; r <= nrows - offset; r += step) {
      for (let c = offset; c <= ncols - offset; c += step) {
        const q = classifyRegion(r, c, scale, pixels, ldim);
        if (q > 0.0) {
          detections.push([r, c, scale, q]);
        }
      }
    }
    scale *= scalefactor;
  }

  return detections;
}

export function clusterDetections(
  dets: RawDetection[],
  iouThreshold = 0.2
): RawDetection[] {
  dets.sort((a, b) => b[3] - a[3]);

  function calculateIoU(det1: RawDetection, det2: RawDetection): number {
    const r1 = det1[0],
      c1 = det1[1],
      s1 = det1[2];
    const r2 = det2[0],
      c2 = det2[1],
      s2 = det2[2];
    const overr = Math.max(
      0,
      Math.min(r1 + s1 / 2, r2 + s2 / 2) - Math.max(r1 - s1 / 2, r2 - s2 / 2)
    );
    const overc = Math.max(
      0,
      Math.min(c1 + s1 / 2, c2 + s2 / 2) - Math.max(c1 - s1 / 2, c2 - s2 / 2)
    );
    return (overr * overc) / (s1 * s1 + s2 * s2 - overr * overc);
  }

  const assignments = new Uint8Array(dets.length);
  const clusters: RawDetection[] = [];

  for (let i = 0; i < dets.length; ++i) {
    if (assignments[i] === 0) {
      let r = 0.0,
        c = 0.0,
        s = 0.0,
        q = 0.0,
        n = 0;
      for (let j = i; j < dets.length; ++j) {
        if (calculateIoU(dets[i], dets[j]) > iouThreshold) {
          assignments[j] = 1;
          r += dets[j][0];
          c += dets[j][1];
          s += dets[j][2];
          q += dets[j][3];
          n += 1;
        }
      }
      clusters.push([r / n, c / n, s / n, q]);
    }
  }

  return clusters;
}

export function instantiateDetectionMemory(size = 3) {
  let n = 0;
  const memory: RawDetection[][] = [];
  for (let i = 0; i < size; ++i) memory.push([]);

  return function updateMemory(dets: RawDetection[]): RawDetection[] {
    memory[n] = dets;
    n = (n + 1) % memory.length;
    let combined: RawDetection[] = [];
    for (let i = 0; i < memory.length; ++i) {
      combined = combined.concat(memory[i]);
    }
    return combined;
  };
}

export function rgbaToGrayscale(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number
): Uint8Array {
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < width * height; ++i) {
    const idx = i * 4;
    // Standard luminosity weights: 0.299 R + 0.587 G + 0.114 B
    gray[i] = (rgba[idx] * 77 + rgba[idx + 1] * 150 + rgba[idx + 2] * 29) >> 8;
  }
  return gray;
}
