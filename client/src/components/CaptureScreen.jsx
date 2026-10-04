import { useRef } from "react";

// File input with capture="environment" opens the rear camera on Android Chrome
// and falls back to the gallery/file picker elsewhere. This one control gives us
// BOTH the camera and the upload fallback the plan asks for.
export default function CaptureScreen({ onImage, onBack }) {
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);

  const handle = (e) => {
    const file = e.target.files?.[0];
    if (file) onImage(file);
    e.target.value = ""; // allow picking the same file again
  };

  return (
    <main style={styles.page}>
      <h1>Take a photo of your paper</h1>
      <p style={styles.hint}>Hold the phone steady. Use good light.</p>

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

      <button style={styles.primary} onClick={() => cameraRef.current.click()}>
        📷 Take photo
      </button>
      <button
        style={styles.secondary}
        onClick={() => uploadRef.current.click()}
      >
        🖼️ Choose a photo
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
  hint: { margin: 0 },
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
