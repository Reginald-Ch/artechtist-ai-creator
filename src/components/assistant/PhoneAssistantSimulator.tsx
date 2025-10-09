import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, X, Volume2, Wifi, Battery, Signal, Send, User, Moon, Sun } from 'lucide-react';
import { useVoicePersistence } from '@/hooks/useVoicePersistence';
import { useLanguage } from '@/contexts/LanguageContext';
import { Node, Edge } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { VoiceAnimation } from './VoiceAnimations';
import { useAvatarPersistence } from '@/hooks/useAvatarPersistence';
import { validateChatMessage } from '@/utils/validation';

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
  const [isTyping, setIsTyping] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [inputError, setInputError] = useState<string>('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { voiceSettings, getBrowserVoice, isLoaded } = useVoicePersistence();
  const { avatar: displayAvatar } = useAvatarPersistence(botAvatar);
  const { language, isRTL, t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support on mount and load voices
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
    setRecognitionSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
    } else {
      // Load voices - some browsers need this
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
      };
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
    
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to bottom when messages change or typing status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Initialize speech recognition with language sync
  useEffect(() => {
    if (!recognitionSupported) return;

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      // Set language based on current language with proper locale codes
      const langMap: Record<string, string> = {
        'en': 'en-US',
        'sw': 'sw-KE',
        'ar': 'ar-SA'
      };
      recognitionRef.current.lang = langMap[language] || 'en-US';
      
      console.log(`Speech recognition language set to: ${recognitionRef.current.lang}`);

      recognitionRef.current.onresult = async (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Show interim results in real-time
        if (interimTranscript) {
          setInputText(interimTranscript);
        }

        // Auto-send when final result is received
        if (finalTranscript) {
          setInputText('');
          setIsListening(false);
          handleSendMessage(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setRecognitionSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, recognitionSupported, speechSupported, t]);

  const speak = (text: string) => {
    // Check if audioEnabled (user toggle) and browser supports it
    if (!audioEnabled || !speechSupported) {
      console.log('Speech disabled or not supported');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      synthRef.current = utterance;

      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to use persisted voice settings if loaded
      if (isLoaded && voiceSettings.enabled) {
        const voice = getBrowserVoice();
        if (voice) {
          utterance.voice = voice;
          console.log(`Using voice: ${voice.name} (${voice.lang})`);
        }
      } else {
        // Fallback to default voice for the language
        const langMap: Record<string, string> = {
          'en': 'en-US',
          'sw': 'sw-KE',
          'ar': 'ar-SA'
        };
        const targetLang = langMap[language] || 'en-US';
        const defaultVoice = voices.find(v => v.lang === targetLang) || voices[0];
        if (defaultVoice) {
          utterance.voice = defaultVoice;
          console.log(`Using default voice: ${defaultVoice.name} (${defaultVoice.lang})`);
        }
      }

      // Use persisted settings or defaults
      utterance.rate = (isLoaded && voiceSettings.speed) ? voiceSettings.speed : 1.0;
      utterance.pitch = (isLoaded && voiceSettings.pitch) ? voiceSettings.pitch : 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('Speech ended');
        
        // Restart listening in continuous mode
        if (continuousMode && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
              console.log('Restarting listening after speech ended');
            } catch (error) {
              console.error('Error restarting recognition:', error);
            }
          }, 500);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };

      console.log('Speaking:', text);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
    }
  };

  const findMatchingIntent = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    for (const node of nodes) {
      if (node.type === 'intent' && Array.isArray(node.data.trainingPhrases)) {
        for (const phrase of node.data.trainingPhrases) {
          const lowerPhrase = String(phrase).toLowerCase();
          const score = calculateSimilarity(lowerInput, lowerPhrase);
          
          if (score > highestScore && score > 0.3) {
            highestScore = score;
            bestMatch = {
              node,
              confidence: score,
              phrase
            };
          }
        }
      }
    }

    return bestMatch;
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  };

  const generateResponse = (intent: any): string => {
    if (intent.node.data.responses && intent.node.data.responses.length > 0) {
      const responses = intent.node.data.responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    return "I understand you're asking about that, but I don't have a specific response ready yet.";
  };

  const handleSendMessage = async (voiceInput?: string) => {
    const textToSend = voiceInput || inputText;
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Validate input
    const validation = validateChatMessage(trimmed);
    if (!validation.isValid) {
      setInputError(validation.errors[0]);
      return;
    }
    setInputError('');

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Find matching intent
    const matchedIntent = findMatchingIntent(trimmed);
    
    let botResponse: string;

    if (matchedIntent) {
      botResponse = generateResponse(matchedIntent);
    } else {
      const fallbackNode = nodes.find(node => 
        (typeof node.data.label === 'string' && node.data.label.toLowerCase() === 'fallback') || 
        node.data.isDefault === true
      );
      
      if (fallbackNode && fallbackNode.data.responses) {
        botResponse = fallbackNode.data.responses[0] || "I didn't understand that. Could you try rephrasing?";
      } else {
        botResponse = "I didn't understand that. Could you try rephrasing?";
      }
    }

    // Instant response - no typing delay

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: botResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);

    // Speak the response
    if (audioEnabled) {
      speak(botResponse);
    }
  };

  const toggleListening = () => {
    if (!recognitionSupported || !recognitionRef.current) return;

    if (isListening || continuousMode) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setContinuousMode(false);
        if (speechSupported) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
        setContinuousMode(false);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setContinuousMode(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "w-[400px] h-[820px] max-h-[95vh] p-0 gap-0 flex flex-col overflow-hidden mx-auto rounded-[3.5rem] border-[12px]",
        isDarkTheme ? "border-gray-900" : "border-gray-800",
        isRTL && "rtl"
      )} dir={isRTL ? "rtl" : "ltr"}>
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
          <div className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-44 h-8 rounded-b-3xl z-50",
            isDarkTheme ? "bg-gray-950" : "bg-gray-900"
          )} />
          
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

          {/* Chat Area */}
          <div className={cn(
            "flex-1 overflow-y-auto px-4 py-4 relative",
            isDarkTheme ? "bg-gradient-to-b from-indigo-950/40 to-purple-950/40" : "bg-gradient-to-b from-transparent to-white/30"
          )} dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Voice Animation Overlay */}
            {(isListening || isSpeaking) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 bg-black/20 backdrop-blur-sm">
                <div className="mb-8 scale-150">
                  <VoiceAnimation 
                    language={language as 'en' | 'sw' | 'ar'} 
                    style="google"
                    isActive={isListening || isSpeaking}
                  />
                </div>
                <p className={cn(
                  "text-lg font-bold animate-pulse px-6 py-3 rounded-full",
                  isDarkTheme ? "text-white bg-white/10" : "text-gray-900 bg-white/50"
                )}>
                  {isListening ? '🎤 ' + t('assistant.listening', 'Listening...') : '🔊 ' + t('assistant.speaking', 'Speaking...')}
                </p>
              </div>
            )}

            <div className="space-y-4 pb-4">
              {messages.length === 0 && !isListening && !isSpeaking && (
                <div className={cn(
                  "text-center py-24",
                  isDarkTheme ? "text-white/80" : "text-gray-700"
                )}>
                  <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-2xl ring-8 ring-white/20 animate-pulse">
                    <span className="text-5xl">{displayAvatar}</span>
                  </div>
                  <p className={cn("text-xl font-bold mb-3", isDarkTheme ? "text-white" : "text-gray-900")}>
                    {t('assistant.hiThere', 'Hi there! 👋')}
                  </p>
                  <p className={cn("text-sm font-medium", isDarkTheme ? "text-purple-300" : "text-purple-600")}>
                    {t('assistant.tapToSpeak', 'Tap the colorful mic to talk with me!')}
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 items-end animate-fade-in",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.type === 'assistant' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-xl ring-2 ring-white/30">
                      <span className="text-lg">{displayAvatar}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-3xl px-6 py-4 text-base leading-relaxed font-medium shadow-xl transition-all hover:shadow-2xl",
                      message.type === 'user'
                        ? isDarkTheme
                          ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-gray-700/30'
                          : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900 shadow-gray-400'
                        : isDarkTheme 
                          ? 'bg-white text-gray-900 shadow-white/10'
                          : 'bg-white text-gray-900 shadow-gray-300'
                    )}
                    style={{ 
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {message.content}
                  </div>

                  {message.type === 'user' && (
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                      isDarkTheme ? "bg-gradient-to-br from-purple-600 to-pink-600" : "bg-gradient-to-br from-purple-400 to-pink-400"
                    )}>
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 items-end animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-xl ring-2 ring-white/30">
                    <span className="text-lg">{displayAvatar}</span>
                  </div>
                  <div className={cn(
                    "rounded-3xl px-6 py-5 shadow-xl",
                    isDarkTheme ? "bg-white shadow-white/10" : "bg-white shadow-gray-300"
                  )}>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area with Colorful Mic */}
          <div className={cn(
            "px-4 py-6 flex-shrink-0",
            isDarkTheme 
              ? "bg-gradient-to-t from-black/50 to-transparent" 
              : "bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm"
          )}>
            {inputError && (
              <p className="text-xs text-red-500 mb-2 text-center">{inputError}</p>
            )}
            <div className="flex items-center gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Input
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setInputError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? t('assistant.listeningPlaceholder', '🎤 Listening...') : t('assistant.typeMessage', 'Type or speak...')}
                  className={cn(
                    "pr-14 h-14 rounded-full text-base border-2 transition-all font-medium",
                    isDarkTheme 
                      ? "bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-800" 
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 shadow-lg",
                    inputError && "border-red-500"
                  )}
                  disabled={continuousMode || isListening}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  aria-label="Message input"
                />
                {inputText && !isListening && (
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isListening || continuousMode}
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-xl hover:scale-110 transition-transform disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5 text-white" />
                  </Button>
                )}
              </div>
              <Button
                onClick={toggleListening}
                disabled={!recognitionRef.current}
                size="icon"
                className={cn(
                  "h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 relative overflow-hidden",
                  continuousMode || isListening
                    ? "bg-gradient-to-br from-red-400 via-pink-400 to-purple-400 hover:from-red-500 hover:via-pink-500 hover:to-purple-500 animate-pulse ring-4 ring-red-400/50"
                    : "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 ring-4 ring-purple-400/30",
                  !recognitionRef.current && "opacity-50 cursor-not-allowed"
                )}
                aria-label={continuousMode ? 'Stop conversation' : 'Start conversation'}
              >
                {continuousMode || isListening ? (
                  <MicOff className="h-7 w-7 text-white drop-shadow-lg" />
                ) : (
                  <Mic className="h-7 w-7 text-white drop-shadow-lg" />
                )}
              </Button>
            </div>
          </div>

          {/* Phone Bottom Indicator */}
          <div className={cn(
            "h-8 w-full flex items-center justify-center flex-shrink-0",
            isDarkTheme ? "bg-black" : "bg-gray-900"
          )}>
            <div className="w-36 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
