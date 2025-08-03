import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageCircle, 
  Lightbulb, 
  Sparkles, 
  BookOpen,
  Target,
  Zap,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIMascotProps {
  currentTopic?: string;
  onTopicChange?: (topic: string) => void;
  className?: string;
}

const mascotPhrases = {
  greeting: [
    "Hi there! I'm AI-ko, your friendly AI learning companion! 🤖",
    "Ready to explore the amazing world of AI together?",
    "Let's make learning AI fun and easy!"
  ],
  encouragement: [
    "You're doing great! Keep exploring!",
    "Amazing progress! AI is becoming clearer, isn't it?",
    "That's the spirit! Every expert was once a beginner."
  ],
  concepts: [
    "Think of AI like teaching a computer to recognize patterns, just like how you learned to recognize faces!",
    "Machine Learning is like training a pet - the more examples you show, the better it gets!",
    "Neural networks work like our brain - lots of simple connections creating smart behavior!"
  ]
};

const aiConcepts = [
  {
    id: 'intent',
    title: 'What is an Intent?',
    icon: Target,
    description: 'An intent is what the user wants to accomplish',
    example: 'Like saying "book a flight" - the intent is booking',
    difficulty: 'Beginner'
  },
  {
    id: 'training',
    title: 'Training Phrases',
    icon: MessageCircle,
    description: 'Different ways users might express the same intent',
    example: '"Book me a ticket", "I need a flight", "Reserve airline"',
    difficulty: 'Beginner'
  },
  {
    id: 'responses',
    title: 'Bot Responses',
    icon: Brain,
    description: 'How your AI responds when it understands an intent',
    example: 'Asking for departure city, dates, or passenger count',
    difficulty: 'Beginner'
  },
  {
    id: 'entities',
    title: 'Entities & Parameters',
    icon: Zap,
    description: 'Specific information extracted from user messages',
    example: 'From "Book flight to Paris" → extract "Paris" as destination',
    difficulty: 'Intermediate'
  },
  {
    id: 'context',
    title: 'Conversation Context',
    icon: BookOpen,
    description: 'How AI remembers previous parts of the conversation',
    example: 'Remembering user said "Paris" when asking for dates',
    difficulty: 'Intermediate'
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    icon: Sparkles,
    description: 'How computers understand human language',
    example: 'Converting "u r awesome" to "you are awesome"',
    difficulty: 'Advanced'
  }
];

export const AIMascot: React.FC<AIMascotProps> = ({ 
  currentTopic, 
  onTopicChange,
  className 
}) => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'excited'>('happy');
  const [showConcepts, setShowConcepts] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % mascotPhrases.encouragement.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConcept(conceptId);
    setMascotMood('thinking');
    onTopicChange?.(conceptId);
    
    setTimeout(() => setMascotMood('excited'), 1000);
  };

  const selectedConceptData = aiConcepts.find(c => c.id === selectedConcept);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mascot Avatar */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-0">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
              mascotMood === 'happy' && "bg-primary/20 animate-pulse",
              mascotMood === 'thinking' && "bg-muted animate-bounce",
              mascotMood === 'excited' && "bg-primary/30 animate-pulse scale-110"
            )}>
              {mascotMood === 'thinking' ? (
                <Brain className="h-6 w-6 text-primary animate-spin" />
              ) : (
                <Heart className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">AI-ko</h3>
                <Badge variant="secondary" className="text-xs">
                  AI Tutor
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {mascotPhrases.encouragement[currentPhrase]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConcepts(!showConcepts)}
          className="flex items-center space-x-1"
        >
          <BookOpen className="h-4 w-4" />
          <span>Learn AI Concepts</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMascotMood('excited')}
          className="flex items-center space-x-1"
        >
          <Lightbulb className="h-4 w-4" />
          <span>Get Hint</span>
        </Button>
      </div>

      {/* AI Concepts Learning Panel */}
      {showConcepts && (
        <Card className="p-4">
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">AI Concepts Explorer</h4>
            </div>
            
            <div className="grid gap-2">
              {aiConcepts.map((concept) => {
                const IconComponent = concept.icon;
                const isSelected = selectedConcept === concept.id;
                
                return (
                  <button
                    key={concept.id}
                    onClick={() => handleConceptSelect(concept.id)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all duration-200 hover:shadow-md",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-1 rounded-md",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}>
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{concept.title}</h5>
                          <Badge 
                            variant={concept.difficulty === 'Beginner' ? 'default' : 
                                   concept.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {concept.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {concept.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Concept Details */}
            {selectedConceptData && (
              <Card className="p-3 bg-primary/5 border-primary/20">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h6 className="font-medium text-sm">Example in Action</h6>
                  </div>
                  <p className="text-sm text-foreground">
                    {selectedConceptData.example}
                  </p>
                  <div className="mt-3 p-2 bg-background rounded border">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>AI-ko says:</strong> {mascotPhrases.concepts[0]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};