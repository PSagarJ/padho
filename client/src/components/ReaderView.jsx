import { useEffect, useMemo, useRef } from "react";
import { useSettings } from "../context/useSettings";
import { prepareSpokenTokens } from "../services/speech";
import { useSpeech } from "../hooks/useSpeech";

export default function ReaderView({ result, onBack, onOpenSettings }) {
  const {
    fontSize,
    contrast,
    language,
    speed,
    voiceURI,
    setSpeed,
    increaseFontSize,
    decreaseFontSize,
  } = useSettings();

  const isHigh = contrast === "high";

  // Prepare tokens and flat text for speech + word highlighting
  const { tokens, fullText } = useMemo(() => {
    if (!result) return { tokens: [], fullText: "" };
    return prepareSpokenTokens(result.paragraphs, result.text);
  }, [result]);

  const {
    supported,
    isPlaying,
    isPaused,
    activeWordIndex,
    speak,
    pause,
    resume,
    restart,
  } = useSpeech({
    tokens,
    fullText,
    language,
    speed,
    voiceURI,
  });

  const activeRef = useRef(null);

  // Auto-scroll active word smoothly into center view
  useEffect(() => {
    if (activeWordIndex !== null) {
      const el = document.getElementById(`reader-word-${activeWordIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeWordIndex]);

  // Speed controls
  const handleToggleSpeed = () => {
    if (speed <= 0.8) setSpeed(1.0);
    else if (speed <= 1.0) setSpeed(1.25);
    else setSpeed(0.8);
  };

  const speedLabel =
    speed <= 0.8
      ? "🐢 Slow (0.8x)"
      : speed <= 1.0
        ? "🚶 Normal (1.0x)"
        : "⚡ Fast (1.2x)";

  return (
    <main
      style={{
        ...styles.container,
        backgroundColor: isHigh ? "#000000" : "#FAF8F3",
        color: isHigh ? "#FFFFFF" : "#1A1A1A",
      }}
      aria-label="Document Reader View"
    >
      {/* Top Navigation Bar */}
      <header style={styles.topBar}>
        <button
          style={{
            ...styles.navButton,
            backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
            color: isHigh ? "#FFFFFF" : "#1A1A1A",
            borderColor: isHigh ? "#8899A6" : "#4A5A6A",
          }}
          onClick={onBack}
          aria-label="Go back to Home"
        >
          🏠 Home
        </button>

        <div style={styles.topRightControls}>
          <button
            style={{
              ...styles.iconControl,
              backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
              color: isHigh ? "#FFFFFF" : "#1A1A1A",
              borderColor: isHigh ? "#8899A6" : "#4A5A6A",
            }}
            onClick={decreaseFontSize}
            title="Make text smaller"
            aria-label="Make text smaller"
          >
            A-
          </button>
          <button
            style={{
              ...styles.iconControl,
              backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
              color: isHigh ? "#FFFFFF" : "#1A1A1A",
              borderColor: isHigh ? "#8899A6" : "#4A5A6A",
            }}
            onClick={increaseFontSize}
            title="Make text bigger"
            aria-label="Make text bigger"
          >
            A+
          </button>
          <button
            style={{
              ...styles.navButton,
              backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
              color: isHigh ? "#FFFFFF" : "#1A1A1A",
              borderColor: isHigh ? "#8899A6" : "#4A5A6A",
            }}
            onClick={onOpenSettings}
            aria-label="Open Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {/* Reader Status Banner */}
      <div
        role="status"
        aria-live="polite"
        style={{
          ...styles.statusBanner,
          backgroundColor: isHigh ? "#121212" : "#FFFFFF",
          borderColor: isHigh ? "#444444" : "#D8D3C8",
        }}
      >
        {!supported ? (
          <span>⚠️ Speech is not supported on this browser</span>
        ) : isPlaying ? (
          <span>🔊 Reading aloud... (Tap any word to jump)</span>
        ) : isPaused ? (
          <span>⏸️ Paused</span>
        ) : (
          <span>📖 Ready to read (Tap Play below or tap any word)</span>
        )}
      </div>

      {/* Document Body Text with Word Highlighting */}
      <div
        style={{
          ...styles.readerContent,
          fontSize: `${fontSize}px`,
          lineHeight: 1.7,
        }}
      >
        {result?.paragraphs && result.paragraphs.length > 0 ? (
          result.paragraphs.map((paraWords, pIndex) => (
            <p key={pIndex} style={styles.paragraph}>
              {paraWords.map((w, wIndex) => {
                // Find token corresponding to this paragraph and word
                const token = tokens.find(
                  (t) => t.pIndex === pIndex && t.wIndex === wIndex,
                );
                const isSpeaking =
                  token && token.globalIndex === activeWordIndex;
                const isLowConf = w.confidence < 0.6;

                return (
                  <span
                    id={token ? `reader-word-${token.globalIndex}` : undefined}
                    key={wIndex}
                    ref={isSpeaking ? activeRef : null}
                    onClick={() => {
                      if (token) speak(token.globalIndex);
                    }}
                    style={{
                      ...styles.wordSpan,
                      ...(isSpeaking
                        ? isHigh
                          ? styles.speakingHigh
                          : styles.speakingNormal
                        : {}),
                      ...(isLowConf && !isSpeaking
                        ? isHigh
                          ? styles.lowConfHigh
                          : styles.lowConfNormal
                        : {}),
                      // Words with no token are not read aloud (empty boxes): dim them
                      ...(!token ? { opacity: 0.45 } : {}),
                    }}
                    title={
                      !token
                        ? "Not read aloud (looks like empty boxes)"
                        : isLowConf
                          ? "Possible reading uncertainty"
                          : "Tap to read from here"
                    }
                  >
                    {w.text}{" "}
                  </span>
                );
              })}
            </p>
          ))
        ) : (
          <p style={styles.paragraph}>
            {tokens.map((token) => {
              const isSpeaking = token.globalIndex === activeWordIndex;
              return (
                <span
                  id={`reader-word-${token.globalIndex}`}
                  key={token.globalIndex}
                  onClick={() => speak(token.globalIndex)}
                  style={{
                    ...styles.wordSpan,
                    ...(isSpeaking
                      ? isHigh
                        ? styles.speakingHigh
                        : styles.speakingNormal
                      : {}),
                  }}
                >
                  {token.text}{" "}
                </span>
              );
            })}
          </p>
        )}
      </div>

      {/* Sticky Bottom Playback Controls */}
      <div
        style={{
          ...styles.bottomBar,
          backgroundColor: isHigh ? "#121212" : "#FFFFFF",
          borderColor: isHigh ? "#444444" : "#D8D3C8",
        }}
      >
        {/* Play / Pause Primary Button */}
        {isPlaying ? (
          <button
            style={{
              ...styles.primaryAction,
              backgroundColor: isHigh ? "#FFB84D" : "#4A5A6A",
              color: isHigh ? "#000000" : "#FFFFFF",
            }}
            onClick={pause}
            aria-label="Pause reading"
          >
            ⏸️ Pause
          </button>
        ) : isPaused ? (
          <button
            style={{
              ...styles.primaryAction,
              backgroundColor: isHigh ? "#00C2C2" : "#0B6E6E",
              color: isHigh ? "#000000" : "#FFFFFF",
            }}
            onClick={resume}
            aria-label="Resume reading"
          >
            ▶️ Resume
          </button>
        ) : (
          <button
            style={{
              ...styles.primaryAction,
              backgroundColor: isHigh ? "#00C2C2" : "#0B6E6E",
              color: isHigh ? "#000000" : "#FFFFFF",
            }}
            onClick={() => speak(0)}
            aria-label="Read full document aloud"
          >
            ▶️ Read Aloud
          </button>
        )}

        <div style={styles.secondaryControlsRow}>
          {/* Read Again button */}
          <button
            style={{
              ...styles.secondaryAction,
              backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
              color: isHigh ? "#FFFFFF" : "#1A1A1A",
              borderColor: isHigh ? "#8899A6" : "#4A5A6A",
            }}
            onClick={restart}
            aria-label="Read document again from beginning"
          >
            🔄 Read Again
          </button>

          {/* Speed Toggle button */}
          <button
            style={{
              ...styles.secondaryAction,
              backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
              color: isHigh ? "#FFFFFF" : "#1A1A1A",
              borderColor: isHigh ? "#8899A6" : "#4A5A6A",
            }}
            onClick={handleToggleSpeed}
            aria-label={`Change reading speed, currently ${speedLabel}`}
          >
            {speedLabel}
          </button>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "16px 16px 160px 16px",
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  topRightControls: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  navButton: {
    minHeight: 52,
    padding: "0 16px",
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 12,
    border: "2px solid",
  },
  iconControl: {
    minHeight: 52,
    minWidth: 52,
    fontSize: 18,
    fontWeight: 700,
    borderRadius: 12,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBanner: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid",
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
  },
  readerContent: {
    wordBreak: "break-word",
    textAlign: "left",
    flexGrow: 1,
  },
  paragraph: {
    margin: "0 0 24px 0",
  },
  wordSpan: {
    display: "inline",
    padding: "2px 4px",
    borderRadius: 6,
    cursor: "pointer",
    transition: "background-color 0.1s ease",
  },
  speakingNormal: {
    backgroundColor: "#FFE082",
    color: "#000000",
    fontWeight: 700,
    boxShadow: "0 0 0 2px #FFA000",
  },
  speakingHigh: {
    backgroundColor: "#00E5FF",
    color: "#000000",
    fontWeight: 700,
    boxShadow: "0 0 0 2px #FFFFFF",
  },
  lowConfNormal: {
    textDecoration: "underline wavy #B8560A",
    textUnderlineOffset: 4,
    backgroundColor: "rgba(184, 86, 10, 0.12)",
  },
  lowConfHigh: {
    textDecoration: "underline wavy #FFB84D",
    textUnderlineOffset: 4,
    backgroundColor: "rgba(255, 184, 77, 0.2)",
  },
  bottomBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 680,
    margin: "0 auto",
    padding: 16,
    borderTop: "3px solid",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxSizing: "border-box",
    boxShadow: "0 -4px 16px rgba(0,0,0,0.15)",
    zIndex: 100,
  },
  primaryAction: {
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
  secondaryControlsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  secondaryAction: {
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
