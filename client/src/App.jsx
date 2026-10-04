import { useState } from "react";
import CaptureScreen from "./components/CaptureScreen";
import OcrResult from "./components/OcrResult";
import { recognizeText } from "./services/ocr";

export default function App() {
  const [screen, setScreen] = useState("home"); // home | capture | processing | result | error
  const [language, setLanguage] = useState("en");
  const [preprocess, setPreprocess] = useState(true); // temporary dev toggle for Phase 7 comparisons
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

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
      console.error(err);
      setScreen("error");
    }
  };

  if (screen === "capture")
    return (
      <CaptureScreen onImage={handleImage} onBack={() => setScreen("home")} />
    );
  if (screen === "result")
    return (
      <OcrResult
        result={result}
        onRetry={() => setScreen("capture")}
        onBack={() => setScreen("home")}
      />
    );

  if (screen === "processing") {
    return (
      <main style={{ padding: 16, fontSize: 20 }} aria-live="polite">
        <h1>Reading your document...</h1>
        <p>
          {Math.round(progress * 100)}% done. The first time can take longer.
        </p>
      </main>
    );
  }

  if (screen === "error") {
    return (
      <main style={{ padding: 16, fontSize: 20 }}>
        <h1>Something went wrong</h1>
        <p>I couldn't read that photo. Please try again.</p>
        <button
          style={{ minHeight: 56, fontSize: 18 }}
          onClick={() => setScreen("capture")}
        >
          📷 Try again
        </button>
      </main>
    );
  }

  // Home: temporary. The polished one-button Home comes later.
  return (
    <main
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontSize: 20,
      }}
    >
      <button
        onClick={() => setScreen("capture")}
        style={{
          minHeight: 180,
          fontSize: 32,
          fontWeight: 700,
          background: "#0B6E6E",
          color: "#fff",
          border: 0,
          borderRadius: 24,
        }}
      >
        📷 Scan
      </button>

      {/* Dev-only controls for testing; remove/replace when Settings is built in Phase 3 */}
      <label>
        Language:{" "}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ fontSize: 18, minHeight: 48 }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={preprocess}
          onChange={(e) => setPreprocess(e.target.checked)}
        />{" "}
        Clean the image first
      </label>
    </main>
  );
}
