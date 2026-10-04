// The ONLY file the UI imports for OCR. Swap the engine inside here later.
import { createWorker } from "tesseract.js";
import { preprocessImage } from "./preprocess";

// Our app language codes -> Tesseract language packs.
const LANG_MAP = {
  en: "eng",
  hi: "hin+eng",
  mr: "mar+eng",
};

export const LOW_CONFIDENCE_THRESHOLD = 0.6; // whole page (App Flow doc)
export const LOW_WORD_THRESHOLD = 0.6; // single word
const MIN_TEXT_LENGTH = 10;

// Turns Tesseract's nested output into paragraphs -> lines -> words.
// Kept inside this file so the UI never depends on Tesseract's data shape.
function extractParagraphs(data) {
  if (!Array.isArray(data.blocks)) return [];
  const paragraphs = [];
  for (const block of data.blocks) {
    for (const para of block.paragraphs ?? []) {
      const words = [];
      for (const line of para.lines ?? []) {
        for (const w of line.words ?? []) {
          const text = (w.text ?? "").trim();
          if (text) words.push({ text, confidence: (w.confidence ?? 0) / 100 });
        }
      }
      if (words.length) paragraphs.push(words);
    }
  }
  return paragraphs;
}

// DEV ONLY (remove before demo): try settings from the URL, e.g.
//   ?size=3200&adaptive=1&psm=11
function devOverrides() {
  const q = new URLSearchParams(window.location.search);
  return {
    maxSide: q.get("size") ? Number(q.get("size")) : undefined,
    adaptive: q.get("adaptive") === "1",
    psm: q.get("psm") || undefined, // 3=auto (default), 6=one block, 11=sparse text
  };
}

export async function recognizeText(
  file,
  language = "en",
  { preprocess = true, onProgress } = {},
) {
  const dev = devOverrides();
  const image = await preprocessImage(file, {
    enabled: preprocess,
    maxSide: dev.maxSide,
    adaptive: dev.adaptive,
  });

  const debug = { width: image.width, height: image.height, ...dev };

  const worker = await createWorker(LANG_MAP[language] ?? "eng", 1, {
    logger: (m) => {
      if (onProgress && m.status === "recognizing text") onProgress(m.progress);
    },
  });

  if (dev.psm) await worker.setParameters({ tessedit_pageseg_mode: dev.psm });

  try {
    // 3rd argument asks for the detailed word-level output (needed in v6+)
    const { data } = await worker.recognize(image, {}, { blocks: true });

    const text = (data.text ?? "").trim();
    const confidence = (data.confidence ?? 0) / 100;
    const paragraphs = extractParagraphs(data);
    // Dev only: lets us tune LOW_WORD_THRESHOLD from real data. Remove before demo.
    console.table(
      paragraphs
        .flat()
        .filter((w) => w.confidence < 0.85)
        .map((w) => ({
          word: w.text,
          confidence: Math.round(w.confidence * 100),
        })),
    );
    const lowWordCount = paragraphs
      .flat()
      .filter((w) => w.confidence < LOW_WORD_THRESHOLD).length;

    return {
      text,
      confidence,
      debug,
      paragraphs, // [[{text, confidence}, ...], ...]  (empty if word data unavailable)
      lowWordCount,
      isEmpty: text.length < MIN_TEXT_LENGTH,
      isLowConfidence: confidence < LOW_CONFIDENCE_THRESHOLD,
    };
  } finally {
    await worker.terminate();
  }
}
