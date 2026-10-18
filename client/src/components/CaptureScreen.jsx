import { useRef } from "react";
import { useSettings } from "../context/useSettings";

// File input with capture="environment" opens the rear camera on Android Chrome
// and falls back to the gallery/file picker elsewhere.
export default function CaptureScreen({ onImage, onBack }) {
  const { contrast, fontSize } = useSettings();
  const isHigh = contrast === "high";

  const cameraRef = useRef(null);
  const uploadRef = useRef(null);

  const handle = (e) => {
    const file = e.target.files?.[0];
    if (file) onImage(file);
    e.target.value = ""; // allow picking the same file again
  };

  return (
    <main
      style={{
        ...styles.page,
        backgroundColor: isHigh ? "#000000" : "#FAF8F3",
        color: isHigh ? "#FFFFFF" : "#1A1A1A",
      }}
    >
      <h1>Take a photo of your paper</h1>
      <p style={{ ...styles.hint, fontSize: `${fontSize}px` }}>
        Hold the phone steady. Use good light.
      </p>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handle}
        hidden
        aria-label="Take a photo"
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        onChange={handle}
        hidden
        aria-label="Choose a photo"
      />

      <button
        style={{
          ...styles.primary,
          backgroundColor: isHigh ? "#00C2C2" : "#0B6E6E",
          color: isHigh ? "#000000" : "#FFFFFF",
        }}
        onClick={() => cameraRef.current.click()}
      >
        📷 Take photo
      </button>

      <button
        style={{
          ...styles.secondary,
          backgroundColor: isHigh ? "#1E1E1E" : "#FFFFFF",
          color: isHigh ? "#FFFFFF" : "#1A1A1A",
          borderColor: isHigh ? "#8899A6" : "#4A5A6A",
        }}
        onClick={() => uploadRef.current.click()}
      >
        🖼️ Choose a photo
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
  hint: { margin: "0 0 8px 0" },
  primary: {
    minHeight: 72,
    fontSize: 22,
    fontWeight: 700,
    border: 0,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
