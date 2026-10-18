import { useState } from "react";
import CaptureScreen from "./components/CaptureScreen";
import OcrResult from "./components/OcrResult";
import ReaderView from "./components/ReaderView";
import SettingsScreen from "./components/SettingsScreen";
import { SettingsProvider } from "./context/SettingsContext";
import { useSettings } from "./context/useSettings";
import { recognizeText } from "./services/ocr";

function MainApp() {
  const [screen, setScreen] = useState("home"); // home | capture | processing | result | reader | settings | error
  const [prevScreen, setPrevScreen] = useState("home");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [preprocess, setPreprocess] = useState(true); // switchable for Phase 7 comparisons

  const { language, contrast, fontSize } = useSettings();
  const isHigh = contrast === "high";

  const navigateTo = (newScreen) => {
    setPrevScreen(screen);
    setScreen(newScreen);
  };

  const handleImage = async (file) => {
    setScreen("processing");
    setProgress(0);
    try {
      const r = await recognizeText(file, language, {
        preprocess,
        onProgress: setProgress,
      });
      setResult(r);
      setScreen("result");
    } catch (err) {
      console.error("OCR recognition error:", err);
      setScreen("error");
    }
  };

  const langLabels = {
    en: "English",
    hi: "हिन्दी (Hindi)",
    mr: "मराठी (Marathi)",
  };

  // Screen: Reader View (Phase 3)
  if (screen === "reader") {
    return (
      <ReaderView
        result={result}
        onBack={() => setScreen("home")}
        onOpenSettings={() => navigateTo("settings")}
      />
    );
  }

  // Screen: Settings (Phase 3)
  if (screen === "settings") {
    return <SettingsScreen onBack={() => setScreen(prevScreen || "home")} />;
  }

  // Screen: Capture (Camera / File input)
  if (screen === "capture") {
    return (
      <CaptureScreen
        onImage={handleImage}
        onBack={() => setScreen("home")}
      />
    );
  }

  // Screen: OCR Result (Confidence + Entry to Reader View)
  if (screen === "result") {
    return (
      <OcrResult
        result={result}
        onOpenReader={() => setScreen("reader")}
        onRetry={() => setScreen("capture")}
        onBack={() => setScreen("home")}
      />
    );
  }

  // Screen: Processing State
  if (screen === "processing") {
    return (
      <main
        style={{
          ...styles.container,
          backgroundColor: isHigh ? "#000000" : "#FAF8F3",
          color: isHigh ? "#FFFFFF" : "#1A1A1A",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
        aria-live="polite"
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
        <h1>Reading your document...</h1>
        <p style={{ fontSize: `${fontSize}px`, maxWidth: 400 }}>
          {Math.round(progress * 100)}% done. The first time can take longer while language data loads.
        </p>
      </main>
    );
  }

  // Screen: Error State
  if (screen === "error") {
    return (
      <main
        style={{
          ...styles.container,
          backgroundColor: isHigh ? "#000000" : "#FAF8F3",
          color: isHigh ? "#FFFFFF" : "#1A1A1A",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1>Something went wrong</h1>
        <p style={{ fontSize: `${fontSize}px` }}>
          I couldn't read that photo clearly. Please try again with good lighting.
        </p>
        <button
          style={{
            ...styles.primaryScanButton,
            minHeight: 64,
            fontSize: 20,
            marginTop: 16,
            backgroundColor: isHigh ? "#00C2C2" : "#0B6E6E",
            color: isHigh ? "#000000" : "#FFFFFF",
          }}
          onClick={() => setScreen("capture")}
        >
          📷 Try again
        </button>
        <button
          style={{
            ...styles.secondaryButton,
            marginTop: 12,
            backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
            color: isHigh ? "#FFFFFF" : "#1A1A1A",
            borderColor: isHigh ? "#8899A6" : "#4A5A6A",
          }}
          onClick={() => setScreen("home")}
        >
          🏠 Return Home
        </button>
      </main>
    );
  }

  // Screen: Home (Accessible One-Button Primary Design per UI Brief)
  return (
    <main
      style={{
        ...styles.container,
        backgroundColor: isHigh ? "#000000" : "#FAF8F3",
        color: isHigh ? "#FFFFFF" : "#1A1A1A",
      }}
    >
      <header style={styles.homeHeader}>
        <div>
          <h1 style={{ margin: 0 }}>Padho</h1>
          <p style={{ margin: 0, fontSize: 16, opacity: 0.85 }}>
            Accessible Document Reader
          </p>
        </div>
        <button
          style={{
            ...styles.settingsButton,
            backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
            color: isHigh ? "#FFFFFF" : "#1A1A1A",
            borderColor: isHigh ? "#8899A6" : "#4A5A6A",
          }}
          onClick={() => navigateTo("settings")}
          aria-label="Open Settings"
        >
          ⚙️ Settings
        </button>
      </header>

      {/* Main Giant Scan Button */}
      <div style={styles.centerActionArea}>
        <button
          onClick={() => setScreen("capture")}
          style={{
            ...styles.primaryScanButton,
            backgroundColor: isHigh ? "#00C2C2" : "#0B6E6E",
            color: isHigh ? "#000000" : "#FFFFFF",
          }}
          aria-label="Scan Document"
        >
          <span style={{ fontSize: 52 }}>📷</span>
          <span>Scan Document</span>
        </button>
      </div>

      {/* Language badge and dev switches */}
      <footer style={styles.homeFooter}>
        <div
          style={{
            ...styles.languageBadge,
            backgroundColor: isHigh ? "#121212" : "#FFFFFF",
            borderColor: isHigh ? "#444444" : "#D8D3C8",
          }}
        >
          <span>Language: <strong>{langLabels[language] || language}</strong></span>
          <button
            onClick={() => navigateTo("settings")}
            style={{
              background: "transparent",
              border: 0,
              color: isHigh ? "#00C2C2" : "#0B6E6E",
              fontSize: 16,
              fontWeight: 700,
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Change
          </button>
        </div>

        {/* Temporary dev toggle for Phase 7 comparisons */}
        <label style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={preprocess}
            onChange={(e) => setPreprocess(e.target.checked)}
            style={{ width: 20, height: 20 }}
          />
          Clean image before reading (recommended)
        </label>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <MainApp />
    </SettingsProvider>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  homeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  settingsButton: {
    minHeight: 52,
    padding: "0 18px",
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 12,
    border: "2px solid",
  },
  centerActionArea: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 0",
  },
  primaryScanButton: {
    width: "100%",
    maxWidth: 380,
    minHeight: 200,
    fontSize: 28,
    fontWeight: 700,
    border: 0,
    borderRadius: 28,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
  homeFooter: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 16,
  },
  languageBadge: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderRadius: 12,
    border: "2px solid",
    fontSize: 17,
  },
  secondaryButton: {
    minHeight: 56,
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 12,
    border: "2px solid",
    width: "100%",
    maxWidth: 380,
    margin: "0 auto",
  },
};
