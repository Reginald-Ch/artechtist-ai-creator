import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Target,
  MessageSquare,
  Brain,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  type: 'training' | 'response' | 'conflict' | 'improvement';
  title: string;
  description: string;
  confidence: number;
  nodeId?: string;
  action?: () => void;
}

interface SmartSuggestionsProps {
  nodes: any[];
  edges: any[];
  selectedNode?: any;
  onApplySuggestion: (suggestion: Suggestion) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  nodes,
  edges,
  selectedNode,
  onApplySuggestion
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate AI-powered suggestions
  useEffect(() => {
    generateSuggestions();
  }, [nodes, edges, selectedNode]);

  const generateSuggestions = async () => {
    setLoading(true);
    
    // Simulate AI analysis
    const newSuggestions: Suggestion[] = [];

    // Check for nodes with few training phrases
    nodes.forEach(node => {
      if (node.data.trainingPhrases?.length < 3 && !node.data.isDefault) {
        newSuggestions.push({
          id: `training-${node.id}`,
          type: 'training',
          title: 'Add More Training Phrases',
          description: `"${node.data.label}" needs more training examples for better recognition`,
          confidence: 85,
          nodeId: node.id,
          action: () => {
            toast({
              title: "Training Suggestion",
              description: "Consider adding variations like synonyms, different phrasings, and common misspellings",
            });
          }
        });
      }

      // Check for overly long responses
      if (node.data.responses?.some((r: string) => r.length > 200)) {
        newSuggestions.push({
          id: `response-${node.id}`,
          type: 'response',
          title: 'Shorten Response',
          description: `"${node.data.label}" has responses that might be too long for users`,
          confidence: 70,
          nodeId: node.id,
          action: () => {
            toast({
              title: "Response Suggestion",
              description: "Keep responses concise and split complex information into multiple intents",
            });
          }
        });
      }
    });

    // Check for potential intent conflicts
    const phrases = nodes.flatMap(node => 
      node.data.trainingPhrases?.map((phrase: string) => ({ phrase, nodeId: node.id })) || []
    );
    
    for (let i = 0; i < phrases.length; i++) {
      for (let j = i + 1; j < phrases.length; j++) {
        if (phrases[i].phrase.toLowerCase().includes(phrases[j].phrase.toLowerCase()) && 
            phrases[i].nodeId !== phrases[j].nodeId) {
          newSuggestions.push({
            id: `conflict-${i}-${j}`,
            type: 'conflict',
            title: 'Potential Intent Conflict',
            description: `Similar phrases found between intents`,
            confidence: 90,
            action: () => {
              toast({
                title: "Conflict Detected",
                description: "Review similar training phrases that might confuse the AI",
                variant: "destructive"
              });
            }
          });
        }
      }
    }

    // Add improvement suggestions
    if (nodes.length > 5) {
      newSuggestions.push({
        id: 'improvement-1',
        type: 'improvement',
        title: 'Add Fallback Flows',
        description: 'Create follow-up intents for better conversation flow',
        confidence: 75,
        action: () => {
          toast({
            title: "Flow Improvement",
            description: "Connect related intents to create natural conversation paths",
          });
        }
      });
    }

    setSuggestions(newSuggestions.slice(0, 5)); // Limit to 5 suggestions
    setLoading(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'training': return <MessageSquare className="h-4 w-4" />;
      case 'response': return <Brain className="h-4 w-4" />;
      case 'conflict': return <AlertTriangle className="h-4 w-4" />;
      case 'improvement': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'training': return 'text-blue-600';
      case 'response': return 'text-green-600';
      case 'conflict': return 'text-red-600';
      case 'improvement': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    suggestion.action?.();
    onApplySuggestion(suggestion);
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    toast({
      title: "Suggestion Applied",
      description: "Your bot has been improved!",
    });
  };

  return (
    <Card className="h-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary animate-glow-pulse" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3 pb-4">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={suggestion.id}
                  className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors animate-slide-in-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={getSuggestionColor(suggestion.type)}>
                        {getSuggestionIcon(suggestion.type)}
                      </span>
                      <span className="font-medium text-sm">{suggestion.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.confidence}%
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={suggestion.confidence} 
                      className="flex-1 mr-3 h-2"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applySuggestion(suggestion)}
                      className="text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="text-sm">Your bot looks great!</p>
              <p className="text-xs">No suggestions at the moment.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};