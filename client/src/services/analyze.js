// Calls the Express /api/analyze endpoint. Only TEXT is sent, never the image.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Render's free tier can take 30-60 s to wake up, so allow a long wait
const TIMEOUT_MS = 60000;

export async function analyzeText({ text, language, ocrConfidence }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.slice(0, 20000), // server limit
        language,
        ocrConfidence,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Analyze failed (${res.status})`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
