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
const MIN_READABLE_RATIO = 0.3; // rough guess; tune in Phase 7

// Turns Tesseract's nested output into paragraphs -> words.
// Kept here so the UI never depends on Tesseract's data shape.
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

// Rough check that OCR output contains real words, not stray marks like "| I l".
function readableRatio(text) {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;
  const good = tokens.filter((t) => /[\p{L}\p{M}]{3,}/u.test(t)).length;
  return good / tokens.length;
}

// DEV ONLY: settings from the URL for Phase 7 experiments, e.g.
//   ?psm=11            sparse text mode (better for box-heavy forms)
//   ?size=3200         longer image side in px (never upscales)
//   ?adaptive=1        adaptive threshold (lowered confidence in our tests)
//   ?debug=1           show test settings + the cleaned image on the result screen
function devOverrides() {
  const q = new URLSearchParams(window.location.search);
  return {
    maxSide: q.get("size") ? Number(q.get("size")) : undefined,
    adaptive: q.get("adaptive") === "1",
    psm: q.get("psm") || undefined,
    debug: q.get("debug") === "1",
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

  const worker = await createWorker(LANG_MAP[language] ?? "eng", 1, {
    logger: (m) => {
      if (onProgress && m.status === "recognizing text") onProgress(m.progress);
    },
  });

  try {
    if (dev.psm) await worker.setParameters({ tessedit_pageseg_mode: dev.psm });

    // 3rd argument asks for word-level output (needed in tesseract.js v6+)
    const { data } = await worker.recognize(image, {}, { blocks: true });

    const text = (data.text ?? "").trim();
    const confidence = (data.confidence ?? 0) / 100;
    const paragraphs = extractParagraphs(data);
    const lowWordCount = paragraphs
      .flat()
      .filter((w) => w.confidence < LOW_WORD_THRESHOLD).length;

    return {
      text,
      confidence,
      paragraphs,
      lowWordCount,
      isEmpty:
        text.length < MIN_TEXT_LENGTH ||
        readableRatio(text) < MIN_READABLE_RATIO,
      isLowConfidence: confidence < LOW_CONFIDENCE_THRESHOLD,
      debug: dev.debug
        ? {
            width: image.width,
            height: image.height,
            maxSide: dev.maxSide,
            adaptive: dev.adaptive,
            psm: dev.psm,
            preview: image.toDataURL("image/jpeg", 0.5),
          }
        : null,
    };
  } finally {
    await worker.terminate();
  }
}
