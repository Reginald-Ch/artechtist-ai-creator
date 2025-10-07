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

  // Auto-scroll to bottom when messages change or typing status changes
  useEffect(() => {
    // Small delay to ensure DOM has updated
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

    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
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
        "w-[360px] h-screen max-h-screen p-0 gap-0 flex flex-col overflow-hidden mx-auto",
        isRTL && "rtl"
      )} dir={isRTL ? "rtl" : "ltr"}>
          {/* Phone Frame */}
        <div className={cn(
          "relative w-full h-full rounded-[2.5rem] border-[12px] shadow-2xl overflow-hidden flex flex-col",
          isDarkTheme 
            ? "bg-gradient-to-b from-slate-900 to-slate-800 border-slate-900" 
            : "bg-gradient-to-b from-zinc-100 to-white border-zinc-300"
        )}>
          
          {/* Status Bar */}
          <div className={cn(
            "px-6 py-2 flex items-center justify-between text-xs font-medium flex-shrink-0",
            isDarkTheme ? "bg-slate-900 text-white" : "bg-white text-gray-900"
          )}>
            <div className="flex items-center gap-1">
              <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5" />
              <Wifi className="h-3.5 w-3.5" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Header */}
          <div className={cn(
            "px-4 py-3 flex items-center justify-between border-b flex-shrink-0",
            isDarkTheme ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl shadow-md">
                {displayAvatar}
              </div>
              <div>
                <h3 className={cn("font-semibold text-sm", isDarkTheme ? "text-white" : "text-gray-900")}>{botName}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAudio}
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  audioEnabled 
                    ? isDarkTheme ? "text-blue-400 hover:bg-slate-800" : "text-blue-500 hover:bg-blue-50"
                    : isDarkTheme ? "text-gray-500 hover:bg-slate-800" : "text-gray-400 hover:bg-gray-100"
                )}
                aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className={cn(
                  "h-8 w-8 rounded-full",
                  isDarkTheme ? "text-gray-400 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-100"
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
                  "h-8 w-8 rounded-full",
                  isDarkTheme ? "text-gray-400 hover:bg-slate-800" : "text-gray-700 hover:bg-gray-100"
                )}
                aria-label="Close phone simulator"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 overflow-y-auto p-4 relative",
            isDarkTheme ? "bg-slate-800" : "bg-gray-50"
          )} dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Centered Voice Animation */}
            {(isListening || isSpeaking) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <VoiceAnimation 
                  language={language as 'en' | 'sw' | 'ar'} 
                  style="siri"
                  isActive={isListening || isSpeaking}
                />
              </div>
            )}

            <div className="space-y-4">
              {messages.length === 0 && (
                <div className={cn("text-center py-12", isDarkTheme ? "text-gray-400" : "text-gray-500")}>
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-3xl">{displayAvatar}</span>
                  </div>
                  <p className={cn("text-sm font-medium", isDarkTheme ? "text-gray-300" : "text-gray-700")}>
                    {t('assistant.startConversation', 'Start a conversation')}
                  </p>
                  <p className={cn("text-xs mt-1", isDarkTheme ? "text-gray-500" : "text-gray-500")}>
                    {t('assistant.typeOrSpeak', 'Type or use voice input')}
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-lg">{displayAvatar}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      message.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : isDarkTheme 
                          ? 'bg-slate-700 text-white rounded-bl-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm'
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
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 items-end animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-lg">{displayAvatar}</span>
                  </div>
                  <div className={cn(
                    "rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm",
                    isDarkTheme ? "bg-slate-700" : "bg-white"
                  )}>
                    <div className="flex gap-1">
                      <div className={cn("w-2 h-2 rounded-full animate-bounce", isDarkTheme ? "bg-gray-400" : "bg-gray-400")} style={{ animationDelay: '0ms' }} />
                      <div className={cn("w-2 h-2 rounded-full animate-bounce", isDarkTheme ? "bg-gray-400" : "bg-gray-400")} style={{ animationDelay: '150ms' }} />
                      <div className={cn("w-2 h-2 rounded-full animate-bounce", isDarkTheme ? "bg-gray-400" : "bg-gray-400")} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={cn(
            "p-3 border-t flex-shrink-0",
            isDarkTheme ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
          )}>
            {inputError && (
              <p className="text-xs text-red-500 mb-2 px-1">{inputError}</p>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                className={cn(
                  "rounded-full w-10 h-10 flex-shrink-0 transition-all",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : isDarkTheme 
                      ? "text-gray-400 hover:bg-slate-800" 
                      : "text-gray-500 hover:bg-gray-100"
                )}
                disabled={!recognitionRef.current}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Input
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setInputError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? t('assistant.listening', 'Listening...') : t('assistant.typeMessage', 'Type a message...')}
                className={cn(
                  "flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm rounded-full px-4",
                  isDarkTheme 
                    ? "bg-slate-800 text-white placeholder:text-gray-500" 
                    : "bg-gray-100 text-gray-900"
                )}
                disabled={isListening}
                dir={isRTL ? 'rtl' : 'ltr'}
              />

              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isListening}
                size="icon"
                className="rounded-full w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Phone Bottom Bar */}
          <div className={cn(
            "h-16 flex items-center justify-center gap-12 flex-shrink-0",
            isDarkTheme ? "bg-slate-950" : "bg-black"
          )}>
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
