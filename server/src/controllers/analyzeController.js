import { analyze } from "../services/analyze/index.js";
import { validateAnalyzeRequest } from "../services/analyze/validate.js";

export async function analyzeController(req, res) {
  const errors = validateAnalyzeRequest(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid request", details: errors });
  }

  try {
    const { text, language, ocrConfidence } = req.body;
    const result = await analyze({ text, language, ocrConfidence });
    return res.json(result);
  } catch (err) {
    // PRIVACY: log only the error message, never req.body (it holds the text)
    console.error("analyze failed:", err.message);
    return res
      .status(500)
      .json({ error: "Could not explain this document right now." });
  }
}
