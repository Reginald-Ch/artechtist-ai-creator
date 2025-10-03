import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic, MicOff, Bot, User, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Node, Edge } from '@xyflow/react';
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useAvatarPersistence } from "@/hooks/useAvatarPersistence";
import { useVoicePersistence } from "@/hooks/useVoicePersistence";

interface TestChatInterfaceProps {
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

export const TestChatInterface: React.FC<TestChatInterfaceProps> = ({
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { speak, stop, isPlaying, isSupported } = useSpeechSynthesis();
  const { avatar: displayAvatar } = useAvatarPersistence(botAvatar);
  const { voiceSettings, getBrowserVoice } = useVoicePersistence();

  // Auto-scroll to bottom when new messages are added
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
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Find matching intent
    const matchedIntent = findMatchingIntent(input.trim());
    
    let botResponse: string;
    let botIntent: string | undefined;
    let confidence: number | undefined;

    if (matchedIntent) {
      botResponse = generateResponse(matchedIntent);
      botIntent = matchedIntent.node.data.label;
      confidence = matchedIntent.confidence;
    } else {
      // Fallback response
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
    
    // Speak the bot response if audio is enabled with custom voice settings
    if (audioEnabled && isSupported && botResponse) {
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(botResponse);
          
          // Apply saved voice settings
          utterance.pitch = voiceSettings.pitch;
          utterance.rate = voiceSettings.speakingSpeed || voiceSettings.speed;
          utterance.volume = 0.8;
          
          // Get the browser voice based on saved settings
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
    stop(); // Stop any ongoing speech
    toast({
      title: "Chat cleared",
      description: "Conversation history has been reset"
    });
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      stop(); // Stop current speech when disabling
    }
    toast({
      title: audioEnabled ? "🔇 Audio disabled" : "🔊 Audio enabled",
      description: audioEnabled ? "Bot responses will no longer be spoken" : "Bot responses will be spoken aloud"
    });
  };

  const toggleListening = () => {
    if (!isListening) {
      // Start voice recognition
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

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl border-2 border-primary/20">
              {displayAvatar}
            </div>
            <div>
              <span className="font-semibold">Test Chat</span>
              <p className="text-sm text-muted-foreground font-normal">
                with {botName}
              </p>
            </div>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleAudio}
              className={`rounded-full transition-all duration-200 ${
                audioEnabled 
                  ? 'hover:bg-primary/10 text-primary' 
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
              title={audioEnabled ? "Disable audio responses" : "Enable audio responses"}
            >
              {audioEnabled ? (
                <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse text-green-500' : ''}`} />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              className="hover:bg-destructive/10 hover:text-destructive rounded-full"
              title="Clear conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 gap-4">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 w-full max-h-[400px] overflow-hidden">
          <div className="space-y-4 p-1 break-words">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation to test your bot!</p>
                <p className="text-sm mt-2">Try saying: "Hello" or "Help"</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 max-w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      {displayAvatar}
                    </div>
                  </div>
                )}
                
                  <div className={`max-w-[80%] min-w-0 ${message.type === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-xl px-4 py-3 shadow-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground ml-auto'
                          : 'bg-gradient-to-r from-muted to-muted/80 text-foreground border border-border/50'
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
                    </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.intent && (
                      <>
                        <span>•</span>
                        <span className="truncate">Intent: {message.intent}</span>
                      </>
                    )}
                    {message.confidence && (
                      <>
                        <span>•</span>
                        <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                      </>
                    )}
                  </div>
                </div>
                
                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1 relative min-w-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... 💬"
              className="pr-12 w-full text-sm border-2 focus:border-primary/50 bg-background/50 rounded-xl transition-all hover:bg-background/80 focus:shadow-lg"
              disabled={isListening}
              style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word',
                maxWidth: '100%',
                minWidth: '0'
              }}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-500 font-medium">Listening...</span>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={`flex-shrink-0 rounded-xl transition-all hover:scale-105 ${
              isListening 
                ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                : 'hover:bg-primary/10 hover:border-primary/30'
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isListening}
            className="flex-shrink-0 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all hover:scale-105 hover:shadow-lg"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg p-2 border border-border/30">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{nodes.length} intents</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1">
            {isPlaying ? (
              <Volume2 className="w-3 h-3 text-green-500 animate-pulse" />
            ) : (
              <Bot className="w-3 h-3 text-secondary" />
            )}
            <span className="font-medium">
              {isPlaying ? 'Speaking...' : audioEnabled ? 'Audio on' : 'Audio off'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestChatInterface;