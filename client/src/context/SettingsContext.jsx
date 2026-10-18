import { useState, useEffect } from "react";
import {
  SettingsContext,
  SETTINGS_KEY,
  DEFAULT_SETTINGS,
  FONT_SIZES,
  SPEEDS,
} from "./settingsConstants";

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not load settings from localStorage:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Sync with document styling whenever contrast or fontSize changes
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Could not save settings to localStorage:", e);
    }

    // Apply high-contrast theme class to body
    if (settings.contrast === "high") {
      document.body.classList.add("theme-high");
    } else {
      document.body.classList.remove("theme-high");
    }

    // Apply font size CSS variable
    document.documentElement.style.setProperty(
      "--reader-font-size",
      `${settings.fontSize}px`
    );
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const setFontSize = (size) => updateSetting("fontSize", size);

  const increaseFontSize = () => {
    setSettings((prev) => {
      const idx = FONT_SIZES.findIndex((f) => f.size === prev.fontSize);
      if (idx < FONT_SIZES.length - 1) {
        return { ...prev, fontSize: FONT_SIZES[idx + 1].size };
      }
      return prev;
    });
  };

  const decreaseFontSize = () => {
    setSettings((prev) => {
      const idx = FONT_SIZES.findIndex((f) => f.size === prev.fontSize);
      if (idx > 0) {
        return { ...prev, fontSize: FONT_SIZES[idx - 1].size };
      }
      return prev;
    });
  };

  const setContrast = (mode) => updateSetting("contrast", mode);
  const toggleContrast = () =>
    updateSetting("contrast", settings.contrast === "high" ? "normal" : "high");

  const setLanguage = (lang) => updateSetting("language", lang);
  const setSpeed = (spd) => updateSetting("speed", spd);
  const setVoiceURI = (uri) => updateSetting("voiceURI", uri);

  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        setContrast,
        toggleContrast,
        setLanguage,
        setSpeed,
        setVoiceURI,
        resetSettings,
        FONT_SIZES,
        SPEEDS,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
