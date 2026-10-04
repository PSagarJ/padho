// Cleans a photo before OCR: resize -> grayscale -> contrast stretch.
// Runs entirely in the browser using a <canvas>. Nothing is uploaded.

const MAX_SIDE = 2000; // phone photos are huge (4000px+); this keeps OCR fast

export async function preprocessImage(file, { enabled = true } = {}) {
  const bitmap = await createImageBitmap(file); // respects EXIF rotation in modern Chrome
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
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

    // 1. Grayscale + build a histogram
    const hist = new Array(256).fill(0);
    for (let i = 0; i < d.length; i += 4) {
      const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
      d[i] = d[i + 1] = d[i + 2] = gray;
      hist[gray]++;
    }

    // 2. Contrast stretch: ignore the darkest/lightest 1% so one speck
    //    of dust or glare doesn't ruin the range.
    const total = width * height;
    let low = 0, high = 255, acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= total * 0.01) { low = v; break; }
    }
    acc = 0;
    for (let v = 255; v >= 0; v--) {
      acc += hist[v];
      if (acc >= total * 0.01) { high = v; break; }
    }
    const range = Math.max(1, high - low);
    for (let i = 0; i < d.length; i += 4) {
      const stretched = Math.min(255, Math.max(0, ((d[i] - low) * 255) / range));
      d[i] = d[i + 1] = d[i + 2] = stretched;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas; // Tesseract accepts a canvas directly
}