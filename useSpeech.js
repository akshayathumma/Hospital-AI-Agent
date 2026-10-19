import { useCallback, useRef, useState } from "react";
import { stripMarkdown } from "../services/text";

export default function useSpeech() {
  const SR =
    typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  const startListening = useCallback(
    (onResult, onError) => {
      if (!SR) return;
      const rec = new SR();
      rec.lang = "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => onResult(e.results[0][0].transcript);
      rec.onerror = (e) => {
        setListening(false);
        onError?.(e.error);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    },
    [SR]
  );

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const speak = (id, text) => {
    if (!ttsSupported) return;
    const wasSpeaking = speakingId === id;
    window.speechSynthesis.cancel();
    if (wasSpeaking) {
      setSpeakingId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.rate = 1;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return {
    recognitionSupported: !!SR,
    ttsSupported,
    listening,
    startListening,
    stopListening,
    speakingId,
    speak,
  };
}