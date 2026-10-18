// Clean OCR garbage symbols and format terms for natural text-to-speech

const NOISE_CHAR_REGEX = /^[|~^@<>{}\\_=+*#`°§¢€•—]+$/;
const LEADING_NOISE = /^[|~^@<>{}\\_=+*#`°§¢€•—]+/;
const TRAILING_NOISE = /[|~^@<>{}\\_=+*#`°§¢€•—]+$/;

/**
 * Sanitizes an OCR token, stripping stray margin/border noise.
 * Returns empty string if the token is pure noise/garbage.
 */
export function cleanOcrWord(rawText) {
  if (!rawText) return "";
  let text = String(rawText).trim();

  // Strip leading and trailing noise artifacts like |word| or ~word
  text = text.replace(LEADING_NOISE, "").replace(TRAILING_NOISE, "");

  // If empty or matches pure noise symbol regex
  if (!text || NOISE_CHAR_REGEX.test(text)) return "";

  // Drop isolated single punctuation characters that have no meaning alone
  if (/^[,;:~^`'"|\\/<>[\]{}]$/.test(text)) return "";

  // Drop single-letter OCR noise that isn't a valid English letter, digit, Devanagari character, or currency
  if (
    text.length === 1 &&
    !/[aAiI0-9\p{sc=Devanagari}₹$]/u.test(text)
  ) {
    return "";
  }

  return text;
}

/**
 * Well-known abbreviations and initialisms in Indian documents, forms, and medicine
 */
const ABBREVIATIONS_MAP = {
  // Common Acronyms
  "API": "A. P. I.",
  "OTP": "O. T. P.",
  "PIN": "P. I. N.",
  "PAN": "P. A. N.",
  "PDF": "P. D. F.",
  "SMS": "S. M. S.",
  "URL": "U. R. L.",
  "KYC": "K. Y. C.",
  "GST": "G. S. T.",
  "RTO": "R. T. O.",
  "ATM": "A. T. M.",
  "SIM": "S. I. M.",
  "ID": "I. D.",
  "DL": "D. L.",
  "DOB": "D. O. B.",
  "FIR": "F. I. R.",
  "UPI": "U. P. I.",
  "PWA": "P. W. A.",
  "FAQ": "F. A. Q.",
  "UIDAI": "U. I. D. A. I.",
  "IFSC": "I. F. S. C.",
  "MICR": "M. I. C. R.",
  "EPFO": "E. P. F. O.",
  "SBI": "S. B. I.",
  "HDFC": "H. D. F. C.",
  "ICICI": "I. C. I. C. I.",
  "LIC": "L. I. C.",
  "BSNL": "B. S. N. L.",

  // Common Form & Bill terms
  "A/C": "Account",
  "A/C.": "Account",
  "AC": "A. C.",
  "NO": "Number",
  "NO.": "Number",
  "NOS": "Numbers",
  "NOS.": "Numbers",
  "MOB": "Mobile",
  "MOB.": "Mobile",
  "TEL": "Telephone",
  "TEL.": "Telephone",
  "DR": "Doctor",
  "DR.": "Doctor",
  "MR": "Mister",
  "MR.": "Mister",
  "MRS": "Missus",
  "MRS.": "Missus",
  "RS": "Rupees",
  "RS.": "Rupees",
  "INR": "Rupees",
  "GOVT": "Government",
  "GOVT.": "Government",
  "PVT": "Private",
  "PVT.": "Private",
  "LTD": "Limited",
  "LTD.": "Limited",
  "MFG": "Manufacturing",
  "MFG.": "Manufacturing",
  "EXP": "Expiry",
  "EXP.": "Expiry",

  // Medicine Dosage units
  "TAB": "tablet",
  "TAB.": "tablet",
  "CAP": "capsule",
  "CAP.": "capsule",
  "MG": "milligrams",
  "ML": "milliliters",
  "KG": "kilograms",
  "GM": "grams",
};

/**
 * Transforms a token into natural, letter-by-letter or expanded speech for TTS.
 * E.g.: "API" -> "A. P. I.", "A/C" -> "Account", "₹500" -> "500 Rupees"
 */
export function formatWordForSpeech(word) {
  if (!word) return "";

  // Strip trailing punctuation for dictionary lookup (e.g. "API," -> lookup "API")
  const matchPunct = word.match(/([.,;:!?]+)$/);
  const trailingPunct = matchPunct ? matchPunct[1] : "";
  const core = trailingPunct ? word.slice(0, -trailingPunct.length) : word;
  const upperCore = core.toUpperCase();

  // 1. Check abbreviation dictionary
  if (ABBREVIATIONS_MAP[upperCore]) {
    return ABBREVIATIONS_MAP[upperCore] + (trailingPunct ? " " : "");
  }

  // 2. Currency symbol prefix (e.g. ₹500 or $50)
  if (core.startsWith("₹") || core.startsWith("Rs.")) {
    const num = core.replace(/^₹|Rs\.?/i, "").trim();
    return `${num} Rupees${trailingPunct ? " " : ""}`;
  }

  // 3. Any all-caps acronym of 2 to 5 letters (e.g. KYC, NGO, AI, RTGS, CPU)
  // Spell it out letter by letter with periods so the TTS engine speaks each letter individually
  if (/^[A-Z]{2,5}$/.test(core)) {
    const spelledOut = core.split("").join(". ") + ".";
    return spelledOut + (trailingPunct ? " " : "");
  }

  return word;
}

/**
 * Cleans an entire paragraphs array from OCR, dropping garbage tokens.
 */
export function sanitizeParagraphs(paragraphs) {
  if (!Array.isArray(paragraphs)) return [];
  const cleanParas = [];

  for (const para of paragraphs) {
    const cleanWords = [];
    for (const w of para) {
      const originalText = typeof w === "string" ? w : w.text;
      const clean = cleanOcrWord(originalText);
      if (clean) {
        cleanWords.push({
          text: clean,
          confidence: typeof w === "object" ? w.confidence : 1,
        });
      }
    }
    if (cleanWords.length > 0) {
      cleanParas.push(cleanWords);
    }
  }

  return cleanParas;
}
