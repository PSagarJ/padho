import { LOW_WORD_THRESHOLD } from "../services/ocr";
import { useSettings } from "../context/useSettings";

// Shows OCR text + confidence, and provides primary entry into Reader View (Phase 3)
export default function OcrResult({ result, onOpenReader, onRetry, onBack }) {
  const { contrast, fontSize } = useSettings();
  const isHigh = contrast === "high";
  const percent = Math.round(result.confidence * 100);

  if (result.isEmpty) {
    return (
      <main
        style={{
          ...styles.page,
          backgroundColor: isHigh ? "#000000" : "#FAF8F3",
          color: isHigh ? "#FFFFFF" : "#1A1A1A",
        }}
      >
        <h1>I couldn't find readable text</h1>
        <p style={{ fontSize: `${fontSize}px` }}>
          Try moving closer, improving the light, and holding the paper upright.
        </p>
        <DebugInfo debug={result.debug} />
        <button
          style={{
            ...styles.primary,
            backgroundColor: isHigh ? "#00C2C2" : "#0B6E6E",
            color: isHigh ? "#000000" : "#FFFFFF",
          }}
          onClick={onRetry}
        >
          📷 Try again
        </button>
        <button
          style={{
            ...styles.secondary,
            backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
            color: isHigh ? "#FFFFFF" : "#1A1A1A",
            borderColor: isHigh ? "#8899A6" : "#4A5A6A",
          }}
          onClick={onBack}
        >
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
    <main
      style={{
        ...styles.page,
        backgroundColor: isHigh ? "#000000" : "#FAF8F3",
        color: isHigh ? "#FFFFFF" : "#1A1A1A",
      }}
    >
      <h1>Here is what I read</h1>

      <p
        role="status"
        style={{
          ...styles.badge,
          backgroundColor: isHigh ? "#121212" : "#FFFFFF",
          borderColor: needsCheck
            ? isHigh
              ? "#FFB84D"
              : "#B8560A"
            : isHigh
              ? "#4CAF50"
              : "#2E7D32",
        }}
      >
        {statusText}
      </p>

      {/* Primary Call to Action: Open Reader View & Read Aloud */}
      <button
        style={{
          ...styles.primary,
          backgroundColor: isHigh ? "#00C2C2" : "#0B6E6E",
          color: isHigh ? "#000000" : "#FFFFFF",
        }}
        onClick={onOpenReader}
        aria-label="Open Reader View and listen to document"
      >
        📖 Read Aloud (Reader View)
      </button>

      <DebugInfo debug={result.debug} />

      {hasWordData ? (
        <div style={{ ...styles.text, fontSize: `${fontSize}px` }}>
          {result.paragraphs.map((words, i) => (
            <p key={i} style={{ margin: "0 0 16px" }}>
              {words.map((w, j) => (
                <span
                  key={j}
                  style={
                    w.confidence < LOW_WORD_THRESHOLD
                      ? isHigh
                        ? styles.lowWordHigh
                        : styles.lowWordNormal
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
            fontSize: `${fontSize}px`,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
          }}
        >
          {result.text}
        </pre>
      )}

      <div style={styles.actionsRow}>
        <button
          style={{
            ...styles.secondary,
            backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
            color: isHigh ? "#FFFFFF" : "#1A1A1A",
            borderColor: isHigh ? "#8899A6" : "#4A5A6A",
          }}
          onClick={onRetry}
        >
          📷 Scan again
        </button>
        <button
          style={{
            ...styles.secondary,
            backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
            color: isHigh ? "#FFFFFF" : "#1A1A1A",
            borderColor: isHigh ? "#8899A6" : "#4A5A6A",
          }}
          onClick={onBack}
        >
          🏠 Home
        </button>
      </div>
    </main>
  );
}

const styles = {
  page: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontSize: 20,
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  badge: {
    margin: 0,
    padding: 14,
    border: "3px solid",
    borderRadius: 14,
    fontWeight: 600,
    fontSize: 18,
  },
  text: { lineHeight: 1.6, wordBreak: "break-word" },
  lowWordNormal: {
    textDecoration: "underline wavy #B8560A",
    textUnderlineOffset: 4,
    background: "#FBE9D6",
  },
  lowWordHigh: {
    textDecoration: "underline wavy #FFB84D",
    textUnderlineOffset: 4,
    background: "rgba(255, 184, 77, 0.25)",
  },
  primary: {
    minHeight: 64,
    fontSize: 22,
    fontWeight: 700,
    borderRadius: 14,
    border: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 8,
  },
  secondary: {
    minHeight: 56,
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 12,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

function DebugInfo({ debug }) {
  if (!debug) return null;
  return (
    <div>
      <p style={{ margin: 0, fontSize: 16 }}>
        Test settings: image {debug.width}×{debug.height}px, size=
        {String(debug.maxSide)}, adaptive={String(debug.adaptive)}, psm=
        {String(debug.psm)}
      </p>
      <img
        src={debug.preview}
        alt="What the reader saw"
        style={{ width: "100%", border: "1px solid #888" }}
      />
    </div>
  );
}
