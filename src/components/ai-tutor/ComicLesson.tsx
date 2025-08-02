import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Lightbulb, 
  Star,
  Brain,
  Zap,
  Target
} from 'lucide-react';

interface ComicPanel {
  id: number;
  title: string;
  character: string;
  dialogue: string;
  concept: string;
  visual: string;
  tip: string;
  interactiveElement?: {
    type: 'quiz' | 'demo' | 'challenge';
    content: string;
    action: string;
  };
}

interface ComicLessonProps {
  topic: string;
  currentGameState?: any;
  onInteraction?: (action: string) => void;
}

export const ComicLesson = ({ topic, currentGameState, onInteraction }: ComicLessonProps) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [completedPanels, setCompletedPanels] = useState<number[]>([]);

  const getComicPanels = (topic: string): ComicPanel[] => {
    switch (topic) {
      case 'ai-learning':
        return [
          {
            id: 1,
            title: "Meet Kesi, Your AI Guide",
            character: "🤖",
            dialogue: "Greetings! I'm Kesi, your AI comic hero! Just like the wise Anansi spins knowledge into webs, I weave learning into adventures!",
            concept: "AI Introduction",
            visual: "🕷️🕸️✨",
            tip: "AI stands for Artificial Intelligence - computer programs that can learn and make decisions!",
            interactiveElement: {
              type: 'demo',
              content: "Watch how I learn from each game we play!",
              action: "show-learning"
            }
          },
          {
            id: 2,
            title: "The Pattern Spider",
            character: "🕷️",
            dialogue: "Like Anansi weaving patterns in his web, I look for patterns in your moves. Each game teaches me something new!",
            concept: "Pattern Recognition",
            visual: "🎯🔍📊",
            tip: "Pattern recognition helps AI understand and predict behaviors by finding similarities.",
            interactiveElement: {
              type: 'challenge',
              content: "Can you spot the pattern in my moves?",
              action: "pattern-challenge"
            }
          },
          {
            id: 3,
            title: "Growing Wisdom",
            character: "🌱",
            dialogue: "Just like the patient tortoise, I don't rush! I slowly get better by learning from each game we play together.",
            concept: "Machine Learning",
            visual: "📈🧠⚡",
            tip: "Machine learning means AI gets smarter through experience, not programming!",
            interactiveElement: {
              type: 'quiz',
              content: "How do you think AI learns best?",
              action: "learning-quiz"
            }
          },
          {
            id: 4,
            title: "Adaptive Hero",
            character: "⚖️",
            dialogue: "I adjust my difficulty to match your skill! Too easy is boring, too hard is frustrating. Balance is key!",
            concept: "Adaptive Algorithms",
            visual: "🎮⚖️🎯",
            tip: "Adaptive algorithms change their behavior based on feedback to create better experiences.",
            interactiveElement: {
              type: 'demo',
              content: "See how I adjust to your playing style!",
              action: "show-adaptation"
            }
          }
        ];
      
      case 'cultural-wisdom':
        return [
          {
            id: 1,
            title: "Ancient Wisdom, Modern AI",
            character: "👑",
            dialogue: "African stories have taught wisdom for thousands of years. Now AI learns from these same principles!",
            concept: "Cultural AI Learning",
            visual: "📚🌍🤖",
            tip: "AI can learn from cultural wisdom and traditional knowledge systems.",
            interactiveElement: {
              type: 'demo',
              content: "Explore how different cultures influence AI learning!",
              action: "cultural-demo"
            }
          },
          {
            id: 2,
            title: "The Talking Drum Network",
            character: "🥁",
            dialogue: "Like talking drums sending messages across villages, AI networks share knowledge instantly across the world!",
            concept: "Neural Networks",
            visual: "🥁📡🌐",
            tip: "Neural networks are inspired by how our brains connect and share information.",
            interactiveElement: {
              type: 'challenge',
              content: "Help me send a message through the AI network!",
              action: "network-challenge"
            }
          }
        ];

      default:
        return [
          {
            id: 1,
            title: "AI Adventure Begins",
            character: "🤖",
            dialogue: "Welcome to the world of AI! Let's explore together through stories and games.",
            concept: "Introduction",
            visual: "🚀🌟📖",
            tip: "Every expert was once a beginner. Let's start your AI journey!",
            interactiveElement: {
              type: 'demo',
              content: "Ready to begin your AI adventure?",
              action: "start-adventure"
            }
          }
        ];
    }
  };

  const panels = getComicPanels(topic);
  const panel = panels[currentPanel];
  const progress = ((currentPanel + 1) / panels.length) * 100;

  const nextPanel = () => {
    if (currentPanel < panels.length - 1) {
      setCurrentPanel(currentPanel + 1);
      if (!completedPanels.includes(currentPanel)) {
        setCompletedPanels([...completedPanels, currentPanel]);
      }
    }
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      setCurrentPanel(currentPanel - 1);
    }
  };

  const handleInteraction = () => {
    if (panel.interactiveElement) {
      onInteraction?.(panel.interactiveElement.action);
    }
    // Mark panel as completed
    if (!completedPanels.includes(currentPanel)) {
      setCompletedPanels([...completedPanels, currentPanel]);
    }
  };

  const getIcon = (concept: string) => {
    switch (concept.toLowerCase()) {
      case 'pattern recognition': return Target;
      case 'machine learning': return Brain;
      case 'adaptive algorithms': return Zap;
      case 'neural networks': return Brain;
      default: return Lightbulb;
    }
  };

  const ConceptIcon = getIcon(panel.concept);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Comic Learning Journey
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Panel {currentPanel + 1} of {panels.length}
            </Badge>
            {completedPanels.includes(currentPanel) && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comic Panel */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-800 dark:border-gray-200 rounded-lg p-4 relative overflow-hidden">
          {/* Comic Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-red-200/20 dark:from-yellow-800/20 dark:to-red-800/20"></div>
          
          <div className="relative space-y-3">
            {/* Panel Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground">{panel.title}</h3>
              <div className="flex items-center gap-2">
                <ConceptIcon className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  {panel.concept}
                </Badge>
              </div>
            </div>

            {/* Character and Visual */}
            <div className="text-center space-y-2">
              <div className="text-6xl mb-2">{panel.character}</div>
              <div className="text-2xl">{panel.visual}</div>
            </div>

            {/* Dialogue */}
            <div className="bg-background border rounded-lg p-3 relative">
              <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-border"></div>
              <p className="text-foreground text-sm leading-relaxed italic">
                "{panel.dialogue}"
              </p>
            </div>

            {/* Learning Tip */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1">Learning Tip:</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-xs">{panel.tip}</p>
                </div>
              </div>
            </div>

            {/* Interactive Element */}
            {panel.interactiveElement && (
              <div className="bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-950/20 dark:to-cyan-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="space-y-2">
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    {panel.interactiveElement.content}
                  </p>
                  <Button 
                    size="sm" 
                    onClick={handleInteraction}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {panel.interactiveElement.action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevPanel}
            disabled={currentPanel === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-1">
            {panels.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentPanel 
                    ? 'bg-primary w-6' 
                    : completedPanels.includes(index)
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextPanel}
            disabled={currentPanel === panels.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};