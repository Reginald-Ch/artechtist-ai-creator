import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, X, Volume2, Wifi, Battery, Signal, Send, User, Moon, Sun } from 'lucide-react';
import { useVoicePersistence } from '@/hooks/useVoicePersistence';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useLanguage } from '@/contexts/LanguageContext';
import { Node, Edge } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { VoiceAnimation } from './VoiceAnimations';
import { useAvatarPersistence } from '@/hooks/useAvatarPersistence';
import Fuse from 'fuse.js';
import { TIMING, INTENT_MATCHING, LANGUAGE_CODES, PHONE_UI, ANIMATION, VOICE_DEFAULTS } from '@/constants/phoneSimulator';
import { formatMessageTime } from '@/utils/phoneSimulatorHelpers';

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
  
  const { voiceSettings, getBrowserVoice, isLoaded } = useVoicePersistence();
  const { speak: speechSynth, stop: stopSpeech } = useSpeechSynthesis();
  const { avatar: displayAvatar } = useAvatarPersistence(botAvatar);
  const { language, isRTL, t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const messageQueueRef = useRef<string[]>([]);

  // Validate training data on mount
  useEffect(() => {
    if (open && nodes && edges) {
      const hasIntents = nodes.some(node => 
        node.data?.intent && 
        node.data?.responses && 
        Array.isArray(node.data.responses) &&
        node.data.responses.length > 0
      );
      
      if (!hasIntents) {
        setValidationError(t('noIntentsConfigured') || 'No intents configured. Please add training data to your bot first.');
      } else {
        setValidationError(null);
      }
    }
  }, [open, nodes, edges, t]);

  // Check browser support on mount
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
    setRecognitionSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  // Update time every minute and persist theme
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), TIMING.TIME_UPDATE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem('phoneSimulator_theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

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

  // Improved intent matching with fuzzy search
  const findMatchingIntent = useCallback((userInput: string) => {
    const input = userInput.toLowerCase().trim();
    
    if (!input) return null;
    
    // Find intent nodes with training data
    const intentNodes = nodes.filter(node => 
      node.data?.intent && 
      (Array.isArray(node.data?.responses) && node.data.responses.length > 0 || 
       Array.isArray(node.data?.trainingPhrases) && node.data.trainingPhrases.length > 0)
    );
    
    if (intentNodes.length === 0) return null;
    
    // Prepare search data with intent names and training phrases
    const searchData = intentNodes.flatMap(node => {
      const phrases = [node.data.intent];
      if (Array.isArray(node.data.trainingPhrases)) {
        phrases.push(...node.data.trainingPhrases);
      }
      return phrases.map(phrase => ({
        phrase: String(phrase),
        nodeId: node.id
      }));
    });
    
    // Configure Fuse.js for fuzzy matching
    const fuse = new Fuse(searchData, {
      keys: ['phrase'],
      threshold: INTENT_MATCHING.FUZZY_THRESHOLD,
      includeScore: true,
      minMatchCharLength: INTENT_MATCHING.MIN_MATCH_LENGTH
    });
    
    // Search for matches
    const results = fuse.search(input);
    
    if (results.length > 0) {
      const bestMatch = results[0];
      const matchedNode = intentNodes.find(node => node.id === bestMatch.item.nodeId);
      return matchedNode || null;
    }
    
    return null;
  }, [nodes]);

  const generateResponse = useCallback((matchedNode: any) => {
    if (!matchedNode?.data?.responses || matchedNode.data.responses.length === 0) {
      const fallbackResponses = [
        t('sorryNoResponse') || "I'm not sure how to respond to that.",
        t('tryAgain') || "Could you rephrase that?",
        t('noMatch') || "I didn't quite understand. Can you try saying it differently?"
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    const randomIndex = Math.floor(Math.random() * matchedNode.data.responses.length);
    return matchedNode.data.responses[randomIndex];
  }, [t]);

  // Speech synthesis with queue management and language matching
  const speak = useCallback((text: string) => {
    if (!audioEnabled || !speechSupported) return;

    // Get voice matching current language
    const targetLang = LANGUAGE_CODES[language as keyof typeof LANGUAGE_CODES] || LANGUAGE_CODES.en;
    
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === targetLang) || 
                        (isLoaded && voiceSettings.enabled ? getBrowserVoice() : null) ||
                        voices[0];

    // Configure speech with language-matched voice
    const onEndCallback = () => {
      setIsSpeaking(false);
      
      // Process next message in queue
      if (messageQueueRef.current.length > 0) {
        const nextMessage = messageQueueRef.current.shift();
        if (nextMessage) {
          setTimeout(() => speak(nextMessage), TIMING.SPEECH_END_DELAY);
        }
        return;
      }
      
      // Restart listening in continuous mode with delay
      if (continuousMode && recognitionRef.current) {
        setTimeout(() => {
          try {
            if (recognitionRef.current && !isListening) {
              recognitionRef.current.start();
              setIsListening(true);
              setRecognitionState('active');
            }
          } catch (error) {
            // Ignore if already started
          }
        }, TIMING.CONTINUOUS_MODE_RESTART_DELAY);
      }
    };

    if (isSpeaking) {
      messageQueueRef.current.push(text);
      return;
    }

    setIsSpeaking(true);
    
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
      continuousMode, recognitionState, isSpeaking, speechSynth]);

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
    
    // Show processing state
    setIsProcessing(true);
    setIsTyping(true);
    
    // Simulate realistic processing delay
    setTimeout(() => {
      const matchedNode = findMatchingIntent(trimmedInput);
      const responseText = generateResponse(matchedNode);
      
      // Type out response character by character
      let displayedText = '';
      const chars = responseText.split('');
      let charIndex = 0;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      const typeInterval = setInterval(() => {
        if (charIndex < chars.length) {
          displayedText += chars[charIndex];
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: displayedText }
                : msg
            )
          );
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setIsProcessing(false);
          speak(responseText);
          
          // Announce response for screen readers
          import('@/utils/phoneSimulatorHelpers').then(({ announceForScreenReader }) => {
            announceForScreenReader(`Assistant: ${responseText}`);
          });
        }
      }, TIMING.TYPING_SPEED);
    }, TIMING.PROCESSING_DELAY);
  }, [findMatchingIntent, generateResponse, speak, t]);

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
  }, [recognitionSupported, isListening, recognitionState, isSpeaking, continuousMode, handleUserMessage, language, t]);

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
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      stopSpeech();
      messageQueueRef.current = [];
    };
  }, [stopSpeech]);

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
        role="dialog"
        aria-label={`${botName} phone simulator`}
      >
        
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
                <h3 className={cn("font-bold text-base", isDarkTheme ? "text-white" : "text-gray-900")}>
                  {botName}
                </h3>
                <p className={cn("text-xs font-medium", isDarkTheme ? "text-purple-300" : "text-purple-600")}>
                  {continuousMode ? '🎤 ' + t('assistant.active', 'Active') : t('assistant.inactive', 'Tap mic to start')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsDarkTheme(!isDarkTheme);
                }}
                className={cn(
                  "h-9 w-9 rounded-full",
                  isDarkTheme ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-200"
                )}
                aria-label="Toggle theme"
              >
                {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
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
            </div>
          </div>

          {/* Voice Animation Overlay */}
          {(isListening || isSpeaking || isProcessing) && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-[3.5rem]">
              <div className="scale-150">
                <VoiceAnimation 
                  language={language as 'en' | 'sw' | 'ar'}
                  style={isProcessing ? "orb" : "waveform"}
                  isActive={isListening || isSpeaking || isProcessing}
                />
              </div>
              {isProcessing && (
                <div className="absolute bottom-32 text-white text-sm font-medium">
                  {t('thinking') || 'Thinking...'}
                </div>
              )}
            </div>
          )}

          {/* Chat Area */}
          <div className={cn(
            "flex-1 overflow-y-auto px-4 py-4 space-y-3",
            isDarkTheme ? "bg-gradient-to-b from-indigo-950/40 to-purple-950/40" : "bg-gradient-to-b from-transparent to-white/30"
          )} dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Validation Error */}
            {validationError && (
              <div className="text-center py-8">
                <p className={cn("text-sm", isDarkTheme ? "text-red-300" : "text-red-600")}>
                  {validationError}
                </p>
              </div>
            )}

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
                 <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 shadow-md",
                    message.type === 'user'
                      ? "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900"
                      : isDarkTheme 
                        ? "bg-white/10 text-white backdrop-blur-sm"
                        : "bg-white text-gray-900"
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    message.type === 'user' 
                      ? "text-gray-600" 
                      : isDarkTheme ? "text-white/50" : "text-gray-500"
                  )}>
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm flex-shrink-0">
                  {displayAvatar}
                </div>
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