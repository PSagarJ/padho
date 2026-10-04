import { LOW_WORD_THRESHOLD } from "../services/ocr";

// Phase 2 only: shows OCR text + confidence. The real Action Card comes in Phase 4.
export default function OcrResult({ result, onRetry, onBack }) {
  const percent = Math.round(result.confidence * 100);

  if (result.isEmpty) {
    return (
      <main style={styles.page}>
        <h1>I couldn't find readable text</h1>
        <p>Try moving closer or improving the light.</p>
        <button style={styles.primary} onClick={onRetry}>
          📷 Try again
        </button>
        <button style={styles.secondary} onClick={onBack}>
          🏠 Home
        </button>
      </main>
    );
  }

  const hasWordData = result.paragraphs.length > 0;
  const needsCheck = result.isLowConfidence || result.lowWordCount > 0;

  // Status = icon + text, never colour alone (UI brief)
  const statusText = result.isLowConfidence
    ? `⚠️ I'm not fully sure I read this correctly (${percent}%)`
    : result.lowWordCount > 0
      ? `⚠️ Most of this looks right (${percent}%), but please check the underlined words`
      : `✅ I read this clearly (${percent}%)`;

  return (
    <main style={styles.page}>
      <h1>Here is what I read</h1>

      <p
        role="status"
        style={{
          ...styles.badge,
          borderColor: needsCheck ? "#B8560A" : "#2E7D32",
        }}
      >
        {statusText}
      </p>

      {result.debug && (
        <p style={{ margin: 0, fontSize: 16 }}>
          Test settings: image {result.debug.width}×{result.debug.height}px,
          size={String(result.debug.maxSide)}, adaptive=
          {String(result.debug.adaptive)}, psm={String(result.debug.psm)}
        </p>
      )}

      {hasWordData ? (
        <div style={styles.text}>
          {result.paragraphs.map((words, i) => (
            <p key={i} style={{ margin: "0 0 16px" }}>
              {words.map((w, j) => (
                <span
                  key={j}
                  style={
                    w.confidence < LOW_WORD_THRESHOLD
                      ? styles.lowWord
                      : undefined
                  }
                  title={
                    w.confidence < LOW_WORD_THRESHOLD
                      ? "I'm not sure about this word"
                      : undefined
                  }
                >
                  {w.text}{" "}
                </span>
              ))}
            </p>
          ))}
        </div>
      ) : (
        <pre
          style={{
            ...styles.text,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
          }}
        >
          {result.text}
        </pre>
      )}

      <button style={styles.primary} onClick={onRetry}>
        📷 Scan again
      </button>
      <button style={styles.secondary} onClick={onBack}>
        🏠 Home
      </button>
    </main>
  );
}

const styles = {
  page: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    fontSize: 20,
  },
  badge: {
    margin: 0,
    padding: 12,
    border: "3px solid",
    borderRadius: 12,
    fontWeight: 600,
  },
  text: { fontSize: 20, lineHeight: 1.6, wordBreak: "break-word" },
  // Underline + background, so it's not colour alone
  lowWord: {
    textDecoration: "underline wavy #B8560A",
    textUnderlineOffset: 4,
    background: "#FBE9D6",
  },
  primary: {
    minHeight: 72,
    fontSize: 22,
    fontWeight: 600,
    background: "#0B6E6E",
    color: "#fff",
    border: 0,
    borderRadius: 12,
  },
  secondary: {
    minHeight: 56,
    fontSize: 18,
    fontWeight: 600,
    background: "#fff",
    color: "#1A1A1A",
    border: "2px solid #4A5A6A",
    borderRadius: 12,
  },
};
