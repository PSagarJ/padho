import { useState, useEffect, useRef, useCallback } from "react";
import {
  isSpeechSupported,
  getVoicesForLanguage,
  LANG_LOCALES,
} from "../services/speech";

export function useSpeech({
  tokens = [],
  fullText = "",
  language = "en",
  speed = 1.0,
  voiceURI = "",
}) {
  const [supported] = useState(isSpeechSupported);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(null);

  const utteranceRef = useRef(null);
  const heartbeatRef = useRef(null);
  const startIndexRef = useRef(0);

  // Load and refresh available voices
  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const voices = getVoicesForLanguage(language);
      setAvailableVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [supported, language]);

  // Clean up speech and timers on unmount
  const stop = useCallback(() => {
    if (!supported) return;
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveWordIndex(null);
  }, [supported]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const speak = useCallback(
    (startFromIndex = 0) => {
      if (!supported || (!fullText && tokens.length === 0)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);

      startIndexRef.current = startFromIndex;
      const startCharOffset =
        startFromIndex > 0 && tokens[startFromIndex]
          ? tokens[startFromIndex].start
          : 0;

      const textChunk = fullText.slice(startCharOffset).trim();
      if (!textChunk) {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveWordIndex(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textChunk);
      utteranceRef.current = utterance;

      // Pick selected voice or matching voice
      const voices = window.speechSynthesis.getVoices();
      let chosenVoice = null;

      if (voiceURI) {
        chosenVoice = voices.find((v) => v.voiceURI === voiceURI);
      }
      if (!chosenVoice) {
        const preferred = LANG_LOCALES[language] || [language];
        chosenVoice =
          voices.find((v) =>
            preferred.some((p) => v.lang.toLowerCase().startsWith(p.toLowerCase()))
          ) || voices[0];
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
      utterance.rate = speed;
      utterance.lang = LANG_LOCALES[language]?.[0] || language;

      // Boundary event: word highlighting
      utterance.onboundary = (e) => {
        if (e.name === "word" || e.name === "sentence") {
          const globalChar = e.charIndex + startCharOffset;
          // Find token matching or closest to character index
          const found =
            tokens.find(
              (t) => globalChar >= t.start && globalChar < t.end
            ) ||
            tokens.find((t) => t.start >= globalChar);

          if (found) {
            setActiveWordIndex(found.globalIndex);
          }
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        if (startFromIndex < tokens.length) {
          setActiveWordIndex(startFromIndex);
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveWordIndex(null);
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      };

      utterance.onerror = (err) => {
        // "interrupted" or "canceled" are expected when the user taps stop or pause
        if (err.error !== "interrupted" && err.error !== "canceled") {
          console.warn("SpeechSynthesis error:", err.error);
        }
        setIsPlaying(false);
        setIsPaused(false);
        setActiveWordIndex(null);
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      };

      // Heartbeat to prevent browser sleep on long text playback
      heartbeatRef.current = setInterval(() => {
        if (
          window.speechSynthesis.speaking &&
          !window.speechSynthesis.paused
        ) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      window.speechSynthesis.speak(utterance);
    },
    [supported, fullText, tokens, language, speed, voiceURI]
  );

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      // If resume fails to start, speak from the last active word or beginning
      speak(activeWordIndex || 0);
    }
  }, [supported, speak, activeWordIndex]);

  const restart = useCallback(() => {
    stop();
    speak(0);
  }, [stop, speak]);

  return {
    supported,
    availableVoices,
    isPlaying,
    isPaused,
    activeWordIndex,
    speak,
    pause,
    resume,
    stop,
    restart,
  };
}
