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
  if (text.length === 1 && !/[aAiI0-9\p{sc=Devanagari}₹$]/u.test(text)) {
    return "";
  }

  return text;
}

/**
 * Well-known abbreviations and initialisms in Indian documents, forms, and medicine
 */
const ABBREVIATIONS_MAP = {
  // Common Acronyms
  API: "A. P. I.",
  OTP: "O. T. P.",
  PIN: "P. I. N.",
  PAN: "P. A. N.",
  PDF: "P. D. F.",
  SMS: "S. M. S.",
  URL: "U. R. L.",
  KYC: "K. Y. C.",
  GST: "G. S. T.",
  RTO: "R. T. O.",
  ATM: "A. T. M.",
  SIM: "S. I. M.",
  ID: "I. D.",
  DL: "D. L.",
  DOB: "D. O. B.",
  FIR: "F. I. R.",
  UPI: "U. P. I.",
  PWA: "P. W. A.",
  FAQ: "F. A. Q.",
  UIDAI: "U. I. D. A. I.",
  IFSC: "I. F. S. C.",
  MICR: "M. I. C. R.",
  EPFO: "E. P. F. O.",
  SBI: "S. B. I.",
  HDFC: "H. D. F. C.",
  ICICI: "I. C. I. C. I.",
  LIC: "L. I. C.",
  BSNL: "B. S. N. L.",

  // Common Form & Bill terms
  "A/C": "Account",
  "A/C.": "Account",
  AC: "A. C.",
  NO: "Number",
  "NO.": "Number",
  NOS: "Numbers",
  "NOS.": "Numbers",
  MOB: "Mobile",
  "MOB.": "Mobile",
  TEL: "Telephone",
  "TEL.": "Telephone",
  DR: "Doctor",
  "DR.": "Doctor",
  MR: "Mister",
  "MR.": "Mister",
  MRS: "Missus",
  "MRS.": "Missus",
  RS: "Rupees",
  "RS.": "Rupees",
  INR: "Rupees",
  GOVT: "Government",
  "GOVT.": "Government",
  PVT: "Private",
  "PVT.": "Private",
  LTD: "Limited",
  "LTD.": "Limited",
  MFG: "Manufacturing",
  "MFG.": "Manufacturing",
  EXP: "Expiry",
  "EXP.": "Expiry",

  // Medicine Dosage units
  TAB: "tablet",
  "TAB.": "tablet",
  CAP: "capsule",
  "CAP.": "capsule",
  MG: "milligrams",
  ML: "milliliters",
  KG: "kilograms",
  GM: "grams",
};

/**
 * Transforms a token into natural, letter-by-letter or expanded speech for TTS.
 * E.g.: "API" -> "A. P. I.", "A/C" -> "Account", "₹500" -> "500 Rupees"
 */
// Abbreviations that may be written "No." / "Rs." in mixed case, but only WITH a period
const MIXED_CASE_WITH_PERIOD = new Set([
  "NO",
  "NOS",
  "MOB",
  "TEL",
  "DR",
  "MR",
  "MRS",
  "RS",
  "GOVT",
  "PVT",
  "LTD",
  "MFG",
  "EXP",
  "TAB",
  "CAP",
]);

// Ordinary all-caps words that must NOT be spelled letter by letter
const COMMON_CAPS_WORDS = new Set([
  "NAME",
  "DATE",
  "FORM",
  "BANK",
  "CITY",
  "TYPE",
  "CODE",
  "YEAR",
  "STATE",
  "MALE",
  "SIGN",
  "SELF",
  "SEX",
  "AGE",
  "FROM",
  "WITH",
  "AND",
  "THE",
  "FOR",
  "NOT",
  "ALL",
  "YES",
  "OR",
  "OF",
  "TO",
  "IN",
  "ON",
  "BY",
  "AT",
]);

export function formatWordForSpeech(word) {
  if (!word) return "";

  const matchPunct = word.match(/([.,;:!?]+)$/);
  const trailingPunct = matchPunct ? matchPunct[1] : "";
  const core = trailingPunct ? word.slice(0, -trailingPunct.length) : word;
  const upperCore = core.toUpperCase();
  const isUpper = core === upperCore;
  const hasPeriod = trailingPunct.includes(".");
  const tail = trailingPunct ? " " : "";

  // 1. Dictionary: only if written in capitals, or "No." style with a period.
  //    A plain lowercase "no" or "cap" is left alone.
  const mapped = ABBREVIATIONS_MAP[upperCore];
  if (
    mapped &&
    (isUpper || (hasPeriod && MIXED_CASE_WITH_PERIOD.has(upperCore)))
  ) {
    return mapped + tail;
  }

  // 2. Currency (₹500 or Rs.500)
  if (core.startsWith("₹") || core.startsWith("Rs.")) {
    const num = core.replace(/^₹|Rs\.?/i, "").trim();
    return `${num} Rupees${tail}`;
  }

  // 3. Unknown 2-5 letter capitals are spelled out, unless they are ordinary words
  if (/^[A-Z]{2,5}$/.test(core) && !COMMON_CAPS_WORDS.has(core)) {
    return core.split("").join(". ") + "." + tail;
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

// ---------- Box noise: empty one-character boxes read as junk ----------
const stripMarks = (s) => s.replace(/[[\]()|.,:;'"!?]/g, "");
const BOX_LETTERS = /^[ITilrL1|7]+$/; // letters that comb boxes usually turn into

function classify(word) {
  const raw = typeof word === "string" ? word : word.text;
  const conf = typeof word === "object" ? (word.confidence ?? 1) : 1;
  const t = stripMarks(String(raw || "").trim());
  const len = [...t].length;

  if (!t) return { strong: true, weak: true };

  // 11111, rr, ऽऽऽ: the same character repeated; or TUTTI, TIT, 1lI
  const strong =
    (len >= 2 && /^(.)\1+$/u.test(t)) || (len >= 3 && BOX_LETTERS.test(t));

  // Very short and either unsure, a lone character, or digits only
  const weak = len <= 2 && (conf < 0.8 || len === 1 || /^\d+$/.test(t));

  return { strong, weak: strong || weak };
}

// Returns a Set of word positions (in one paragraph) that look like empty boxes.
// A run of 3+ suspicious tokens is dropped; a lone strong one is dropped too.
export function findBoxNoise(words) {
  const flags = words.map(classify);
  const skip = new Set();
  let i = 0;
  while (i < flags.length) {
    if (!flags[i].weak) {
      i++;
      continue;
    }
    let j = i;
    while (j < flags.length && flags[j].weak) j++;
    if (j - i >= 3) {
      for (let k = i; k < j; k++) skip.add(k);
    } else {
      for (let k = i; k < j; k++) if (flags[k].strong) skip.add(k);
    }
    i = j;
  }
  return skip;
}
