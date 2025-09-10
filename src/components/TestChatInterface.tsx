import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, RotateCcw, Play, Pause, MicIcon, StopCircle } from 'lucide-react';
import { useConversationEngine } from '@/hooks/useConversationEngine';
import { Node, Edge } from '@xyflow/react';

interface TestMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  matchedIntent?: string;
}

interface TestChatInterfaceProps {
  nodes: Node[];
  edges: Edge[];
  isActive: boolean;
  onToggle: () => void;
  selectedAvatar?: string;
  botPersonality?: string;
}

export const TestChatInterface = ({ nodes, edges, isActive, onToggle, selectedAvatar = '🤖', botPersonality = 'friendly and helpful' }: TestChatInterfaceProps) => {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const conversationEngine = useConversationEngine(nodes, edges, botPersonality);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isActive && messages.length === 0) {
      const welcomeMessage: TestMessage = {
        id: 'welcome',
        text: "Hello! I'm your chatbot. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
        confidence: 1
      };
      setMessages([welcomeMessage]);
    }
  }, [isActive]);

  const speakText = (text: string) => {
    if (speechSynthRef.current && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      speechSynthRef.current.speak(utterance);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !isActive) return;

    const userMessage: TestMessage = {
      id: `user-${Date.now()}`,
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setIsLoading(true);

    // Auto-speak user message
    speakText(messageText);

    try {
      const result = await conversationEngine.processUserInput(messageText);
      
      const botMessage: TestMessage = {
        id: `bot-${Date.now()}`,
        text: result.response,
        isUser: false,
        timestamp: new Date(),
        confidence: result.confidence,
        matchedIntent: result.matchedIntent
      };

      setMessages(prev => [...prev, botMessage]);
      speakText(result.response);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: TestMessage = {
        id: `error-${Date.now()}`,
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    if (isActive) {
      const welcomeMessage: TestMessage = {
        id: 'welcome-reset',
        text: "Hello! I'm your chatbot. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
        confidence: 1
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <Card className={`w-full max-w-md transition-all duration-300 ${isActive ? 'shadow-lg border-primary/20' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Test Your Bot
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={onToggle} 
              variant={isActive ? "destructive" : "default"} 
              size="sm"
            >
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isActive ? 'Stop' : 'Start'}
            </Button>
            <Button onClick={resetChat} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages */}
        <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-background/50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`flex items-start gap-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground border-2 border-primary/20' 
                    : 'bg-card border-2 border-border text-card-foreground'
                }`}>
                  {message.isUser ? <User className="h-4 w-4" /> : selectedAvatar}
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm backdrop-blur-sm ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground ml-2 rounded-br-sm' 
                    : 'bg-card border border-border text-card-foreground mr-2 rounded-bl-sm'
                }`}>
                  <p className="leading-relaxed">{message.text}</p>
                  {!message.isUser && message.confidence !== undefined && (
                    <div className="flex items-center gap-2 text-xs opacity-70 mt-2 pt-2 border-t border-border/20">
                      <div className="bg-accent px-2 py-1 rounded-full">
                        {Math.round(message.confidence * 100)}% confident
                      </div>
                      {message.matchedIntent && (
                        <div className="bg-muted px-2 py-1 rounded-full">
                          {message.matchedIntent}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-card border-2 border-border text-card-foreground flex items-center justify-center text-sm font-medium shadow-sm">
                  {selectedAvatar}
                </div>
                <div className="bg-card border border-border text-card-foreground rounded-2xl rounded-bl-sm px-4 py-3 text-sm shadow-sm mr-2">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isActive ? (isListening ? "Listening..." : "Type your message or use voice...") : "Activate test mode"}
              disabled={!isActive || isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={startListening}
              variant="outline"
              size="icon"
              disabled={!isActive || isListening}
              className={`${isListening ? 'bg-red-100 text-red-600 animate-pulse' : ''}`}
            >
              {isListening ? <StopCircle className="h-4 w-4" /> : <MicIcon className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || !isActive || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestChatInterface;