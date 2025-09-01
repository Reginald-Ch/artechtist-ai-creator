import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Lightbulb, BookOpen, Target, Zap, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AILearningAssistantProps {
  nodes: any[];
  edges: any[];
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  onSuggestionApply: (suggestion: any) => void;
}

export const AILearningAssistant: React.FC<AILearningAssistantProps> = ({
  nodes,
  edges,
  userLevel,
  onSuggestionApply
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);

  useEffect(() => {
    generatePersonalizedSuggestions();
    generateLearningPath();
  }, [nodes, edges, userLevel]);

  const generatePersonalizedSuggestions = () => {
    const suggestions = [];
    
    // Analyze current bot structure
    const intentCount = nodes.length;
    const connectionCount = edges.length;
    const avgResponsesPerIntent = nodes.reduce((acc, node) => acc + (node.data.responses?.length || 0), 0) / intentCount;
    
    // Generate level-appropriate suggestions
    if (userLevel === 'beginner') {
      if (intentCount < 3) {
        suggestions.push({
          id: 'add-basic-intents',
          type: 'intent',
          title: 'Add Basic Conversation Intents',
          description: 'Start with greetings, farewells, and help intents',
          priority: 'high',
          icon: Brain,
          color: 'text-blue-600',
          action: () => generateBasicIntents()
        });
      }
      
      if (avgResponsesPerIntent < 2) {
        suggestions.push({
          id: 'improve-responses',
          type: 'response',
          title: 'Add More Response Variations',
          description: 'Make your bot more natural with varied responses',
          priority: 'medium',
          icon: Sparkles,
          color: 'text-purple-600',
          action: () => improveResponses()
        });
      }
    } else if (userLevel === 'intermediate') {
      if (connectionCount < intentCount * 0.5) {
        suggestions.push({
          id: 'create-conversation-flows',
          type: 'flow',
          title: 'Create Conversation Flows',
          description: 'Connect intents to build natural conversation paths',
          priority: 'high',
          icon: Target,
          color: 'text-green-600',
          action: () => suggestConnectionPoints()
        });
      }
      
      suggestions.push({
        id: 'add-context-awareness',
        type: 'advanced',
        title: 'Add Context Awareness',
        description: 'Make your bot remember previous interactions',
        priority: 'medium',
        icon: Lightbulb,
        color: 'text-yellow-600',
        action: () => addContextHandling()
      });
    } else { // advanced
      suggestions.push({
        id: 'implement-nlp-features',
        type: 'advanced',
        title: 'Implement Advanced NLP',
        description: 'Add entity extraction and sentiment analysis',
        priority: 'high',
        icon: Zap,
        color: 'text-orange-600',
        action: () => implementAdvancedNLP()
      });
      
      suggestions.push({
        id: 'multi-language-support',
        type: 'localization',
        title: 'Multi-Language Support',
        description: 'Make your bot speak multiple African languages',
        priority: 'medium',
        icon: BookOpen,
        color: 'text-indigo-600',
        action: () => addMultiLanguageSupport()
      });
    }
    
    setSuggestions(suggestions);
  };

  const generateLearningPath = () => {
    const intentCount = nodes.length;
    const connectionCount = edges.length;
    
    const basePath = [
      {
        id: 'basics',
        title: 'AI Chatbot Basics',
        description: 'Learn fundamental concepts of conversational AI',
        completed: intentCount >= 3,
        lessons: [
          'Understanding Intents',
          'Creating Training Phrases',
          'Designing Responses',
          'Testing Your Bot'
        ]
      },
      {
        id: 'conversation-design',
        title: 'Conversation Design',
        description: 'Create natural and engaging conversation flows',
        completed: connectionCount >= 3,
        lessons: [
          'Conversation Flow Principles',
          'Context Management',
          'Error Handling',
          'Personality Design'
        ]
      },
      {
        id: 'advanced-features',
        title: 'Advanced AI Features',
        description: 'Implement sophisticated AI capabilities',
        completed: false,
        lessons: [
          'Natural Language Processing',
          'Machine Learning Integration',
          'Multi-modal Interactions',
          'Analytics and Optimization'
        ]
      },
      {
        id: 'deployment',
        title: 'Deployment & Integration',
        description: 'Launch your bot and integrate with platforms',
        completed: false,
        lessons: [
          'Testing Strategies',
          'Platform Integration',
          'Monitoring and Analytics',
          'Continuous Improvement'
        ]
      }
    ];
    
    setLearningPath(basePath);
  };

  const generateBasicIntents = () => {
    const basicIntents = [
      {
        name: 'greeting',
        trainingPhrases: ['hello', 'hi', 'good morning', 'hey'],
        responses: ['Hello! How can I help you today?', 'Hi there! What can I do for you?']
      },
      {
        name: 'goodbye',
        trainingPhrases: ['bye', 'goodbye', 'see you later', 'farewell'],
        responses: ['Goodbye! Have a great day!', 'See you later! Take care!']
      },
      {
        name: 'help',
        trainingPhrases: ['help', 'what can you do', 'how do you work'],
        responses: ['I can help you with various tasks. What would you like to know?', 'I\'m here to assist you! Feel free to ask me anything.']
      }
    ];
    
    onSuggestionApply({ type: 'add-intents', data: basicIntents });
  };

  const improveResponses = () => {
    const responseImprovements = nodes.map(node => ({
      nodeId: node.id,
      additionalResponses: [
        `That's a great question about ${node.data.label}!`,
        `I'd be happy to help you with ${node.data.label}.`,
        `Let me assist you with ${node.data.label}.`
      ]
    }));
    
    onSuggestionApply({ type: 'improve-responses', data: responseImprovements });
  };

  const suggestConnectionPoints = () => {
    const connectionSuggestions = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        connectionSuggestions.push({
          source: nodes[i].id,
          target: nodes[j].id,
          reason: `Connect ${nodes[i].data.label} to ${nodes[j].data.label} for better flow`
        });
      }
    }
    
    onSuggestionApply({ type: 'suggest-connections', data: connectionSuggestions.slice(0, 3) });
  };

  const addContextHandling = () => {
    onSuggestionApply({ 
      type: 'add-context', 
      data: { 
        contextVariables: ['user_name', 'conversation_state', 'previous_intent'],
        implementation: 'Add context awareness to remember user information and conversation history'
      }
    });
  };

  const implementAdvancedNLP = () => {
    onSuggestionApply({
      type: 'advanced-nlp',
      data: {
        features: ['entity_extraction', 'sentiment_analysis', 'intent_confidence_scoring'],
        implementation: 'Implement advanced NLP features for better understanding'
      }
    });
  };

  const addMultiLanguageSupport = () => {
    onSuggestionApply({
      type: 'multi-language',
      data: {
        languages: ['swahili', 'yoruba', 'zulu', 'amharic'],
        implementation: 'Add support for multiple African languages'
      }
    });
  };

  const startChallenge = (challenge: any) => {
    setCurrentChallenge(challenge);
  };

  const completeChallenge = (challengeId: string) => {
    setCompletedChallenges(prev => new Set([...prev, challengeId]));
    setCurrentChallenge(null);
  };

  const dailyChallenges = [
    {
      id: 'intent-master',
      title: 'Intent Master',
      description: 'Create 5 different intents with at least 3 training phrases each',
      difficulty: 'easy',
      reward: '50 XP',
      completed: completedChallenges.has('intent-master')
    },
    {
      id: 'conversation-flow',
      title: 'Conversation Flow Expert',
      description: 'Connect all your intents in a meaningful conversation flow',
      difficulty: 'medium',
      reward: '100 XP',
      completed: completedChallenges.has('conversation-flow')
    },
    {
      id: 'multilingual-bot',
      title: 'Multilingual Bot Creator',
      description: 'Add support for at least 2 African languages',
      difficulty: 'hard',
      reward: '200 XP',
      completed: completedChallenges.has('multilingual-bot')
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Suggestions */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Learning Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-3 rounded-lg border bg-card/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <suggestion.icon className={`h-5 w-5 mt-0.5 ${suggestion.color}`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge className={`${getPriorityColor(suggestion.priority)} text-white text-xs`}>
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={suggestion.action}
                      className="ml-2"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Great work! Your bot is well-structured. Keep building to unlock more advanced suggestions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Learning Path */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Your Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningPath.map((module, index) => (
              <div key={module.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  module.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {module.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{module.title}</h4>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <div className="flex gap-2 mt-1">
                    {module.lessons.map((lesson, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {lesson}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <div key={challenge.id} className="p-3 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{challenge.title}</h4>
                      <Badge className={getDifficultyColor(challenge.difficulty)} variant="outline">
                        {challenge.difficulty}
                      </Badge>
                      {challenge.completed && (
                        <Badge className="bg-green-500 text-white">
                          Completed ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    <p className="text-xs text-primary font-medium mt-1">Reward: {challenge.reward}</p>
                  </div>
                  {!challenge.completed && (
                    <Button
                      size="sm"
                      onClick={() => startChallenge(challenge)}
                      disabled={currentChallenge?.id === challenge.id}
                    >
                      {currentChallenge?.id === challenge.id ? 'Active' : 'Start'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Challenge */}
      {currentChallenge && (
        <Card className="glassmorphism border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Active Challenge: {currentChallenge.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{currentChallenge.description}</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => completeChallenge(currentChallenge.id)}
                className="bg-green-500 hover:bg-green-600"
              >
                Mark Complete
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentChallenge(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};