// Web Speech API wrapper for Padho per Phase 3 requirements

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
        const text = typeof w === "string" ? w : w.text;
        const confidence = typeof w === "object" ? w.confidence ?? 1 : 1;
        const start = charOffset;
        const end = start + text.length;

        tokens.push({
          text,
          confidence,
          pIndex,
          wIndex,
          globalIndex: tokens.length,
          start,
          end,
        });

        fullText += text + " ";
        charOffset += text.length + 1;
      });
    });
  } else if (fallbackText) {
    // If no word-level data was available from OCR, split text
    const words = fallbackText.trim().split(/\s+/).filter(Boolean);
    words.forEach((text) => {
      const start = charOffset;
      const end = start + text.length;
      tokens.push({
        text,
        confidence: 1,
        pIndex: 0,
        wIndex: tokens.length,
        globalIndex: tokens.length,
        start,
        end,
      });
      fullText += text + " ";
      charOffset += text.length + 1;
    });
  }

  return { tokens, fullText: fullText.trim() };
}
