import { createContext } from "react";

export const SettingsContext = createContext(null);

export const SETTINGS_KEY = "padho_settings";

export const FONT_SIZES = [
  { label: "Standard", size: 20 },
  { label: "Large", size: 24 },
  { label: "Extra Large", size: 28 },
  { label: "Huge", size: 32 },
];

export const SPEEDS = [
  { label: "Slow", speed: 0.8, icon: "🐢" },
  { label: "Normal", speed: 1.0, icon: "🚶" },
  { label: "Fast", speed: 1.25, icon: "⚡" },
];

export const DEFAULT_SETTINGS = {
  fontSize: 24, // 24px default per UI brief (20px minimum, scalable to 32px)
  contrast: "normal", // "normal" | "high"
  language: "en", // "en" | "hi" | "mr"
  speed: 1.0, // 0.8 | 1.0 | 1.25
  voiceURI: "", // string, selected system voice URI
};
