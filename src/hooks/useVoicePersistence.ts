import { useState, useEffect, useCallback } from 'react';

export interface VoiceSettings {
  voiceId: string;
  voiceName: string;
  voiceGender: 'female' | 'male' | 'child-friendly';
  pitch: number;
  speed: number;
  speakingSpeed: number;
  enabled: boolean;
}

const STORAGE_KEY = 'aiAgentVoiceSettings';

const DEFAULT_SETTINGS: VoiceSettings = {
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
  voiceName: 'Sarah',
  voiceGender: 'female',
  pitch: 1.0,
  speed: 1.0,
  speakingSpeed: 1.0,
  enabled: true,
};

export const useVoicePersistence = () => {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load voice settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Ensure voiceGender exists, fallback to female if not
        if (!parsed.voiceGender) {
          parsed.voiceGender = 'female';
        }
        setVoiceSettings(parsed);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load voice settings:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save voice settings to localStorage
  const saveVoiceSettings = useCallback((settings: Partial<VoiceSettings>) => {
    try {
      const updated = { ...voiceSettings, ...settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setVoiceSettings(updated);
      return true;
    } catch (error) {
      console.error('Failed to save voice settings:', error);
      return false;
    }
  }, [voiceSettings]);

  // Get browser voice based on settings
  const getBrowserVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    
    // Map gender to voice characteristics
    const genderFilter = (voice: SpeechSynthesisVoice) => {
      const nameLower = voice.name.toLowerCase();
      if (voiceSettings.voiceGender === 'female') {
        return nameLower.includes('female') || nameLower.includes('woman') || nameLower.includes('samantha') || nameLower.includes('victoria');
      } else if (voiceSettings.voiceGender === 'male') {
        return nameLower.includes('male') || nameLower.includes('man') || nameLower.includes('daniel') || nameLower.includes('alex');
      } else if (voiceSettings.voiceGender === 'child-friendly') {
        return nameLower.includes('child') || nameLower.includes('junior') || nameLower.includes('kid');
      }
      return true;
    };

    // Find voice matching language and gender
    let selectedVoice = voices.find(voice => 
      voice.lang.includes('en') && genderFilter(voice)
    );

    // Fallback to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.includes('en'));
    }

    // Fallback to first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    return selectedVoice;
  }, [voiceSettings.voiceGender]);

  return {
    voiceSettings,
    saveVoiceSettings,
    getBrowserVoice,
    isLoaded,
  };
};
