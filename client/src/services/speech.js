// Web Speech API wrapper for Padho per Phase 3 requirements
import { cleanOcrWord, formatWordForSpeech } from "./textSanitizer";

export const isSpeechSupported = () => {
  return typeof window !== "undefined" && "speechSynthesis" in window;
};

// Map app language code to BCP 47 locale preferences
export const LANG_LOCALES = {
  en: ["en-IN", "en-US", "en-GB", "en"],
  hi: ["hi-IN", "hi"],
  mr: ["mr-IN", "mr", "hi-IN", "hi"], // fallback to Hindi if Marathi voice absent
};

/**
 * Returns available voices, filtered/prioritized for the given language.
 */
export function getVoicesForLanguage(langCode = "en") {
  if (!isSpeechSupported()) return [];
  const allVoices = window.speechSynthesis.getVoices();
  const preferredLocales = LANG_LOCALES[langCode] || [langCode];

  // Sort matching voices to top
  const matched = [];
  const others = [];

  for (const voice of allVoices) {
    const vLang = voice.lang.toLowerCase();
    const isPref = preferredLocales.some((pref) =>
      vLang.startsWith(pref.toLowerCase())
    );
    if (isPref) {
      matched.push(voice);
    } else {
      others.push(voice);
    }
  }

  return [...matched, ...others];
}

/**
 * Prepares paragraph word tokens into a flat indexed list with character offsets.
 * Automatically cleans stray OCR symbols and expands acronyms ("API" -> "A. P. I.")
 * for natural letter-by-letter speech playback while keeping visual text clean.
 */
export function prepareSpokenTokens(paragraphs, fallbackText = "") {
  const tokens = [];
  let fullText = "";
  let charOffset = 0;

  if (Array.isArray(paragraphs) && paragraphs.length > 0) {
    paragraphs.forEach((words, pIndex) => {
      if (pIndex > 0) {
        fullText += "\n";
        charOffset += 1;
      }
      words.forEach((w, wIndex) => {
        const raw = typeof w === "string" ? w : w.text;
        const text = cleanOcrWord(raw);
        if (!text) return; // Drop pure noise/stray characters

        const confidence = typeof w === "object" ? w.confidence ?? 1 : 1;
        // Phonetically format acronyms ("API" -> "A. P. I.") and abbreviations ("A/C" -> "Account")
        const spokenWord = formatWordForSpeech(text);

        const start = charOffset;
        const end = start + spokenWord.length;

        tokens.push({
          text, // Shown on screen
          spokenText: spokenWord, // Read by Web Speech API
          confidence,
          pIndex,
          wIndex,
          globalIndex: tokens.length,
          start,
          end,
        });

        fullText += spokenWord + " ";
        charOffset += spokenWord.length + 1;
      });
    });
  } else if (fallbackText) {
    const words = fallbackText.trim().split(/\s+/).filter(Boolean);
    words.forEach((raw) => {
      const text = cleanOcrWord(raw);
      if (!text) return;

      const spokenWord = formatWordForSpeech(text);
      const start = charOffset;
      const end = start + spokenWord.length;

      tokens.push({
        text,
        spokenText: spokenWord,
        confidence: 1,
        pIndex: 0,
        wIndex: tokens.length,
        globalIndex: tokens.length,
        start,
        end,
      });

      fullText += spokenWord + " ";
      charOffset += spokenWord.length + 1;
    });
  }

  return { tokens, fullText: fullText.trim() };
}
