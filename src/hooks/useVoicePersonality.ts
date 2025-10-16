import { useState, useEffect, useCallback } from 'react';

export type VoicePersonality = 'friendly' | 'formal' | 'humorous' | 'teacher';
export type EmotionalTone = 'neutral' | 'excited' | 'calm' | 'empathetic';

export interface VoicePersonalitySettings {
  personality: VoicePersonality;
  emotionalTone: EmotionalTone;
  pitch: number;
  speed: number;
  conversationHistory: Array<{
    timestamp: Date;
    userMessage: string;
    botResponse: string;
    detectedSentiment?: string;
  }>;
}

const STORAGE_KEY = 'voicePersonalitySettings';

const DEFAULT_SETTINGS: VoicePersonalitySettings = {
  personality: 'friendly',
  emotionalTone: 'neutral',
  pitch: 1.0,
  speed: 1.0,
  conversationHistory: [],
};

// Personality-specific voice configurations
const PERSONALITY_CONFIGS = {
  friendly: {
    pitch: 1.1,
    speed: 1.0,
    voicePreference: ['female', 'child-friendly'],
    greetings: [
      "Hey there! 😊 How can I help you today?",
      "Hi! Great to see you! What can I do for you?",
      "Hello friend! I'm here to help! 🌟"
    ],
  },
  formal: {
    pitch: 0.9,
    speed: 0.95,
    voicePreference: ['male', 'female'],
    greetings: [
      "Good day. How may I assist you?",
      "Hello. I am at your service.",
      "Greetings. How can I be of help today?"
    ],
  },
  humorous: {
    pitch: 1.15,
    speed: 1.1,
    voicePreference: ['female', 'child-friendly'],
    greetings: [
      "Well, well, well! Look who's here! 😄",
      "Ahoy there! Ready for some fun? 🎉",
      "Hey superstar! What's the mission today? 🚀"
    ],
  },
  teacher: {
    pitch: 1.0,
    speed: 0.9,
    voicePreference: ['female', 'male'],
    greetings: [
      "Hello! Ready to learn something amazing? 📚",
      "Welcome! Let's explore together! 🎓",
      "Hi there! What would you like to discover today? 🌟"
    ],
  },
} as const;

// Sentiment detection patterns
const SENTIMENT_PATTERNS = {
  excited: /(!+|wow|amazing|awesome|great|love|wonderful)/i,
  frustrated: /(help|stuck|confused|don't understand|difficult)/i,
  curious: /(\?+|how|why|what|when|where|tell me)/i,
  calm: /(okay|ok|thanks|thank you|yes|no)/i,
};

export const useVoicePersonality = () => {
  const [settings, setSettings] = useState<VoicePersonalitySettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Limit conversation history to last 20 messages
        if (parsed.conversationHistory?.length > 20) {
          parsed.conversationHistory = parsed.conversationHistory.slice(-20);
        }
        setSettings(parsed);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load voice personality settings:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<VoicePersonalitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save voice personality settings:', error);
      }
      return updated;
    });
  }, []);

  // Update personality
  const setPersonality = useCallback((personality: VoicePersonality) => {
    const config = PERSONALITY_CONFIGS[personality];
    saveSettings({
      personality,
      pitch: config.pitch,
      speed: config.speed,
    });
  }, [saveSettings]);

  // Detect sentiment from user message
  const detectSentiment = useCallback((message: string): EmotionalTone => {
    if (SENTIMENT_PATTERNS.excited.test(message)) return 'excited';
    if (SENTIMENT_PATTERNS.frustrated.test(message)) return 'calm'; // Respond calmly to frustration
    if (SENTIMENT_PATTERNS.curious.test(message)) return 'empathetic';
    return 'neutral';
  }, []);

  // Add conversation to history
  const addToHistory = useCallback((userMessage: string, botResponse: string) => {
    const sentiment = detectSentiment(userMessage);
    const newEntry = {
      timestamp: new Date(),
      userMessage,
      botResponse,
      detectedSentiment: sentiment,
    };

    setSettings(prev => {
      const updatedHistory = [...prev.conversationHistory, newEntry].slice(-20); // Keep last 20
      const updated = {
        ...prev,
        conversationHistory: updatedHistory,
        emotionalTone: sentiment, // Update current emotional tone
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save conversation history:', error);
      }
      
      return updated;
    });
  }, [detectSentiment]);

  // Get personality-specific greeting
  const getGreeting = useCallback(() => {
    const config = PERSONALITY_CONFIGS[settings.personality];
    return config.greetings[Math.floor(Math.random() * config.greetings.length)];
  }, [settings.personality]);

  // Get voice settings with personality adjustments
  const getVoiceSettings = useCallback(() => {
    const config = PERSONALITY_CONFIGS[settings.personality];
    
    // Adjust pitch and speed based on emotional tone
    let pitchAdjustment = 0;
    let speedAdjustment = 0;
    
    switch (settings.emotionalTone) {
      case 'excited':
        pitchAdjustment = 0.1;
        speedAdjustment = 0.1;
        break;
      case 'calm':
        pitchAdjustment = -0.05;
        speedAdjustment = -0.1;
        break;
      case 'empathetic':
        pitchAdjustment = 0.05;
        speedAdjustment = -0.05;
        break;
    }

    return {
      pitch: Math.max(0.5, Math.min(2.0, config.pitch + pitchAdjustment)),
      speed: Math.max(0.5, Math.min(2.0, config.speed + speedAdjustment)),
      voicePreference: config.voicePreference,
    };
  }, [settings.personality, settings.emotionalTone]);

  // Get conversation context (for AI to remember)
  const getConversationContext = useCallback(() => {
    return settings.conversationHistory.slice(-5).map(entry => 
      `User: ${entry.userMessage}\nBot: ${entry.botResponse}`
    ).join('\n\n');
  }, [settings.conversationHistory]);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    saveSettings({ conversationHistory: [] });
  }, [saveSettings]);

  return {
    settings,
    isLoaded,
    setPersonality,
    addToHistory,
    getGreeting,
    getVoiceSettings,
    getConversationContext,
    clearHistory,
    personalityConfig: PERSONALITY_CONFIGS[settings.personality],
  };
};
