import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, X, Volume2, Wifi, Battery, Signal, Send, User, Moon, Sun, Copy, RotateCcw, Settings2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVoicePersistence } from '@/hooks/useVoicePersistence';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useLanguage } from '@/contexts/LanguageContext';
import { Node, Edge } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { VoiceAnimation } from './VoiceAnimations';
import { useAvatarPersistence } from '@/hooks/useAvatarPersistence';
import Fuse from 'fuse.js';
import { TIMING, INTENT_MATCHING, LANGUAGE_CODES, PHONE_UI, ANIMATION, VOICE_DEFAULTS } from '@/constants/phoneSimulator';
import { formatMessageTime, normalizePhrase } from '@/utils/phoneSimulatorHelpers';

interface PhoneAssistantSimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  botName?: string;
  botAvatar?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number; // For intent match confidence
  cached?: boolean; // For showing cache hits
}

export const PhoneAssistantSimulator = ({
  open,
  onOpenChange,
  nodes,
  edges,
  botName = 'Assistant',
  botAvatar = '🤖',
}: PhoneAssistantSimulatorProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [state, setState] = useState<'idle' | 'processing' | 'typing' | 'speaking'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [inputError, setInputError] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('phoneSimulator_theme');
    return saved === 'dark';
  });
  const [continuousMode, setContinuousMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recognitionState, setRecognitionState] = useState<'idle' | 'starting' | 'active' | 'stopping'>('idle');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const { voiceSettings, getBrowserVoice, isLoaded } = useVoicePersistence();
  const { speak: speechSynth, stop: stopSpeech } = useSpeechSynthesis();
  const { avatar: displayAvatar } = useAvatarPersistence(botAvatar);
  const { language, isRTL, t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const messageQueueRef = useRef<string[]>([]);
  const responseCache = useRef(new Map<string, { intent: any; response: string; timestamp: number }>());
  const CACHE_SIZE_LIMIT = 50; // LRU cache size limit
  const typingAnimationRef = useRef<number | null>(null);
  const voicesCacheRef = useRef<SpeechSynthesisVoice[]>([]);

  // Validation: Check if intents are configured with detailed logging
  useEffect(() => {
    if (open) {
      console.log('[Phone Simulator] Validating intents...', { totalNodes: nodes?.length });
      
      const validIntents = nodes?.filter(node => {
        const hasLabel = node.data?.label;
        const hasResponses = Array.isArray(node.data?.responses) && node.data.responses.length > 0;
        const hasTraining = Array.isArray(node.data?.trainingPhrases) && node.data.trainingPhrases.length > 0;
        
        if (!hasLabel) {
          console.warn('[Phone Simulator] Node missing label:', node.id);
          return false;
        }
        if (!hasResponses) {
          console.warn('[Phone Simulator] Intent has no responses:', node.data.label);
        }
        if (!hasTraining && !node.data.isDefault) {
          console.warn('[Phone Simulator] Intent has no training phrases:', node.data.label);
        }
        
        return hasLabel && hasResponses;
      });
      
      console.log('[Phone Simulator] Valid intents found:', validIntents?.length, validIntents?.map(n => ({
        id: n.id,
        label: n.data.label,
        training: Array.isArray(n.data.trainingPhrases) ? n.data.trainingPhrases.length : 0,
        responses: Array.isArray(n.data.responses) ? n.data.responses.length : 0
      })));
      
      if (!validIntents || validIntents.length === 0) {
        setValidationError(t('noIntentsConfigured') || 'No intents configured yet. Please create and train at least one intent in the bot builder.');
      } else {
        setValidationError(null);
      }
    }
  }, [open, nodes, t]);

  // Optimized voice loading with caching
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
    setRecognitionSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          voicesCacheRef.current = voices;
          setAvailableVoices(voices);
          
          // Auto-select first voice if none selected
          if (!selectedVoiceId && voices.length > 0) {
            setSelectedVoiceId(voices[0].voiceURI);
          }
        }
      };
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, [selectedVoiceId]);

  // Update time every minute and persist theme
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), TIMING.TIME_UPDATE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem('phoneSimulator_theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  // Memoize expensive computations
  const validIntentCount = useMemo(() => {
    return nodes?.filter(n => n.data?.label && Array.isArray(n.data?.responses) && n.data.responses.length > 0).length || 0;
  }, [nodes]);

  const isProcessing = state === 'processing';
  const isTyping = state === 'typing';
  const isSpeaking = state === 'speaking';

  // Auto-scroll to bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, TIMING.AUTO_SCROLL_DELAY);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Limit message history to prevent memory issues
  useEffect(() => {
    if (messages.length > PHONE_UI.MAX_MESSAGE_HISTORY) {
      setMessages(prev => prev.slice(-PHONE_UI.MAX_MESSAGE_HISTORY));
    }
  }, [messages]);

  // Multi-strategy intent matching with normalization
  const findMatchingIntent = useCallback((userInput: string) => {
    const normalizedInput = normalizePhrase(userInput);
    
    if (!normalizedInput) return null;
    
    console.log('[Intent Matching] Starting search for:', userInput);
    console.log('[Intent Matching] Normalized input:', normalizedInput);
    
    // Find intent nodes with valid data - use 'label' as primary identifier
    const intentNodes = nodes.filter(node => {
      const hasLabel = node.data?.label;
      const hasResponses = Array.isArray(node.data?.responses) && node.data.responses.length > 0;
      
      // Node must have label and responses to be usable
      return hasLabel && hasResponses;
    });
    
    console.log('[Intent Matching] Valid nodes:', intentNodes.length);
    
    if (intentNodes.length === 0) {
      console.warn('[Intent Matching] No valid intent nodes found');
      return null;
    }
    
    // Strategy 1: Exact match (highest priority)
    for (const node of intentNodes) {
      const normalizedLabel = normalizePhrase(String(node.data.label || ''));
      
      // Check training phrases for exact match
      if (Array.isArray(node.data.trainingPhrases)) {
        for (const phrase of node.data.trainingPhrases) {
          if (typeof phrase === 'string' && normalizePhrase(phrase) === normalizedInput) {
            console.log('[Intent Matching] ✓ EXACT MATCH on training phrase:', phrase, 'for intent:', node.data.label);
            return node;
          }
        }
      }
      
      // Check label for exact match
      if (normalizedLabel === normalizedInput) {
        console.log('[Intent Matching] ✓ EXACT MATCH on label:', node.data.label);
        return node;
      }
    }
    
    // Strategy 2: Fuzzy match on training phrases (medium priority)
    const searchData = intentNodes.flatMap(node => {
      const phrases: string[] = [];
      
      // Add normalized training phrases
      if (Array.isArray(node.data.trainingPhrases)) {
        const validPhrases = node.data.trainingPhrases
          .filter((p): p is string => p && typeof p === 'string')
          .map(p => normalizePhrase(p))
          .filter(p => p.length > 0);
        phrases.push(...validPhrases);
      }
      
      // Add normalized label
      const normalizedLabel = normalizePhrase(String(node.data.label || ''));
      if (normalizedLabel) {
        phrases.push(normalizedLabel);
      }
      
      return phrases.map(phrase => ({
        phrase,
        nodeId: node.id,
        node
      }));
    });
    
    console.log('[Intent Matching] Search data prepared:', searchData.length, 'normalized phrases across', intentNodes.length, 'nodes');
    
    if (searchData.length === 0) {
      console.warn('[Intent Matching] No search data available');
      return null;
    }
    
    // Configure Fuse.js for fuzzy matching with adjusted threshold
    const fuse = new Fuse(searchData, {
      keys: ['phrase'],
      threshold: 0.4, // More lenient threshold (was 0.3)
      includeScore: true,
      minMatchCharLength: INTENT_MATCHING.MIN_MATCH_LENGTH,
      distance: 100, // Allow more character variations
      ignoreLocation: true // Don't penalize matches based on position
    });
    
    // Search for matches
    const results = fuse.search(normalizedInput);
    
    console.log('[Intent Matching] Fuse.js results:', results.slice(0, 5).map(r => ({
      phrase: r.item.phrase,
      nodeLabel: r.item.node.data.label,
      score: r.score
    })));
    
    if (results.length > 0) {
      const bestMatch = results[0];
      console.log('[Intent Matching] ✓ FUZZY MATCH:', bestMatch.item.node.data.label, 'with score:', bestMatch.score);
      return bestMatch.item.node;
    }
    
    // Strategy 3: Fallback node (lowest priority)
    console.log('[Intent Matching] No match found, looking for fallback');
    const fallback = intentNodes.find(node => 
      node.data.isDefault === true || 
      (typeof node.data.label === 'string' && normalizePhrase(node.data.label).includes('fallback'))
    );
    
    if (fallback) {
      console.log('[Intent Matching] ✓ Using FALLBACK node:', fallback.data.label);
    } else {
      console.warn('[Intent Matching] ✗ No fallback node available');
    }
    
    return fallback || null;
  }, [nodes]);

  const generateResponse = useCallback((matchedNode: any) => {
    // If no node matched, return fallback
    if (!matchedNode) {
      const fallbackResponses = [
        t('sorryNoResponse') || "I'm not sure how to respond to that.",
        t('tryAgain') || "Could you rephrase that?",
        t('noMatch') || "I didn't quite understand. Can you try saying it differently?"
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    // Get responses from the matched node
    const responses = matchedNode.data?.responses || [];
    
    if (responses.length === 0) {
      return t('noResponseConfigured') || "I found the intent but no response is configured yet. Please add responses in the bot builder.";
    }
    
    // Filter out empty responses
    const validResponses = responses.filter((r: string) => r && r.trim());
    
    if (validResponses.length === 0) {
      return t('noValidResponse') || "Response configured but empty. Please check your bot configuration.";
    }
    
    const randomIndex = Math.floor(Math.random() * validResponses.length);
    return validResponses[randomIndex];
  }, [t]);

  // Clear speech queue and stop speaking
  const clearSpeechQueue = useCallback(() => {
    messageQueueRef.current = [];
    window.speechSynthesis.cancel();
    setState('idle');
  }, []);

  // Optimized speech synthesis
  const speak = useCallback((text: string) => {
    if (!audioEnabled || !speechSupported) return;

    // Use cached voices for better performance
    const voices = voicesCacheRef.current.length > 0 ? voicesCacheRef.current : window.speechSynthesis.getVoices();
    
    // Priority: user-selected > saved settings > language match > first available
    let matchedVoice = null;
    
    if (selectedVoiceId) {
      matchedVoice = voices.find(v => v.voiceURI === selectedVoiceId);
    }
    
    if (!matchedVoice && isLoaded && voiceSettings.enabled) {
      matchedVoice = getBrowserVoice();
    }
    
    if (!matchedVoice) {
      const targetLang = LANGUAGE_CODES[language as keyof typeof LANGUAGE_CODES] || LANGUAGE_CODES.en;
      matchedVoice = voices.find(v => v.lang === targetLang) || voices[0];
    }

    const onEndCallback = () => {
      setState('idle');
      
      // Process next message in queue
      if (messageQueueRef.current.length > 0) {
        const nextMessage = messageQueueRef.current.shift();
        if (nextMessage) {
          setTimeout(() => speak(nextMessage), TIMING.SPEECH_END_DELAY);
        }
        return;
      }
      
      // Restart listening in continuous mode
      if (continuousMode && recognitionRef.current) {
        setTimeout(() => {
          try {
            if (recognitionRef.current && !isListening) {
              recognitionRef.current.start();
              setIsListening(true);
              setRecognitionState('active');
            }
          } catch (error) {
            console.warn('[Speech] Failed to restart recognition:', error);
          }
        }, TIMING.CONTINUOUS_MODE_RESTART_DELAY);
      }
    };

    if (state === 'speaking') {
      messageQueueRef.current.push(text);
      return;
    }

    setState('speaking');
    
    if (matchedVoice) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = matchedVoice;
      utterance.rate = (isLoaded && voiceSettings.speed) ? voiceSettings.speed : VOICE_DEFAULTS.RATE;
      utterance.pitch = (isLoaded && voiceSettings.pitch) ? voiceSettings.pitch : VOICE_DEFAULTS.PITCH;
      window.speechSynthesis.speak(utterance);
      utterance.onend = onEndCallback;
      utterance.onerror = onEndCallback;
    } else {
      speechSynth(text, onEndCallback);
    }
  }, [audioEnabled, speechSupported, language, isLoaded, voiceSettings, getBrowserVoice, 
      continuousMode, state, isListening, speechSynth, selectedVoiceId]);

  const handleUserMessage = useCallback((userInput: string) => {
    const trimmedInput = userInput.trim();
    
    if (!trimmedInput) {
      setInputError(t('emptyMessage') || 'Please say something');
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputError('');
    
    // Update state machine
    setState('processing');
    
    // Check cache first for faster responses - use normalized input as cache key
    const cacheKey = normalizePhrase(trimmedInput);
    const cached = responseCache.current.get(cacheKey);
    
    let matchedNode;
    let responseText;
    
    if (cached) {
      console.log('[Response Cache] ✓ Cache hit for:', trimmedInput);
      matchedNode = cached.intent;
      responseText = cached.response;
      
      // Instant response for cached - use startTransition for better performance
      startTransition(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: responseText,
          timestamp: new Date(),
          cached: true,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setState('idle');
      });
      
      // Speak immediately
      if (audioEnabled && speechSupported) {
        speak(responseText);
      }
      
      import('@/utils/phoneSimulatorHelpers').then(({ announceForScreenReader }) => {
        announceForScreenReader(`Assistant: ${responseText}`);
      });
    } else {
      // Simulate realistic processing delay (reduced from 600ms to 200ms)
      setTimeout(() => {
        matchedNode = findMatchingIntent(trimmedInput);
        responseText = generateResponse(matchedNode);
        
        // Cache the response with LRU eviction
        if (responseCache.current.size >= CACHE_SIZE_LIMIT) {
          // Remove oldest entry (LRU eviction)
          const oldestKey = responseCache.current.keys().next().value;
          if (oldestKey) {
            responseCache.current.delete(oldestKey);
            console.log('[Response Cache] Evicted oldest entry:', oldestKey);
          }
        }
        
        responseCache.current.set(cacheKey, { 
          intent: matchedNode, 
          response: responseText,
          timestamp: Date.now()
        });
        console.log('[Response Cache] Cached new response. Cache size:', responseCache.current.size);
        
        // Optimized typing animation with requestAnimationFrame
        const shouldSkipTyping = audioEnabled && TIMING.VOICE_MODE_SKIP_TYPING;
        const MAX_TYPED_CHARS = 200; // Cap typing animation for long messages
        
        if (shouldSkipTyping || responseText.length > MAX_TYPED_CHARS) {
          // Show response immediately
          startTransition(() => {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: responseText,
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setState('idle');
          });
          
          speak(responseText);
          
          import('@/utils/phoneSimulatorHelpers').then(({ announceForScreenReader }) => {
            announceForScreenReader(`Assistant: ${responseText}`);
          });
        } else {
          // Optimized typing with requestAnimationFrame
          setState('typing');
          let displayedText = '';
          const chars = responseText.split('');
          let charIndex = 0;
          let lastFrameTime = performance.now();
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: '',
            timestamp: new Date(),
          };
          
          startTransition(() => {
            setMessages(prev => [...prev, assistantMessage]);
          });
          
          const animateTyping = (currentTime: number) => {
            const elapsed = currentTime - lastFrameTime;
            
            if (elapsed >= TIMING.TYPING_SPEED) {
              lastFrameTime = currentTime;
              
              if (charIndex < chars.length) {
                displayedText += chars[charIndex];
                
                startTransition(() => {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: displayedText }
                        : msg
                    )
                  );
                });
                
                charIndex++;
                typingAnimationRef.current = requestAnimationFrame(animateTyping);
              } else {
                // Typing complete
                setState('idle');
                speak(responseText);
                
                import('@/utils/phoneSimulatorHelpers').then(({ announceForScreenReader }) => {
                  announceForScreenReader(`Assistant: ${responseText}`);
                });
              }
            } else {
              typingAnimationRef.current = requestAnimationFrame(animateTyping);
            }
          };
          
          typingAnimationRef.current = requestAnimationFrame(animateTyping);
        }
      }, TIMING.PROCESSING_DELAY);
    }
  }, [findMatchingIntent, generateResponse, speak, audioEnabled, speechSupported, t]);

  const toggleListening = useCallback(() => {
    if (!recognitionSupported) {
      setInputError(t('speechNotSupported') || 'Speech recognition not supported');
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Match language with current context
      recognitionRef.current.lang = LANGUAGE_CODES[language as keyof typeof LANGUAGE_CODES] || LANGUAGE_CODES.en;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setRecognitionState('active');
        
        // Announce listening state for accessibility
        import('@/utils/phoneSimulatorHelpers').then(({ announceForScreenReader }) => {
          announceForScreenReader('Listening');
        });
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        
        // Only send if there's actual content
        if (transcript.trim()) {
          handleUserMessage(transcript);
        } else {
          setInputError(t('emptyMessage') || 'Please say something');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (recognitionState !== 'stopping') {
          setRecognitionState('idle');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        const errorMessages: Record<string, string> = {
          'no-speech': t('noSpeechDetected') || 'No speech detected. Please try again.',
          'audio-capture': t('microphoneError') || 'Microphone error. Please check your settings.',
          'network': t('networkError') || 'Network error. Please check your connection.',
          'not-allowed': t('microphonePermission') || 'Microphone permission denied.',
        };
        
        const errorMsg = errorMessages[event.error] || t('speechError') || 'Speech recognition error';
        setInputError(errorMsg);
        setIsListening(false);
        setRecognitionState('idle');
        
        // Auto-retry on network errors
        if (event.error === 'network' && continuousMode) {
          setTimeout(() => {
            if (recognitionState !== 'stopping') {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                // Ignore
              }
            }
          }, TIMING.NETWORK_ERROR_RETRY_DELAY);
        }
      };
    }

    // Prevent race conditions with state guards
    if (isListening && recognitionState === 'active') {
      setRecognitionState('stopping');
      setContinuousMode(false);
      
      // Clear speech queue and cancel typing when user interrupts
      clearSpeechQueue();
      if (typingAnimationRef.current) {
        cancelAnimationFrame(typingAnimationRef.current);
        typingAnimationRef.current = null;
      }
      
      try {
        recognitionRef.current.stop();
      } catch (error) {
        setRecognitionState('idle');
      }
    } else if (!isListening && recognitionState === 'idle' && !isSpeaking) {
      setRecognitionState('starting');
      setContinuousMode(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        setInputError(t('speechStartError') || 'Failed to start listening');
        setRecognitionState('idle');
      }
    }
  }, [recognitionSupported, isListening, recognitionState, state, continuousMode, handleUserMessage, language, t, clearSpeechQueue]);

  const handleSendMessage = () => {
    const trimmed = inputText.trim();
    if (trimmed) {
      handleUserMessage(trimmed);
      setInputText('');
    } else {
      setInputError(t('emptyMessage') || 'Please type something');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (audioEnabled && speechSupported) {
      clearSpeechQueue();
    }
  };

  // Cleanup on unmount and typing animation
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      if (typingAnimationRef.current) {
        cancelAnimationFrame(typingAnimationRef.current);
      }
      stopSpeech();
      messageQueueRef.current = [];
    };
  }, [stopSpeech]);

  // Helper functions for UX improvements
  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: t('copied') || 'Copied!',
      });
    });
  }, [t]);

  const regenerateResponse = useCallback((userInput: string) => {
    // Remove cached response and regenerate
    const cacheKey = normalizePhrase(userInput);
    responseCache.current.delete(cacheKey);
    handleUserMessage(userInput);
  }, [handleUserMessage]);

  const testCurrentVoice = useCallback(() => {
    const testText = t('voiceTestMessage') || 'Hello! This is how I sound.';
    speak(testText);
  }, [speak, t]);

  const clearCache = useCallback(() => {
    responseCache.current.clear();
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: t('cacheCleared') || 'Cache cleared!',
      });
    });
  }, [t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 flex flex-col overflow-hidden mx-auto border-[12px]",
          isDarkTheme ? "border-gray-900" : "border-gray-800",
          isRTL && "rtl"
        )} 
        style={{ 
          width: `${PHONE_UI.WIDTH}px`, 
          height: `${PHONE_UI.HEIGHT}px`,
          maxHeight: '95vh',
          borderRadius: PHONE_UI.BORDER_RADIUS
        }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Accessibility - Hidden dialog title and description */}
        <VisuallyHidden>
          <DialogTitle>{botName} Phone Simulator</DialogTitle>
          <DialogDescription>
            Interactive voice assistant simulator. Use the microphone button to speak or type messages to interact with {botName}.
          </DialogDescription>
        </VisuallyHidden>
        
        
        {/* Phone Frame with Kid-Friendly Gradient */}
        <div className={cn(
          "relative w-full h-full overflow-hidden flex flex-col rounded-[3rem]",
          isDarkTheme 
            ? "bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950" 
            : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
        )}>
          
          {/* Status Bar */}
          <div className={cn(
            "px-8 pt-4 pb-2 flex items-center justify-between flex-shrink-0 text-xs",
            isDarkTheme ? "text-white/80" : "text-gray-700"
          )}>
            <span className="font-semibold">
              {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4" />
              <Wifi className="h-4 w-4" />
              <Battery className="h-4 w-4" />
            </div>
          </div>

          {/* Notch Simulation */}
          <div 
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 rounded-b-3xl z-50",
              isDarkTheme ? "bg-gray-950" : "bg-gray-900"
            )}
            style={{ width: `${PHONE_UI.NOTCH_WIDTH}px`, height: `${PHONE_UI.NOTCH_HEIGHT}px` }}
          />
          
          {/* Header with Bot Info */}
          <div className={cn(
            "px-6 py-4 flex items-center justify-between flex-shrink-0 relative z-10",
            isDarkTheme ? "bg-black/20" : "bg-white/40"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-2xl shadow-xl ring-4 ring-white/20">
                {displayAvatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={cn("font-bold text-base", isDarkTheme ? "text-white" : "text-gray-900")}>
                    {botName}
                  </h3>
                  {!validationError && validIntentCount > 0 ? (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 animate-fade-in",
                      isDarkTheme ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"
                    )}>
                      <CheckCircle2 className="h-3 w-3" /> {validIntentCount} {validIntentCount === 1 ? 'intent' : 'intents'}
                    </span>
                  ) : validationError ? (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1",
                      isDarkTheme ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700"
                    )}>
                      <XCircle className="h-3 w-3" /> Setup needed
                    </span>
                  ) : null}
                </div>
                <p className={cn("text-xs font-medium", isDarkTheme ? "text-purple-300" : "text-purple-600")}>
                  {validationError 
                    ? t('setupRequired') || 'Setup Required' 
                    : continuousMode 
                      ? '🎤 ' + t('assistant.active', 'Active') 
                      : t('assistant.inactive', 'Tap mic to start')
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                {/* Voice Settings */}
                <Popover open={showVoiceSettings} onOpenChange={setShowVoiceSettings}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-9 w-9 rounded-full",
                        isDarkTheme ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-200"
                      )}
                      aria-label="Voice settings"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={cn("w-72", isDarkTheme && "bg-gray-900 border-gray-700")}>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">🎤 Voice Settings</h4>
                        <p className="text-xs text-muted-foreground">Customize how {botName} sounds</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Select Voice</label>
                        <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a voice..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableVoices.map((voice) => (
                              <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                                {voice.name} ({voice.lang})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={testCurrentVoice} className="flex-1">
                          🔊 Test Voice
                        </Button>
                        <Button size="sm" variant="outline" onClick={clearCache} className="flex-1">
                          🗑️ Clear Cache
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        <p>Cache: {responseCache.current.size}/{CACHE_SIZE_LIMIT} entries</p>
                        <p>Voices loaded: {availableVoices.length}</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Audio Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleAudio}
                      className={cn(
                        "h-9 w-9 rounded-full transition-all",
                        audioEnabled 
                          ? "text-blue-500 hover:bg-blue-500/20 bg-blue-500/10"
                          : isDarkTheme ? "text-gray-500 hover:bg-gray-800" : "text-gray-400 hover:bg-gray-200"
                      )}
                      aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {audioEnabled ? 'Sound On' : 'Sound Off'}
                  </TooltipContent>
                </Tooltip>

                {/* Theme Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsDarkTheme(!isDarkTheme)}
                      className={cn(
                        "h-9 w-9 rounded-full",
                        isDarkTheme ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-200"
                      )}
                      aria-label="Toggle theme"
                    >
                      {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
                  </TooltipContent>
                </Tooltip>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "h-9 w-9 rounded-full",
                    isDarkTheme ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-200"
                  )}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipProvider>
            </div>
          </div>

          {/* Voice Animation Overlay with pulsing mic for continuous mode */}
          {(isListening || isSpeaking || isProcessing) && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-[3.5rem]">
              {/* Pulsing ring for listening state */}
              {isListening && continuousMode && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-4 border-blue-500/30 animate-ping" />
                  <div className="w-48 h-48 rounded-full border-4 border-purple-500/30 animate-ping absolute" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
              
              <div className="scale-150 relative z-10">
                <VoiceAnimation 
                  language={language as 'en' | 'sw' | 'ar'}
                  style={isProcessing ? "orb" : "waveform"}
                  isActive={isListening || isSpeaking || isProcessing}
                />
              </div>
              
              {isProcessing && (
                <div className="absolute bottom-32 text-white text-sm font-medium animate-pulse">
                  {t('thinking') || 'Thinking...'}
                </div>
              )}
              
              {isListening && continuousMode && (
                <div className="absolute bottom-32 text-white text-xs font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                  💡 {t('tapToInterrupt') || 'Tap mic to stop'}
                </div>
              )}
            </div>
          )}

          {/* Chat Area */}
          <div className={cn(
            "flex-1 overflow-y-auto px-4 py-4 space-y-3",
            isDarkTheme ? "bg-gradient-to-b from-indigo-950/40 to-purple-950/40" : "bg-gradient-to-b from-transparent to-white/30"
          )} dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Setup Banner - Less Intrusive */}
            {validationError ? (
              <div className={cn(
                "mx-2 mb-2 p-3 rounded-xl border-2 border-dashed",
                isDarkTheme ? "bg-orange-500/10 border-orange-500/30" : "bg-orange-50 border-orange-300"
              )}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🛠️</div>
                  <div className="flex-1">
                    <p className={cn("text-xs font-semibold mb-1", isDarkTheme ? "text-orange-300" : "text-orange-700")}>
                      {t('setupRequired') || 'Quick Setup Needed!'}
                    </p>
                    <p className={cn("text-xs", isDarkTheme ? "text-orange-200/70" : "text-orange-600/80")}>
                      ✨ Train an intent → Add phrases → Add responses → Test!
                    </p>
                  </div>
                </div>
              </div>
            ) : validIntentCount > 0 && messages.length === 0 ? (
              <div className={cn(
                "mx-2 mb-2 p-3 rounded-xl animate-fade-in",
                isDarkTheme ? "bg-green-500/10 border border-green-500/20" : "bg-green-50 border border-green-200"
              )}>
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className={cn("h-4 w-4", isDarkTheme ? "text-green-300" : "text-green-600")} />
                  <p className={cn("text-xs font-medium", isDarkTheme ? "text-green-300" : "text-green-700")}>
                    ✅ {botName} is ready! Say hi or type a message below.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 animate-fade-in",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm flex-shrink-0">
                    {displayAvatar}
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1 max-w-[75%]">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 shadow-md relative group",
                      message.type === 'user'
                        ? "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900"
                        : isDarkTheme 
                          ? "bg-white/10 text-white backdrop-blur-sm"
                          : "bg-white text-gray-900"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={cn(
                              "text-xs cursor-help flex items-center gap-1",
                              message.type === 'user' 
                                ? "text-gray-600" 
                                : isDarkTheme ? "text-white/50" : "text-gray-500"
                            )}>
                              {message.cached && <span className="text-green-500">⚡</span>}
                              {formatMessageTime(message.timestamp)}
                              {debugMode && message.confidence !== undefined && (
                                <span className="ml-1 text-xs opacity-70">
                                  {Math.round(message.confidence * 100)}%
                                </span>
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p>{message.timestamp.toLocaleString()}</p>
                              {message.cached && <p className="text-green-500">⚡ From cache</p>}
                              {debugMode && message.confidence !== undefined && (
                                <p>Confidence: {Math.round(message.confidence * 100)}%</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Message Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {message.type === 'assistant' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              const userMsg = messages[messages.findIndex(m => m.id === message.id) - 1];
                              if (userMsg) regenerateResponse(userMsg.content);
                            }}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator with Skip Button */}
            {isTyping && (
              <div className="flex gap-2 justify-start animate-fade-in items-end">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm flex-shrink-0">
                  {displayAvatar}
                </div>
                <div className="flex flex-col gap-1">
                  <div className={cn(
                    "rounded-2xl px-4 py-3 shadow-md",
                    isDarkTheme ? "bg-white/10 backdrop-blur-sm" : "bg-white"
                  )}>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      if (typingAnimationRef.current) {
                        cancelAnimationFrame(typingAnimationRef.current);
                        typingAnimationRef.current = null;
                        setState('idle');
                      }
                    }}
                  >
                    ⏭️ Skip
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={cn(
            "p-4 flex-shrink-0 border-t",
            isDarkTheme ? "bg-black/30 border-white/10" : "bg-white/50 border-gray-200"
          )}>
            {inputError && (
              <p className="text-xs text-red-500 mb-2 text-center">{inputError}</p>
            )}
            <div className="flex items-center gap-2">
              <Input
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (e.target.value.trim()) {
                    setInputError('');
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder={t('typeMessage') || 'Type a message...'}
                disabled={continuousMode}
                className={cn(
                  "flex-1 rounded-full border-2 px-4 py-2",
                  isDarkTheme 
                    ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    : "bg-white border-gray-300 text-gray-900"
                )}
                aria-label="Message input"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || continuousMode}
                className={cn(
                  "rounded-full h-10 w-10 p-0",
                  isDarkTheme ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                onClick={toggleListening}
                disabled={!recognitionSupported}
                className={cn(
                  "rounded-full h-16 w-16 p-0 shadow-xl transition-all",
                  continuousMode
                    ? "bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 animate-pulse"
                    : "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:scale-110"
                )}
              >
                {continuousMode ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};