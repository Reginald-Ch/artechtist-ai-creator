import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

interface ConversationState {
  currentNodeId: string | null;
  conversationHistory: Array<{
    userInput: string;
    matchedIntent: string | null;
    botResponse: string;
    timestamp: Date;
  }>;
}

interface ConversationEngine {
  processUserInput: (input: string) => Promise<{
    response: string;
    matchedIntent: string | null;
    confidence: number;
  }>;
  resetConversation: () => void;
  getConversationHistory: () => ConversationState['conversationHistory'];
}

export const useConversationEngine = (
  nodes: Node[],
  edges: Edge[],
  botPersonality: string = "helpful and friendly"
): ConversationEngine => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentNodeId: null,
    conversationHistory: [],
  });

  // Simple similarity function for intent matching
  const calculateSimilarity = (input: string, phrase: string): number => {
    const inputWords = input.toLowerCase().split(' ');
    const phraseWords = phrase.toLowerCase().split(' ');
    
    let matches = 0;
    inputWords.forEach(word => {
      if (phraseWords.some(phraseWord => phraseWord.includes(word) || word.includes(phraseWord))) {
        matches++;
      }
    });
    
    return matches / Math.max(inputWords.length, phraseWords.length);
  };

  // Find the best matching intent based on training phrases
  const findMatchingIntent = (input: string): { node: Node | null; confidence: number } => {
    let bestMatch: Node | null = null;
    let highestConfidence = 0;

    nodes.forEach(node => {
      if (node.type === 'intent' && node.data.trainingPhrases) {
        const trainingPhrases = node.data.trainingPhrases as string[];
        
        trainingPhrases.forEach(phrase => {
          const confidence = calculateSimilarity(input, phrase);
          if (confidence > highestConfidence && confidence > 0.3) { // Minimum threshold
            highestConfidence = confidence;
            bestMatch = node;
          }
        });
      }
    });

    return { node: bestMatch, confidence: highestConfidence };
  };

  // Get fallback response
  const getFallbackResponse = (): string => {
    const fallbackNode = nodes.find(node => 
      node.type === 'intent' && 
      typeof node.data.label === 'string' &&
      node.data.label.toLowerCase().includes('fallback')
    );
    
    if (fallbackNode && fallbackNode.data.responses) {
      const responses = fallbackNode.data.responses as string[];
      return responses[Math.floor(Math.random() * responses.length)] || 
        "I didn't understand that. Can you try asking differently?";
    }
    
    return "I'm sorry, I didn't understand that. Could you please rephrase your question?";
  };

  // Follow edges to determine next possible intents
  const getConnectedIntents = (nodeId: string): Node[] => {
    const connectedNodeIds = edges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target);
    
    return nodes.filter(node => connectedNodeIds.includes(node.id));
  };

  // Process user input through the conversation flow
  const processUserInput = useCallback(async (input: string): Promise<{
    response: string;
    matchedIntent: string | null;
    confidence: number;
  }> => {
    // First, try to match with connected intents if we're in a conversation flow
    let matchResult = { node: null as Node | null, confidence: 0 };
    
    if (conversationState.currentNodeId) {
      const connectedIntents = getConnectedIntents(conversationState.currentNodeId);
      if (connectedIntents.length > 0) {
        // Check connected intents first for better flow
        connectedIntents.forEach(node => {
          if (node.data.trainingPhrases) {
            const trainingPhrases = node.data.trainingPhrases as string[];
            trainingPhrases.forEach(phrase => {
              const confidence = calculateSimilarity(input, phrase);
              if (confidence > matchResult.confidence && confidence > 0.3) {
                matchResult = { node, confidence };
              }
            });
          }
        });
      }
    }
    
    // If no good match in connected intents, try all intents
    if (matchResult.confidence < 0.5) {
      matchResult = findMatchingIntent(input);
    }

    let response: string;
    let matchedIntent: string | null = null;

    if (matchResult.node && matchResult.confidence > 0.3) {
      // Intent matched - get response
      const responses = matchResult.node.data.responses as string[];
      if (responses && responses.length > 0) {
        response = responses[Math.floor(Math.random() * responses.length)];
        
        // Add personality touch
        if (botPersonality && Math.random() > 0.7) {
          const personalityPrefixes = [
            `As a ${botPersonality} assistant, `,
            `With my ${botPersonality} approach, `,
            `Being ${botPersonality}, `,
          ];
          const prefix = personalityPrefixes[Math.floor(Math.random() * personalityPrefixes.length)];
          response = prefix + response.toLowerCase();
        }
      } else {
        response = getFallbackResponse();
      }
      
      matchedIntent = matchResult.node.data.label as string;
      
      // Update conversation state
      setConversationState(prev => ({
        ...prev,
        currentNodeId: matchResult.node!.id,
      }));
    } else {
      // No intent matched - use fallback
      response = getFallbackResponse();
      matchedIntent = null;
    }

    // Add to conversation history
    setConversationState(prev => ({
      ...prev,
      conversationHistory: [
        ...prev.conversationHistory,
        {
          userInput: input,
          matchedIntent,
          botResponse: response,
          timestamp: new Date(),
        },
      ],
    }));

    return {
      response,
      matchedIntent,
      confidence: matchResult.confidence,
    };
  }, [nodes, edges, conversationState.currentNodeId, botPersonality]);

  const resetConversation = useCallback(() => {
    setConversationState({
      currentNodeId: null,
      conversationHistory: [],
    });
  }, []);

  const getConversationHistory = useCallback(() => {
    return conversationState.conversationHistory;
  }, [conversationState.conversationHistory]);

  return {
    processUserInput,
    resetConversation,
    getConversationHistory,
  };
};