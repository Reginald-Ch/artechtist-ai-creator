import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mic, Send, Volume2, Settings, MicIcon, StopCircle, VolumeX, Play, Pause } from "lucide-react";
import { Node } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

interface VoiceEnhancedChatProps {
  nodes: Node[];
  botName?: string;
  botAvatar?: string;
  onClose?: () => void;
}

export const VoiceEnhancedChat = ({ 
  nodes, 
  botName = "AI Assistant", 
  botAvatar = "🤖" 
}: VoiceEnhancedChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: `Hello! I'm ${botName}. How can I help you today?`, 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech capabilities
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const speechRecognition = new SpeechRecognition();
      
      speechRecognition.continuous = false;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';
      
      speechRecognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInputValue(transcript);
      };
      
      speechRecognition.onend = () => {
        setIsListening(false);
      };
      
      speechRecognition.onerror = (event) => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive"
        });
      };
      
      setRecognition(speechRecognition);
    }
  }, []);

  // Auto-speak bot responses
  useEffect(() => {
    if (autoSpeak && voiceEnabled && synthesis && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot') {
        speakText(lastMessage.text);
      }
    }
  }, [messages, autoSpeak, voiceEnabled, synthesis]);

  const speakText = (text: string) => {
    if (synthesis && voiceEnabled) {
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };
      
      setCurrentUtterance(utterance);
      synthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesis && currentUtterance) {
      synthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
      toast({
        title: "Listening...",
        description: "Speak your message now"
      });
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const findBestResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Find matching intent based on training phrases
    for (const node of nodes) {
      const trainingPhrases = node.data.trainingPhrases as string[] || [];
      const responses = node.data.responses as string[] || [];
      
      if (responses.length === 0) continue;
      
      const isMatch = trainingPhrases.some(phrase => 
        lowerMessage.includes(phrase.toLowerCase()) ||
        phrase.toLowerCase().includes(lowerMessage)
      );
      
      if (isMatch) {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return {
          response: randomResponse,
          intent: node.data.label as string,
          confidence: 0.85
        };
      }
    }
    
    // Fallback responses
    const fallbackResponses = [
      "I'm not sure I understand. Could you please rephrase that?",
      "Can you tell me more about what you're looking for?",
      "I'd like to help! Could you explain that differently?"
    ];
    
    return {
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      intent: "fallback",
      confidence: 0.3
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { 
      text: inputValue, 
      sender: 'user' as const, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const { response, intent, confidence } = findBestResponse(inputValue);
    
    setTimeout(() => {
      const botMessage: Message = { 
        text: response, 
        sender: 'bot', 
        timestamp: new Date(),
        intent,
        confidence
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
    
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="flex-shrink-0 border-b bg-background/80 backdrop-blur-sm">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {botAvatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{botName}</h3>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                <Volume2 className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={autoSpeak ? "text-green-600" : "text-gray-400"}
              title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            {isSpeaking && (
              <Button
                variant="ghost"
                size="sm"
                onClick={stopSpeaking}
                className="text-red-500"
                title="Stop speaking"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.intent && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {message.intent}
                        </Badge>
                        {message.confidence && (
                          <span className="text-xs">
                            {Math.round(message.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {message.sender === 'bot' && !isSpeaking && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(message.text)}
                      className="mt-1 h-6 px-2 text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Speak
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                placeholder={isListening ? "Listening..." : "Type your message..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isListening}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={isListening ? stopListening : startListening}
                className={`${isListening ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "text-muted-foreground"} transition-all`}
                disabled={!recognition}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <StopCircle className="h-4 w-4" /> : <MicIcon className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSend} size="sm" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {!recognition && (
              <p className="text-xs text-muted-foreground mt-2">
                Voice input not supported in this browser
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};