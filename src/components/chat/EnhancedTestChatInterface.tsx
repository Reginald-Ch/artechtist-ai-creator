import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic, MicOff, Bot, User, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Node, Edge } from '@xyflow/react';
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useAvatarPersistence } from "@/hooks/useAvatarPersistence";
import { useVoicePersistence } from "@/hooks/useVoicePersistence";
import { validateChatMessage } from "@/utils/validation";
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedTestChatInterfaceProps {
  nodes: Node[];
  edges: Edge[];
  botAvatar?: string;
  botName?: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

export const EnhancedTestChatInterface: React.FC<EnhancedTestChatInterfaceProps> = ({
  nodes,
  edges,
  botAvatar = '🤖',
  botName = 'My AI Assistant',
  className
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [inputError, setInputError] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { speak, stop, isPlaying, isSupported } = useSpeechSynthesis();
  const { avatar: displayAvatar } = useAvatarPersistence(botAvatar);
  const { voiceSettings, getBrowserVoice } = useVoicePersistence();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleSendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Validate input
    const validation = validateChatMessage(trimmed);
    if (!validation.isValid) {
      setInputError(validation.errors[0]);
      return;
    }
    setInputError("");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    // Find matching intent
    const matchedIntent = findMatchingIntent(trimmed);
    
    let botResponse: string;
    let botIntent: string | undefined;
    let confidence: number | undefined;

    if (matchedIntent) {
      botResponse = generateResponse(matchedIntent);
      botIntent = matchedIntent.node.data.label;
      confidence = matchedIntent.confidence;
    } else {
      const fallbackNode = nodes.find(node => 
        (typeof node.data.label === 'string' && node.data.label.toLowerCase() === 'fallback') || 
        node.data.isDefault === true
      );
      
      if (fallbackNode && fallbackNode.data.responses) {
        botResponse = fallbackNode.data.responses[0] || "I didn't understand that. Could you try rephrasing?";
        botIntent = 'Fallback';
      } else {
        botResponse = "I didn't understand that. Could you try rephrasing?";
        botIntent = 'Fallback';
      }
      confidence = 0.1;
    }

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: botResponse,
      timestamp: new Date(),
      intent: botIntent,
      confidence
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInput('');
    
    // Speak response
    if (audioEnabled && isSupported && botResponse) {
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(botResponse);
          utterance.pitch = voiceSettings.pitch;
          utterance.rate = voiceSettings.speakingSpeed || voiceSettings.speed;
          utterance.volume = 0.8;
          
          const browserVoice = getBrowserVoice();
          if (browserVoice) {
            utterance.voice = browserVoice;
          }
          
          window.speechSynthesis.speak(utterance);
        } else {
          speak(botResponse);
        }
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    stop();
    toast({
      title: "Chat cleared",
      description: "Conversation history has been reset"
    });
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      stop();
    }
    toast({
      title: audioEnabled ? "🔇 Audio disabled" : "🔊 Audio enabled",
      description: audioEnabled ? "Bot responses will no longer be spoken" : "Bot responses will be spoken aloud"
    });
  };

  const toggleListening = () => {
    if (!isListening) {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
          toast({
            title: "Voice recognition error",
            description: "Could not access microphone",
            variant: "destructive"
          });
        };

        recognition.start();
      } else {
        toast({
          title: "Voice not supported",
          description: "Your browser doesn't support voice recognition",
          variant: "destructive"
        });
      }
    } else {
      setIsListening(false);
    }
  };

  const charCount = input.length;
  const maxChars = 1000;

  return (
    <Card className={`flex flex-col h-full shadow-xl overflow-hidden ${className}`}>
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl shadow-lg ring-2 ring-background ring-offset-2">
                {displayAvatar}
              </div>
              <motion.div 
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg">{botName}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Powered Assistant
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleAudio}
              className={`rounded-full transition-all ${
                audioEnabled 
                  ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                  : 'text-muted-foreground'
              }`}
              aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
            >
              {audioEnabled ? (
                <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
              aria-label="Clear conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl mb-4 shadow-lg">
                {displayAvatar}
              </div>
              <h4 className="font-semibold text-lg mb-2">Start a Conversation</h4>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try saying "Hello" or ask me anything!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg shadow-sm">
                    {displayAvatar}
                  </div>
                </div>
              )}
              
              <div className={`max-w-[75%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto'
                      : 'bg-gradient-to-br from-muted/80 to-muted/40 text-foreground backdrop-blur-sm'
                  }`}
                  style={{ 
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <p className="text-sm leading-relaxed">
                    {message.content}
                  </p>
                </motion.div>
                
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.intent && message.confidence && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(message.confidence * 100)}% match
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Premium Input Area */}
      <div className="border-t bg-background/95 backdrop-blur-sm p-4 space-y-3">
        {inputError && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-destructive"
            role="alert"
          >
            {inputError}
          </motion.p>
        )}
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setInputError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... 💬"
              className="pr-16 rounded-full border-2 focus:border-primary/50 bg-muted/50 transition-all text-sm shadow-sm"
              disabled={isListening}
              maxLength={maxChars}
              aria-label="Message input"
              aria-invalid={!!inputError}
            />
            {isListening && (
              <motion.div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-500 font-medium">Listening...</span>
              </motion.div>
            )}
            {!isListening && input.length > 0 && (
              <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${
                charCount > maxChars * 0.9 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {charCount}/{maxChars}
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={`flex-shrink-0 rounded-full transition-all ${
              isListening 
                ? 'bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/20' 
                : 'hover:bg-primary/10 hover:border-primary/30'
            }`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isListening || !!inputError}
            className="flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
            size="icon"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>{nodes.length} intents active</span>
            </div>
            <span>•</span>
            <span>{messages.length} messages</span>
          </div>
          <div className="flex items-center gap-1">
            {isPlaying && (
              <>
                <Volume2 className="w-3 h-3 text-green-500 animate-pulse" />
                <span>Speaking...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedTestChatInterface;
