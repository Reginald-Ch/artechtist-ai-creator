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

  // Check browser support on mount
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
    setRecognitionSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
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
    if (!voiceSettings.enabled || !speechSupported || !isLoaded) {
      console.log('Speech disabled or not supported');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      synthRef.current = utterance;

      // Apply persisted voice settings
      const voice = getBrowserVoice();
      if (voice) {
        utterance.voice = voice;
        console.log(`Using voice: ${voice.name} (${voice.lang})`);
      }

      utterance.rate = voiceSettings.speed || 1.0;
      utterance.pitch = voiceSettings.pitch || 1.0;
      utterance.volume = 1.0;
      utterance.lang = voice?.lang || 'en-US';

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
        "w-[380px] h-[780px] max-h-[95vh] p-0 gap-0 flex flex-col overflow-hidden mx-auto rounded-[3rem] border-8",
        isDarkTheme ? "border-gray-900" : "border-gray-800",
        isRTL && "rtl"
      )} dir={isRTL ? "rtl" : "ltr"}>
        {/* Phone Frame */}
        <div className={cn(
          "relative w-full h-full overflow-hidden flex flex-col rounded-[2.5rem]",
          isDarkTheme 
            ? "bg-gradient-to-b from-gray-900 via-gray-900 to-black" 
            : "bg-white"
        )}>
          
          {/* Status Bar */}
          <div className={cn(
            "px-8 pt-3 pb-2 flex items-center justify-between flex-shrink-0 text-xs",
            isDarkTheme ? "text-white" : "text-gray-900"
          )}>
            <span className="font-medium">
              {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5" />
              <Wifi className="h-3.5 w-3.5" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Notch Simulation */}
          <div className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 rounded-b-3xl z-50",
            isDarkTheme ? "bg-gray-900" : "bg-gray-800"
          )} />
          
          {/* Header */}
          <div className={cn(
            "px-6 py-3 flex items-center justify-between flex-shrink-0 relative z-10",
            isDarkTheme ? "bg-transparent" : "bg-transparent"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
                {displayAvatar}
              </div>
              <div>
                <h3 className={cn("font-medium text-sm", isDarkTheme ? "text-white" : "text-gray-900")}>
                  {botName}
                </h3>
                <p className={cn("text-xs", isDarkTheme ? "text-gray-400" : "text-gray-500")}>
                  {continuousMode ? t('assistant.active', 'Active') : t('assistant.inactive', 'Tap to start')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAudio}
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  audioEnabled 
                    ? "text-blue-500 hover:bg-blue-500/10"
                    : isDarkTheme ? "text-gray-500 hover:bg-gray-800" : "text-gray-400 hover:bg-gray-100"
                )}
                aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className={cn(
                  "h-8 w-8 rounded-full",
                  isDarkTheme ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
                )}
                aria-label="Toggle theme"
              >
                {isDarkTheme ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "h-8 w-8 rounded-full",
                  isDarkTheme ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
                )}
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Chat Area with Centered Voice Animation */}
          <div className={cn(
            "flex-1 overflow-y-auto px-6 py-8 relative",
            isDarkTheme ? "bg-gradient-to-b from-gray-900 to-black" : "bg-white"
          )} dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Large Centered Voice Animation */}
            {(isListening || isSpeaking) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                <div className="mb-6">
                  <VoiceAnimation 
                    language={language as 'en' | 'sw' | 'ar'} 
                    style="google"
                    isActive={isListening || isSpeaking}
                  />
                </div>
                <p className={cn(
                  "text-sm font-medium animate-pulse",
                  isDarkTheme ? "text-gray-400" : "text-gray-600"
                )}>
                  {isListening ? t('assistant.listening', 'Listening...') : t('assistant.speaking', 'Speaking...')}
                </p>
              </div>
            )}

            <div className="space-y-6 max-w-md mx-auto">
              {messages.length === 0 && !isListening && !isSpeaking && (
                <div className={cn(
                  "text-center py-20",
                  isDarkTheme ? "text-gray-400" : "text-gray-500"
                )}>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                    <span className="text-4xl">{displayAvatar}</span>
                  </div>
                  <p className={cn("text-base font-medium mb-2", isDarkTheme ? "text-gray-300" : "text-gray-700")}>
                    {t('assistant.hiThere', 'Hi, how can I help?')}
                  </p>
                  <p className={cn("text-xs", isDarkTheme ? "text-gray-500" : "text-gray-500")}>
                    {t('assistant.tapToSpeak', 'Tap the microphone to speak')}
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 items-end animate-fade-in",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.type === 'assistant' && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-lg">{displayAvatar}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-3xl px-5 py-3 text-sm leading-relaxed",
                      message.type === 'user'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : isDarkTheme 
                          ? 'bg-gray-800 text-gray-100 shadow-lg shadow-gray-900/20'
                          : 'bg-gray-100 text-gray-900 shadow-sm'
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
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 items-end animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-lg">{displayAvatar}</span>
                  </div>
                  <div className={cn(
                    "rounded-3xl px-5 py-3",
                    isDarkTheme ? "bg-gray-800 shadow-lg" : "bg-gray-100 shadow-sm"
                  )}>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={cn(
            "px-6 py-4 flex-shrink-0 border-t",
            isDarkTheme ? "bg-gray-900/80 backdrop-blur-sm border-gray-800" : "bg-white/80 backdrop-blur-sm border-gray-100"
          )}>
            {inputError && (
              <p className="text-xs text-red-500 mb-2">{inputError}</p>
            )}
            <div className="flex items-center gap-3 max-w-md mx-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                className={cn(
                  "rounded-full w-14 h-14 flex-shrink-0 transition-all shadow-lg",
                  continuousMode || isListening
                    ? "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-red-500/30 animate-pulse" 
                    : "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white shadow-blue-500/30"
                )}
                disabled={!recognitionRef.current}
                aria-label={continuousMode ? 'Stop conversation' : 'Start conversation'}
              >
                {continuousMode || isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              <Input
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setInputError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? t('assistant.listening', 'Listening...') : t('assistant.typeMessage', 'Type or speak...')}
                className={cn(
                  "flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm rounded-full px-5 py-3 h-12",
                  isDarkTheme 
                    ? "bg-gray-800 text-white placeholder:text-gray-500" 
                    : "bg-gray-100 text-gray-900 placeholder:text-gray-500"
                )}
                disabled={continuousMode || isListening}
                dir={isRTL ? 'rtl' : 'ltr'}
              />

              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isListening || continuousMode}
                size="icon"
                className="rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="flex justify-center py-2 flex-shrink-0">
            <div className={cn(
              "w-32 h-1 rounded-full",
              isDarkTheme ? "bg-gray-700" : "bg-gray-300"
            )} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
