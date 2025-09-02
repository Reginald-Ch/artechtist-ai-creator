import { useState, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentText(text);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentText('');
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentText('');
      };
      
      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentText('');
    }
  }, []);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window && !isPlaying) {
      window.speechSynthesis.resume();
    }
  }, [isPlaying]);

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    currentText,
    isSupported: 'speechSynthesis' in window
  };
};