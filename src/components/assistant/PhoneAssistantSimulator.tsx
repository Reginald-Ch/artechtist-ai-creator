import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, X, Volume2, Settings, Wifi, Battery, Signal } from 'lucide-react';
import { useVoicePersistence } from '@/hooks/useVoicePersistence';
import { useConversationEngine } from '@/hooks/useConversationEngine';
import { useLanguage } from '@/contexts/LanguageContext';
import { Node, Edge } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { VoiceAnimation } from './VoiceAnimations';
import { VoiceChatbotSettings } from '@/components/enhanced/VoiceChatbotSettings';

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
  const { voiceSettings, getBrowserVoice, isLoaded } = useVoicePersistence();
  const { processUserInput } = useConversationEngine(nodes, edges);
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
      recognitionRef.current.interimResults = false;
      
      // Set language based on current language with proper locale codes
      const langMap: Record<string, string> = {
        'en': 'en-US',
        'sw': 'sw-KE',
        'ar': 'ar-SA'
      };
      recognitionRef.current.lang = langMap[language] || 'en-US';
      
      console.log(`Speech recognition language set to: ${recognitionRef.current.lang}`);

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        
        toast({
          title: t('assistant.voiceRecognized', 'Voice recognized'),
          description: transcript,
          duration: 2000,
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        toast({
          title: t('assistant.voiceError', 'Voice input error'),
          description: t('assistant.voiceErrorDesc', 'Could not recognize speech. Please try again.'),
          variant: 'destructive',
        });
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
        
        toast({
          title: t('assistant.speechError', 'Speech error'),
          description: t('assistant.speechErrorDesc', 'Could not speak the message.'),
          variant: 'destructive',
        });
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await processUserInput(inputText);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Speak the response
      speak(result.response);
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionSupported) {
      toast({
        title: t('assistant.notSupported', 'Not supported'),
        description: t('assistant.voiceNotSupported', 'Voice recognition is not supported in your browser.'),
        variant: 'destructive',
      });
      return;
    }

    if (!recognitionRef.current) return;

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
        
        toast({
          title: t('assistant.voiceError', 'Voice input error'),
          description: t('assistant.micPermission', 'Please grant microphone permission.'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[420px] h-[600px] p-0 gap-0 flex flex-col overflow-hidden",
        "bg-gradient-to-b from-zinc-900 to-zinc-800",
        isRTL && "rtl"
      )} dir={isRTL ? "rtl" : "ltr"}>
        {/* Phone Frame */}
        <div className="relative w-full h-full bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-[3rem] border-[14px] border-zinc-900 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Status Bar */}
          <div className="bg-white px-6 py-2 flex items-center justify-between text-xs text-gray-900 font-medium flex-shrink-0">
            <div className="flex items-center gap-1">
              <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5" />
              <Wifi className="h-3.5 w-3.5" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Header with Close Button and TTS Settings */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
            <VoiceChatbotSettings />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full hover:bg-gray-100 text-gray-700 h-8 w-8"
              aria-label="Close phone simulator"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-4xl">{botAvatar}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{t('assistant.startConversation', 'Start a conversation')}</p>
                  <p className="text-xs mt-1">{t('assistant.typeOrSpeak', 'Type or use voice input')}</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 items-start animate-fade-in",
                    message.type === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                    message.type === 'user' 
                      ? 'bg-gray-200' 
                      : 'bg-blue-200'
                  )}>
                    <span className="text-2xl">
                      {message.type === 'user' ? '😊' : botAvatar}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[65%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed shadow-sm",
                      message.type === 'user'
                        ? 'bg-blue-400 text-white rounded-tr-sm'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 items-start animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{botAvatar}</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Voice animation when speaking */}
          {isSpeaking && (
            <div className="px-6 py-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />
                <VoiceAnimation language={language as 'en' | 'sw' | 'ar'} style="waveform" />
                <span className="text-xs text-gray-600 font-medium">{t('assistant.speaking', 'Speaking...')}</span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Microphone Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                className={cn(
                  "rounded-full w-12 h-12 flex-shrink-0 transition-all",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
                disabled={!recognitionRef.current}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <Mic className="h-5 w-5" />
              </Button>

              {/* Text Input - Hidden when listening */}
              {!isListening && (
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('assistant.typeMessage', 'Type a message...')}
                  className="flex-1 border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              )}

              {/* Listening Indicator */}
              {isListening && (
                <div className="flex-1 flex items-center gap-2 text-red-600">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                    <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                  <span className="text-sm font-medium">{t('assistant.listening', 'Listening...')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Phone Bottom Bar */}
          <div className="h-16 bg-black flex items-center justify-center gap-12 flex-shrink-0">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
