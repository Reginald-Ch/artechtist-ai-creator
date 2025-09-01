import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Mic, MicOff, Volume2, VolumeX, MessageSquare, History, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConversationState {
  currentNodeId: string | null;
  conversationHistory: Array<{
    userInput: string;
    matchedIntent: string | null;
    botResponse: string;
    timestamp: Date;
    confidence: number;
    contextData?: Record<string, any>;
  }>;
  sessionContext: Record<string, any>;
  isListening: boolean;
  isProcessing: boolean;
}

interface EnhancedConversationEngineProps {
  nodes: Node[];
  edges: Edge[];
  botPersonality?: string;
  onConversationUpdate?: (state: ConversationState) => void;
  enableVoice?: boolean;
  enableMultimodal?: boolean;
  supportedLanguages?: string[];
}

const EnhancedConversationEngine: React.FC<EnhancedConversationEngineProps> = ({
  nodes,
  edges,
  botPersonality = "helpful and friendly",
  onConversationUpdate,
  enableVoice = true,
  enableMultimodal = false,
  supportedLanguages = ['en-US', 'sw-KE', 'fr-FR', 'ar-EG']
}) => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentNodeId: null,
    conversationHistory: [],
    sessionContext: {},
    isListening: false,
    isProcessing: false,
  });

  const [userInput, setUserInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [voiceEnabled, setVoiceEnabled] = useState(enableVoice);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          setUserInput(transcript);
          handleUserInput(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setConversationState(prev => ({ ...prev, isListening: false }));
        toast({
          title: "Voice Recognition Error",
          description: "There was an issue with voice recognition. Please try again.",
          variant: "destructive",
        });
      };
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage]);

  // Enhanced similarity calculation with context awareness
  const calculateSimilarity = useCallback((input: string, phrase: string, context?: Record<string, any>): number => {
    const inputWords = input.toLowerCase().split(' ');
    const phraseWords = phrase.toLowerCase().split(' ');
    
    let matches = 0;
    let contextBonus = 0;

    // Basic word matching
    inputWords.forEach(word => {
      if (phraseWords.some(phraseWord => phraseWord.includes(word) || word.includes(phraseWord))) {
        matches++;
      }
    });

    // Context-based bonus scoring
    if (context) {
      Object.keys(context).forEach(key => {
        if (input.toLowerCase().includes(key.toLowerCase()) || phrase.toLowerCase().includes(key.toLowerCase())) {
          contextBonus += 0.1;
        }
      });
    }

    const baseScore = matches / Math.max(inputWords.length, phraseWords.length);
    return Math.min(baseScore + contextBonus, 1.0);
  }, []);

  // Enhanced intent matching with conversation flow awareness
  const findMatchingIntent = useCallback((input: string): { node: Node | null; confidence: number } => {
    let bestMatch: Node | null = null;
    let highestConfidence = 0;

    // First, check connected intents if we're in a conversation flow
    if (conversationState.currentNodeId) {
      const connectedNodeIds = edges
        .filter(edge => edge.source === conversationState.currentNodeId)
        .map(edge => edge.target);
      
      const connectedNodes = nodes.filter(node => connectedNodeIds.includes(node.id));
      
      connectedNodes.forEach(node => {
        if (node.type === 'intent' && node.data.trainingPhrases) {
          const trainingPhrases = node.data.trainingPhrases as string[];
          
          trainingPhrases.forEach(phrase => {
            const confidence = calculateSimilarity(input, phrase, conversationState.sessionContext);
            if (confidence > highestConfidence && confidence > 0.3) {
              highestConfidence = confidence;
              bestMatch = node;
            }
          });
        }
      });
    }

    // If no good match in connected intents, check all intents
    if (highestConfidence < 0.5) {
      nodes.forEach(node => {
        if (node.type === 'intent' && node.data.trainingPhrases) {
          const trainingPhrases = node.data.trainingPhrases as string[];
          
          trainingPhrases.forEach(phrase => {
            const confidence = calculateSimilarity(input, phrase, conversationState.sessionContext);
            if (confidence > highestConfidence && confidence > 0.3) {
              highestConfidence = confidence;
              bestMatch = node;
            }
          });
        }
      });
    }

    return { node: bestMatch, confidence: highestConfidence };
  }, [nodes, edges, conversationState.currentNodeId, conversationState.sessionContext, calculateSimilarity]);

  // Enhanced response generation with context variables
  const generateResponse = useCallback((node: Node, input: string, context: Record<string, any>): string => {
    const responses = node.data.responses as string[];
    if (!responses || responses.length === 0) {
      return "I understand, but I don't have a response configured for that.";
    }

    let response = responses[Math.floor(Math.random() * responses.length)];

    // Replace context variables in response
    Object.keys(context).forEach(key => {
      const placeholder = `{${key}}`;
      if (response.includes(placeholder)) {
        response = response.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), context[key]);
      }
    });

    // Add personality touch occasionally
    if (botPersonality && Math.random() > 0.7) {
      const personalityPrefixes = [
        `As a ${botPersonality} assistant, `,
        `With my ${botPersonality} approach, `,
        `Being ${botPersonality}, `,
      ];
      const prefix = personalityPrefixes[Math.floor(Math.random() * personalityPrefixes.length)];
      response = prefix + response.toLowerCase();
    }

    return response;
  }, [botPersonality]);

  // Text-to-speech functionality
  const speakResponse = useCallback((text: string) => {
    if (!audioEnabled || !synthRef.current) return;

    synthRef.current.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Try to find a voice that matches the selected language
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => voice.lang.startsWith(selectedLanguage.split('-')[0]));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
  }, [audioEnabled, selectedLanguage]);

  // Main conversation processing function
  const handleUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    setConversationState(prev => ({ ...prev, isProcessing: true }));

    try {
      const matchResult = findMatchingIntent(input);
      let response: string;
      let matchedIntent: string | null = null;
      let newContext = { ...conversationState.sessionContext };

      if (matchResult.node && matchResult.confidence > 0.3) {
        // Intent matched
        response = generateResponse(matchResult.node, input, newContext);
        matchedIntent = matchResult.node.data.label as string;

        // Extract entities/context from user input
        // This is a simplified version - in production, you'd use NLP libraries
        const words = input.toLowerCase().split(' ');
        words.forEach((word, index) => {
          if (word.includes('@') && word.includes('.')) {
            newContext.email = word;
          }
          if (/^\d+$/.test(word)) {
            newContext.number = word;
          }
          if (['my', 'name', 'is'].every(w => words.includes(w)) && index > words.indexOf('is')) {
            newContext.userName = words.slice(words.indexOf('is') + 1).join(' ');
          }
        });

        // Update conversation state
        setConversationState(prev => ({
          ...prev,
          currentNodeId: matchResult.node!.id,
          sessionContext: newContext,
        }));
      } else {
        // No intent matched - use fallback
        const fallbackNode = nodes.find(node => 
          node.type === 'intent' && 
          typeof node.data.label === 'string' &&
          node.data.label.toLowerCase().includes('fallback')
        );
        
        if (fallbackNode && fallbackNode.data.responses) {
          const responses = fallbackNode.data.responses as string[];
          response = responses[Math.floor(Math.random() * responses.length)] || 
            "I didn't understand that. Can you try asking differently?";
        } else {
          response = "I'm sorry, I didn't understand that. Could you please rephrase your question?";
        }
      }

      // Add to conversation history
      const newHistoryEntry = {
        userInput: input,
        matchedIntent,
        botResponse: response,
        timestamp: new Date(),
        confidence: matchResult.confidence,
        contextData: { ...newContext },
      };

      setConversationState(prev => {
        const newState = {
          ...prev,
          conversationHistory: [...prev.conversationHistory, newHistoryEntry],
          sessionContext: newContext,
          isProcessing: false,
        };
        
        if (onConversationUpdate) {
          onConversationUpdate(newState);
        }
        
        return newState;
      });

      // Speak the response if audio is enabled
      if (audioEnabled) {
        speakResponse(response);
      }

      // Clear input
      setUserInput('');

    } catch (error) {
      console.error('Error processing user input:', error);
      setConversationState(prev => ({ ...prev, isProcessing: false }));
      toast({
        title: "Processing Error",
        description: "There was an error processing your message. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    findMatchingIntent,
    generateResponse,
    conversationState.sessionContext,
    nodes,
    onConversationUpdate,
    audioEnabled,
    speakResponse
  ]);

  // Voice input controls
  const startListening = useCallback(() => {
    if (recognitionRef.current && !conversationState.isListening) {
      try {
        recognitionRef.current.start();
        setConversationState(prev => ({ ...prev, isListening: true }));
        toast({
          title: "Listening...",
          description: "Speak now, I'm listening!",
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Voice Error",
          description: "Could not start voice recognition. Please check your microphone.",
          variant: "destructive",
        });
      }
    }
  }, [conversationState.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && conversationState.isListening) {
      recognitionRef.current.stop();
      setConversationState(prev => ({ ...prev, isListening: false }));
    }
  }, [conversationState.isListening]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    setConversationState({
      currentNodeId: null,
      conversationHistory: [],
      sessionContext: {},
      isListening: false,
      isProcessing: false,
    });
    setUserInput('');
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    toast({
      title: "Conversation Reset",
      description: "Starting fresh conversation",
    });
  }, []);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Enhanced Conversation Engine</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {conversationState.conversationHistory.length} exchanges
            </Badge>
            <Button variant="outline" size="sm" onClick={resetConversation}>
              Reset
            </Button>
          </div>
        </div>
        <CardDescription>
          Advanced conversational AI with voice, context awareness, and multi-language support
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {supportedLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'en-US' ? 'English' : 
                   lang === 'sw-KE' ? 'Swahili' :
                   lang === 'fr-FR' ? 'French' :
                   lang === 'ar-EG' ? 'Arabic' : lang}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {voiceEnabled && (
              <Button
                variant={conversationState.isListening ? "default" : "outline"}
                size="sm"
                onClick={conversationState.isListening ? stopListening : startListening}
                disabled={conversationState.isProcessing}
              >
                {conversationState.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              variant={audioEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Conversation History */}
        <div className="flex-1 space-y-2 max-h-96 overflow-y-auto">
          {conversationState.conversationHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversation yet. Start by typing or speaking!</p>
            </div>
          ) : (
            conversationState.conversationHistory.map((exchange, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-sm">{exchange.userInput}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                      <span>{exchange.timestamp.toLocaleTimeString()}</span>
                      {exchange.matchedIntent && (
                        <Badge variant="secondary" className="text-xs">
                          {exchange.matchedIntent}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {Math.round(exchange.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-sm">{exchange.botResponse}</p>
                    {Object.keys(exchange.contextData || {}).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          Context Data
                        </summary>
                        <pre className="text-xs mt-1 text-muted-foreground">
                          {JSON.stringify(exchange.contextData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                
                {index < conversationState.conversationHistory.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))
          )}
          
          {conversationState.isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                <Zap className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUserInput(userInput)}
            placeholder="Type your message or use voice input..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={conversationState.isProcessing}
          />
          <Button
            onClick={() => handleUserInput(userInput)}
            disabled={!userInput.trim() || conversationState.isProcessing}
          >
            Send
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <div className="flex items-center gap-4">
            <span>Status: {conversationState.isListening ? 'Listening' : conversationState.isProcessing ? 'Processing' : 'Ready'}</span>
            <span>Current Context: {Object.keys(conversationState.sessionContext).length} items</span>
          </div>
          <div className="flex items-center gap-2">
            {conversationState.currentNodeId && (
              <Badge variant="outline" className="text-xs">
                Node: {conversationState.currentNodeId.slice(0, 8)}...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedConversationEngine;