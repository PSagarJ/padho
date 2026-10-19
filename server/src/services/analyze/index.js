// The ONE function the rest of the server calls.
// ANALYZE_MODE=mock (default) or llm. The frontend never knows which.

import { mockAnalyze } from "./mockAnalyze.js";
import { validateAnalyzeResponse } from "./validate.js";

export async function analyze(input) {
  const mode = process.env.ANALYZE_MODE || "mock";

  let raw;
  if (mode === "llm") {
    // Loaded only when needed, so llmAnalyze.js doesn't have to exist yet
    const { llmAnalyze } = await import("./llmAnalyze.js");
    raw = await llmAnalyze(input);
  } else {
    raw = mockAnalyze(input);
  }

  return validateAnalyzeResponse(raw); // trust nothing, mock or LLM
}
