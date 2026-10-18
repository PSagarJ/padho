import { useState, useEffect } from "react";
import { useSettings } from "../context/useSettings";
import { FONT_SIZES, SPEEDS } from "../context/settingsConstants";
import { getVoicesForLanguage, isSpeechSupported } from "../services/speech";

export default function SettingsScreen({ onBack }) {
  const {
    fontSize,
    contrast,
    language,
    speed,
    voiceURI,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    setContrast,
    setLanguage,
    setSpeed,
    setVoiceURI,
    resetSettings,
  } = useSettings();

  const isHigh = contrast === "high";
  const [voices, setVoices] = useState([]);
  const [testSpeaking, setTestSpeaking] = useState(false);

  // Load voices for current language
  useEffect(() => {
    if (!isSpeechSupported()) return;
    const update = () => {
      const v = getVoicesForLanguage(language);
      setVoices(v);
    };
    update();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = update;
    }
  }, [language]);

  // Test Voice sample utterance
  const handleTestVoice = () => {
    if (!isSpeechSupported()) return;
    window.speechSynthesis.cancel();

    const sampleTexts = {
      en: "Hello! I am ready to read your documents clearly.",
      hi: "नमस्ते! मैं आपके दस्तावेज़ स्पष्ट रूप से पढ़ने के लिए तैयार हूँ।",
      mr: "नमस्कार! मी तुमचे कागदपत्र स्पष्टपणे वाचण्यासाठी तयार आहे.",
    };

    const text = sampleTexts[language] || sampleTexts.en;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;

    if (voiceURI) {
      const found = voices.find((v) => v.voiceURI === voiceURI);
      if (found) utterance.voice = found;
    }

    utterance.onstart = () => setTestSpeaking(true);
    utterance.onend = () => setTestSpeaking(false);
    utterance.onerror = () => setTestSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <main
      style={{
        ...styles.container,
        backgroundColor: isHigh ? "#000000" : "#FAF8F3",
        color: isHigh ? "#FFFFFF" : "#1A1A1A",
      }}
      aria-label="Settings Screen"
    >
      {/* Top Header */}
      <header style={styles.topHeader}>
        <h1>⚙️ Settings</h1>
        <button
          style={{
            ...styles.doneButton,
            backgroundColor: isHigh ? "#00C2C2" : "#0B6E6E",
            color: isHigh ? "#000000" : "#FFFFFF",
          }}
          onClick={onBack}
          aria-label="Save and return"
        >
          ✓ Done
        </button>
      </header>

      <div style={styles.settingsList}>
        {/* 1. Font Size */}
        <section
          style={{
            ...styles.card,
            backgroundColor: isHigh ? "#121212" : "#FFFFFF",
            borderColor: isHigh ? "#444444" : "#D8D3C8",
          }}
        >
          <h2 style={styles.sectionTitle}>🔤 Text Size</h2>
          <div style={styles.buttonRow}>
            <button
              style={{
                ...styles.stepperButton,
                backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
                color: isHigh ? "#FFFFFF" : "#1A1A1A",
                borderColor: isHigh ? "#8899A6" : "#4A5A6A",
              }}
              onClick={decreaseFontSize}
              aria-label="Decrease text size"
            >
              A- Smaller
            </button>
            <button
              style={{
                ...styles.stepperButton,
                backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
                color: isHigh ? "#FFFFFF" : "#1A1A1A",
                borderColor: isHigh ? "#8899A6" : "#4A5A6A",
              }}
              onClick={increaseFontSize}
              aria-label="Increase text size"
            >
              A+ Bigger
            </button>
          </div>

          <div style={styles.presetRow}>
            {FONT_SIZES.map((f) => (
              <button
                key={f.size}
                onClick={() => setFontSize(f.size)}
                style={{
                  ...styles.presetButton,
                  borderColor:
                    fontSize === f.size
                      ? isHigh
                        ? "#00C2C2"
                        : "#0B6E6E"
                      : isHigh
                        ? "#555555"
                        : "#D8D3C8",
                  backgroundColor:
                    fontSize === f.size
                      ? isHigh
                        ? "#00C2C2"
                        : "#0B6E6E"
                      : isHigh
                        ? "#1E1E1E"
                        : "#FFFFFF",
                  color:
                    fontSize === f.size
                      ? isHigh
                        ? "#000000"
                        : "#FFFFFF"
                      : isHigh
                        ? "#FFFFFF"
                        : "#1A1A1A",
                  fontWeight: fontSize === f.size ? 700 : 500,
                }}
              >
                {f.label} ({f.size}px)
              </button>
            ))}
          </div>

          {/* Live Preview Box */}
          <div
            style={{
              ...styles.previewBox,
              fontSize: `${fontSize}px`,
              borderColor: isHigh ? "#444444" : "#D8D3C8",
              backgroundColor: isHigh ? "#000000" : "#FAF8F3",
            }}
          >
            Aa नमस्ते (Sample text preview)
          </div>
        </section>

        {/* 2. Contrast Mode */}
        <section
          style={{
            ...styles.card,
            backgroundColor: isHigh ? "#121212" : "#FFFFFF",
            borderColor: isHigh ? "#444444" : "#D8D3C8",
          }}
        >
          <h2 style={styles.sectionTitle}>🎨 Screen Colors</h2>
          <div style={styles.buttonRow}>
            <button
              onClick={() => setContrast("normal")}
              style={{
                ...styles.optionButton,
                borderColor:
                  contrast === "normal"
                    ? isHigh
                      ? "#00C2C2"
                      : "#0B6E6E"
                    : isHigh
                      ? "#555555"
                      : "#D8D3C8",
                backgroundColor:
                  contrast === "normal" ? "#FAF8F3" : isHigh ? "#1E1E1E" : "#FFFFFF",
                color: "#1A1A1A",
                fontWeight: contrast === "normal" ? 700 : 500,
              }}
            >
              ☀️ Normal (Warm Off-White)
            </button>
            <button
              onClick={() => setContrast("high")}
              style={{
                ...styles.optionButton,
                borderColor:
                  contrast === "high"
                    ? isHigh
                      ? "#00C2C2"
                      : "#0B6E6E"
                    : isHigh
                      ? "#555555"
                      : "#D8D3C8",
                backgroundColor: "#000000",
                color: "#FFFFFF",
                fontWeight: contrast === "high" ? 700 : 500,
              }}
            >
              🌙 High Contrast (Black)
            </button>
          </div>
        </section>

        {/* 3. Language */}
        <section
          style={{
            ...styles.card,
            backgroundColor: isHigh ? "#121212" : "#FFFFFF",
            borderColor: isHigh ? "#444444" : "#D8D3C8",
          }}
        >
          <h2 style={styles.sectionTitle}>🌐 Language</h2>
          <div style={styles.languageGrid}>
            {[
              { code: "en", label: "English" },
              { code: "hi", label: "हिन्दी (Hindi)" },
              { code: "mr", label: "मराठी (Marathi)" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                style={{
                  ...styles.optionButton,
                  borderColor:
                    language === lang.code
                      ? isHigh
                        ? "#00C2C2"
                        : "#0B6E6E"
                      : isHigh
                        ? "#555555"
                        : "#D8D3C8",
                  backgroundColor:
                    language === lang.code
                      ? isHigh
                        ? "#00C2C2"
                        : "#0B6E6E"
                      : isHigh
                        ? "#1E1E1E"
                        : "#FFFFFF",
                  color:
                    language === lang.code
                      ? isHigh
                        ? "#000000"
                        : "#FFFFFF"
                      : isHigh
                        ? "#FFFFFF"
                        : "#1A1A1A",
                  fontWeight: language === lang.code ? 700 : 500,
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </section>

        {/* 4. Reading Speed */}
        <section
          style={{
            ...styles.card,
            backgroundColor: isHigh ? "#121212" : "#FFFFFF",
            borderColor: isHigh ? "#444444" : "#D8D3C8",
          }}
        >
          <h2 style={styles.sectionTitle}>⏱️ Reading Speed</h2>
          <div style={styles.buttonRow}>
            {SPEEDS.map((s) => (
              <button
                key={s.speed}
                onClick={() => setSpeed(s.speed)}
                style={{
                  ...styles.optionButton,
                  borderColor:
                    speed === s.speed
                      ? isHigh
                        ? "#00C2C2"
                        : "#0B6E6E"
                      : isHigh
                        ? "#555555"
                        : "#D8D3C8",
                  backgroundColor:
                    speed === s.speed
                      ? isHigh
                        ? "#00C2C2"
                        : "#0B6E6E"
                      : isHigh
                        ? "#1E1E1E"
                        : "#FFFFFF",
                  color:
                    speed === s.speed
                      ? isHigh
                        ? "#000000"
                        : "#FFFFFF"
                      : isHigh
                        ? "#FFFFFF"
                        : "#1A1A1A",
                  fontWeight: speed === s.speed ? 700 : 500,
                }}
              >
                {s.icon} {s.label} ({s.speed}x)
              </button>
            ))}
          </div>
        </section>

        {/* 5. Voice Selection */}
        <section
          style={{
            ...styles.card,
            backgroundColor: isHigh ? "#121212" : "#FFFFFF",
            borderColor: isHigh ? "#444444" : "#D8D3C8",
          }}
        >
          <h2 style={styles.sectionTitle}>🗣️ Voice Selection</h2>
          <select
            value={voiceURI}
            onChange={(e) => setVoiceURI(e.target.value)}
            style={{
              ...styles.selectInput,
              backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
              color: isHigh ? "#FFFFFF" : "#1A1A1A",
              borderColor: isHigh ? "#8899A6" : "#4A5A6A",
            }}
          >
            <option value="">Auto-select best voice for {language}</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>

          <button
            style={{
              ...styles.testVoiceButton,
              backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
              color: isHigh ? "#FFFFFF" : "#1A1A1A",
              borderColor: isHigh ? "#8899A6" : "#4A5A6A",
            }}
            onClick={handleTestVoice}
          >
            {testSpeaking ? "🔊 Speaking..." : "▶️ Test This Voice"}
          </button>
        </section>

        {/* Reset */}
        <button
          style={{
            ...styles.resetButton,
            backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
            color: isHigh ? "#FF6B5E" : "#A3261A",
            borderColor: isHigh ? "#FF6B5E" : "#A3261A",
          }}
          onClick={resetSettings}
        >
          ↺ Reset All Settings to Default
        </button>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: 16,
    boxSizing: "border-box",
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  doneButton: {
    minHeight: 52,
    padding: "0 24px",
    fontSize: 18,
    fontWeight: 700,
    borderRadius: 12,
    border: 0,
  },
  settingsList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    border: "2px solid",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 10,
  },
  presetRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 8,
  },
  languageGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
  },
  stepperButton: {
    minHeight: 56,
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 12,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  presetButton: {
    minHeight: 48,
    fontSize: 16,
    borderRadius: 10,
    border: "2px solid",
  },
  optionButton: {
    minHeight: 56,
    padding: "8px 12px",
    fontSize: 17,
    borderRadius: 12,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  previewBox: {
    padding: "16px",
    borderRadius: 10,
    border: "1px dashed",
    marginTop: 4,
    lineHeight: 1.5,
  },
  selectInput: {
    minHeight: 56,
    fontSize: 17,
    padding: "8px 12px",
    borderRadius: 12,
    border: "2px solid",
    width: "100%",
    boxSizing: "border-box",
  },
  testVoiceButton: {
    minHeight: 56,
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 12,
    border: "2px solid",
    marginTop: 4,
  },
  resetButton: {
    minHeight: 56,
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 12,
    border: "2px solid",
    marginTop: 8,
  },
};
