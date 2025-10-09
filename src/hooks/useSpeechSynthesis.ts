import { useState, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, onEndCallback?: () => void) => {
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
        if (onEndCallback) {
          onEndCallback();
        }
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentText('');
      };
      
      // Configure voice settings for natural conversation
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
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