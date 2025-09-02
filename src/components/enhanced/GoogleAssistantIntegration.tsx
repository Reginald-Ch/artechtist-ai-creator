import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Zap,
  MessageSquare,
  Bot,
  Radio
} from 'lucide-react';

interface GoogleAssistantProps {
  nodes: any[];
  edges: any[];
  onIntentMatch?: (intent: string, confidence: number) => void;
}

interface ConversationState {
  isListening: boolean;
  isProcessing: boolean;
  isConnected: boolean;
  currentContext: Record<string, any>;
  sessionId: string;
  lastIntent: string | null;
  confidence: number;
}

export const GoogleAssistantIntegration: React.FC<GoogleAssistantProps> = ({
  nodes,
  edges,
  onIntentMatch
}) => {
  const { toast } = useToast();
  const [conversationState, setConversationState] = useState<ConversationState>({
    isListening: false,
    isProcessing: false,
    isConnected: false,
    currentContext: {},
    sessionId: '',
    lastIntent: null,
    confidence: 0
  });
  
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    audioOutput: true,
    autoResponse: true,
    contextAware: true,
    language: 'en-US'
  });

  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState<Array<{
    type: 'user' | 'assistant';
    text: string;
    timestamp: Date;
    intent?: string;
    confidence?: number;
  }>>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings.language;

      recognitionRef.current.onstart = () => {
        setConversationState(prev => ({ ...prev, isListening: true }));
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processUserInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Speech Recognition Error",
          description: "There was an issue with voice recognition. Please try again.",
          variant: "destructive"
        });
        setConversationState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current.onend = () => {
        setConversationState(prev => ({ ...prev, isListening: false }));
      };
    }

    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [settings.language]);

  // Process user input and match intents
  const processUserInput = async (input: string) => {
    setConversationState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Add user message
      const userMessage = {
        type: 'user' as const,
        text: input,
        timestamp: new Date()
      };
      setResponses(prev => [...prev, userMessage]);

      // Find matching intent
      const matchResult = findMatchingIntent(input);
      
      if (matchResult.node) {
        const response = generateResponse(matchResult.node, input);
        
        const assistantMessage = {
          type: 'assistant' as const,
          text: response,
          timestamp: new Date(),
          intent: matchResult.node.data.label,
          confidence: matchResult.confidence
        };
        
        setResponses(prev => [...prev, assistantMessage]);
        
        // Update conversation state
        setConversationState(prev => ({
          ...prev,
          lastIntent: matchResult.node.data.label,
          confidence: matchResult.confidence,
          currentContext: {
            ...prev.currentContext,
            lastInput: input,
            lastResponse: response
          }
        }));

        // Speak response if enabled
        if (settings.audioOutput && settings.voiceEnabled) {
          speakText(response);
        }

        // Callback for parent component
        onIntentMatch?.(matchResult.node.data.label, matchResult.confidence);
      } else {
        // Handle fallback
        const fallbackResponse = "I'm not sure how to help with that. Could you try asking differently?";
        const fallbackMessage = {
          type: 'assistant' as const,
          text: fallbackResponse,
          timestamp: new Date(),
          confidence: 0
        };
        setResponses(prev => [...prev, fallbackMessage]);
        
        if (settings.audioOutput && settings.voiceEnabled) {
          speakText(fallbackResponse);
        }
      }
    } catch (error) {
      console.error('Error processing input:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConversationState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Intent matching algorithm
  const findMatchingIntent = (input: string) => {
    let bestMatch = { node: null, confidence: 0 };
    
    for (const node of nodes) {
      if (node.type === 'intent' && node.data.trainingPhrases) {
        for (const phrase of node.data.trainingPhrases) {
          const similarity = calculateSimilarity(input.toLowerCase(), phrase.toLowerCase());
          if (similarity > bestMatch.confidence) {
            bestMatch = { node, confidence: similarity };
          }
        }
      }
    }
    
    return bestMatch;
  };

  // Similarity calculation
  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    let matches = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++;
          break;
        }
      }
    }
    
    return matches / Math.max(words1.length, words2.length);
  };

  // Generate response
  const generateResponse = (node: any, input: string): string => {
    const responses = node.data.responses || ["I understand what you're asking about."];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add context-aware enhancement
    if (settings.contextAware && conversationState.currentContext.lastInput) {
      return `${randomResponse} I noticed you previously asked about "${conversationState.currentContext.lastInput}".`;
    }
    
    return randomResponse;
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      synthesisRef.current.speak(utterance);
    }
  };

  // Control functions
  const startListening = () => {
    if (recognitionRef.current && !conversationState.isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && conversationState.isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearConversation = () => {
    setResponses([]);
    setTranscript('');
    setConversationState(prev => ({
      ...prev,
      currentContext: {},
      lastIntent: null,
      confidence: 0
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Google Assistant Integration
            <Badge variant={conversationState.isConnected ? "default" : "secondary"}>
              {conversationState.isConnected ? "Connected" : "Ready"}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Voice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Voice Input</span>
            <Switch
              checked={settings.voiceEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, voiceEnabled: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span>Audio Output</span>
            <Switch
              checked={settings.audioOutput}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, audioOutput: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span>Auto Response</span>
            <Switch
              checked={settings.autoResponse}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, autoResponse: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span>Context Awareness</span>
            <Switch
              checked={settings.contextAware}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, contextAware: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Voice Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant={conversationState.isListening ? "destructive" : "default"}
              onClick={conversationState.isListening ? stopListening : startListening}
              disabled={!settings.voiceEnabled || conversationState.isProcessing}
              className="flex items-center gap-2"
            >
              {conversationState.isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Listening
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={clearConversation}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Clear Chat
            </Button>
          </div>
          
          {conversationState.isListening && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm">Listening...</span>
              </div>
            </div>
          )}
          
          {conversationState.isProcessing && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Zap className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Conversation
            {conversationState.lastIntent && (
              <Badge variant="outline">
                {conversationState.lastIntent} ({Math.round(conversationState.confidence * 100)}%)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {responses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Start a conversation by clicking "Start Listening"
              </div>
            ) : (
              responses.map((response, index) => (
                <div
                  key={index}
                  className={`flex ${response.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      response.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{response.text}</p>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{response.timestamp.toLocaleTimeString()}</span>
                      {response.intent && (
                        <span>{response.intent} ({Math.round((response.confidence || 0) * 100)}%)</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Display */}
      {transcript && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">
              <strong>Current transcript:</strong> {transcript}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};