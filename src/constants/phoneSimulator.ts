// Phone Simulator Constants

// Timing constants (in milliseconds)
export const TIMING = {
  PROCESSING_DELAY: 200, // Reduced from 600ms for faster responses
  TYPING_SPEED: 30,
  SPEECH_END_DELAY: 300,
  CONTINUOUS_MODE_RESTART_DELAY: 800,
  AUTO_SCROLL_DELAY: 100,
  TIME_UPDATE_INTERVAL: 60000,
  NETWORK_ERROR_RETRY_DELAY: 2000,
  VOICE_MODE_SKIP_TYPING: true, // Skip typing animation when using voice
} as const;

// Intent matching constants
export const INTENT_MATCHING = {
  FUZZY_THRESHOLD: 0.3,
  MIN_MATCH_LENGTH: 2,
} as const;

// Language mappings
export const LANGUAGE_CODES = {
  en: 'en-US',
  sw: 'sw-KE',
  ar: 'ar-SA',
} as const;

// Phone UI dimensions
export const PHONE_UI = {
  WIDTH: 400,
  HEIGHT: 820,
  BORDER_WIDTH: 12,
  BORDER_RADIUS: '3.5rem',
  NOTCH_WIDTH: 176, // w-44 = 11rem = 176px
  NOTCH_HEIGHT: 32, // h-8 = 2rem = 32px
  MAX_MESSAGE_HISTORY: 100,
} as const;

// Animation delays
export const ANIMATION = {
  BOUNCE_DELAY_STEP: 150,
} as const;

// Default voice settings
export const VOICE_DEFAULTS = {
  RATE: 1.0,
  PITCH: 1.0,
} as const;
