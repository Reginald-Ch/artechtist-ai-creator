import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, RotateCcw, Play, Pause } from 'lucide-react';
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
}

export const TestChatInterface = ({ nodes, edges, isActive, onToggle }: TestChatInterfaceProps) => {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationEngine = useConversationEngine(nodes, edges, "friendly and helpful");

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

  const handleSendMessage = async () => {
    if (!input.trim() || !isActive) return;

    const userMessage: TestMessage = {
      id: `user-${Date.now()}`,
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await conversationEngine.processUserInput(input);
      
      const botMessage: TestMessage = {
        id: `bot-${Date.now()}`,
        text: result.response,
        isUser: false,
        timestamp: new Date(),
        confidence: result.confidence,
        matchedIntent: result.matchedIntent
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 500); // Simulate typing delay
    } catch (error) {
      const errorMessage: TestMessage = {
        id: `error-${Date.now()}`,
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
        confidence: 0
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleReset = () => {
    setMessages([]);
    conversationEngine.resetConversation();
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chat Test
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-7 px-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={onToggle}
              className="h-7 px-2"
            >
              {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {message.isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className={`rounded-lg px-3 py-2 text-sm ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}>
                  <p>{message.text}</p>
                  {!message.isUser && message.confidence !== undefined && (
                    <div className="text-xs opacity-70 mt-1">
                      Confidence: {Math.round(message.confidence * 100)}%
                      {message.matchedIntent && (
                        <span className="ml-2">({message.matchedIntent})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="bg-muted text-foreground rounded-lg px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isActive ? "Type your message..." : "Activate test mode"}
            disabled={!isActive || isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="text-sm"
          />
          <Button 
            size="sm" 
            onClick={handleSendMessage}
            disabled={!isActive || !input.trim() || isLoading}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};