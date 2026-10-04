// Cleans a photo before OCR: resize -> grayscale -> contrast stretch
// -> (optional) adaptive threshold. Runs in the browser; nothing is uploaded.

const DEFAULT_MAX_SIDE = 2000;

export async function preprocessImage(
  file,
  { enabled = true, maxSide = DEFAULT_MAX_SIDE, adaptive = false } = {},
) {
  const bitmap = await createImageBitmap(file);
  // Never upscales. A bigger maxSide keeps more detail from the phone photo.
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  if (enabled) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const d = imageData.data;

    // 1. Grayscale + histogram
    const hist = new Array(256).fill(0);
    for (let i = 0; i < d.length; i += 4) {
      const gray = Math.round(
        0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2],
      );
      d[i] = d[i + 1] = d[i + 2] = gray;
      hist[gray]++;
    }

    // 2. Contrast stretch (ignore darkest/lightest 1%)
    const total = width * height;
    let low = 0,
      high = 255,
      acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= total * 0.01) {
        low = v;
        break;
      }
    }
    acc = 0;
    for (let v = 255; v >= 0; v--) {
      acc += hist[v];
      if (acc >= total * 0.01) {
        high = v;
        break;
      }
    }
    const range = Math.max(1, high - low);
    for (let i = 0; i < d.length; i += 4) {
      const s = Math.min(255, Math.max(0, ((d[i] - low) * 255) / range));
      d[i] = d[i + 1] = d[i + 2] = s;
    }

    // 3. Optional adaptive threshold: compares each pixel to the average of its
    //    neighbours, so shadows and uneven light don't turn half the page grey.
    if (adaptive) {
      const windowSize = Math.max(25, Math.round(width / 30));
      const bias = 0.9; // pixel must be 10% darker than its surroundings to count as ink
      const W = width + 1;
      const integral = new Float64Array(W * (height + 1)); // sums over rectangles in O(1)
      for (let y = 0; y < height; y++) {
        let rowSum = 0;
        for (let x = 0; x < width; x++) {
          rowSum += d[(y * width + x) * 4];
          integral[(y + 1) * W + (x + 1)] = integral[y * W + (x + 1)] + rowSum;
        }
      }
      const half = Math.floor(windowSize / 2);
      for (let y = 0; y < height; y++) {
        const y0 = Math.max(0, y - half),
          y1 = Math.min(height - 1, y + half);
        for (let x = 0; x < width; x++) {
          const x0 = Math.max(0, x - half),
            x1 = Math.min(width - 1, x + half);
          const area = (x1 - x0 + 1) * (y1 - y0 + 1);
          const sum =
            integral[(y1 + 1) * W + (x1 + 1)] -
            integral[y0 * W + (x1 + 1)] -
            integral[(y1 + 1) * W + x0] +
            integral[y0 * W + x0];
          const idx = (y * width + x) * 4;
          const v = d[idx] < (sum / area) * bias ? 0 : 255;
          d[idx] = d[idx + 1] = d[idx + 2] = v;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return canvas;
}
