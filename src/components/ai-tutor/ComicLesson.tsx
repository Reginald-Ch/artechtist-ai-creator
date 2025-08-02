import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { comicLessons } from '@/data/comicLessons';
import { 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Lightbulb, 
  MessageSquare, 
  Heart,
  Star,
  Zap,
  BookOpen,
  Users,
  Sparkles,
  CheckCircle
} from 'lucide-react';

interface ComicPanel {
  id: string;
  title: string;
  character: string;
  dialogue: string;
  concept: string;
  visual: string;
  learningTip: string;
  interactiveElement?: {
    type: 'quiz' | 'demo' | 'challenge' | 'question' | 'click';
    question: string;
    options: string[];
    correctAnswer: string;
    action?: string;
    description?: string;
    content?: string;
  };
}

interface ComicLessonProps {
  topic: string;
  currentGameState?: any;
  onInteraction?: () => void;
}

export const ComicLesson = ({ 
  topic, 
  currentGameState, 
  onInteraction 
}: ComicLessonProps) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [completedPanels, setCompletedPanels] = useState<number[]>([]);

  const getComicPanels = (topic: string): ComicPanel[] => {
    const lessonData = comicLessons[topic as keyof typeof comicLessons];
    
    if (lessonData) {
      return lessonData.panels.map(panel => ({
        id: panel.id,
        title: `${lessonData.character} - Panel ${panel.id.split('-')[1]}`,
        character: panel.character,
        dialogue: panel.dialogue,
        concept: lessonData.title,
        visual: getVisualForCharacter(panel.character),
        learningTip: `Cultural wisdom: ${panel.dialogue.split('.')[0]}.`,
        interactiveElement: panel.interactiveElement ? {
          type: panel.interactiveElement.type as 'quiz' | 'demo' | 'challenge' | 'question' | 'click',
          question: panel.interactiveElement.content,
          options: panel.interactiveElement.options || [],
          correctAnswer: panel.interactiveElement.correctAnswer || panel.interactiveElement.options?.[0] || '',
          action: panel.interactiveElement.type === 'click' ? 'interactive' : undefined,
          description: panel.interactiveElement.content,
          content: panel.interactiveElement.content
        } : undefined
      }));
    }

    // Fallback default panels
    return [
      {
        id: 'panel-1',
        title: 'Welcome to AI Adventures',
        character: 'Kesi AI',
        dialogue: 'Welcome to your AI learning journey! Every click, every game, every question helps you understand how artificial intelligence works.',
        concept: 'Getting Started',
        visual: '🚀✨',
        learningTip: 'Learning AI is an adventure - enjoy the journey!',
        interactiveElement: {
          type: 'demo',
          action: 'Get started',
          description: 'Click to begin your AI learning adventure!',
          question: '',
          options: [],
          correctAnswer: '',
          content: 'Click to begin your AI learning adventure!'
        }
      }
    ];
  };

  const getVisualForCharacter = (character: string): string => {
    const characterVisuals: Record<string, string> = {
      'AI-ko': '🤖✨',
      'Inventor Zuberi': '🔧💡',
      'Student Amara': '📚🎓',
      'Market Vendor Asha': '🍅🛒',
      'Elder Fatima': '👵🏾📿',
      'Teacher Kwame': '👨🏾‍🏫📖',
      'Village Chief': '👑🏘️',
      'Anansi': '🕷️🕸️',
      'Elder Kwaku': '👴🏾📚',
      'Elder Amara': '👵🏾🤝',
      'Storyteller': '🗣️📖',
      default: '🌟💫'
    };
    
    return characterVisuals[character] || characterVisuals.default;
  };

  const panels = getComicPanels(topic);
  const panel = panels[currentPanel];

  useEffect(() => {
    // Auto-advance story based on game state changes
    if (currentGameState?.winner && currentPanel < panels.length - 1) {
      setTimeout(() => {
        setCurrentPanel(prev => Math.min(prev + 1, panels.length - 1));
      }, 2000);
    }
  }, [currentGameState?.winner, currentPanel, panels.length]);

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
    onInteraction?.();
    // Mark panel as completed
    if (!completedPanels.includes(currentPanel)) {
      setCompletedPanels([...completedPanels, currentPanel]);
    }
  };

  const getIcon = (concept: string) => {
    switch (concept.toLowerCase()) {
      case 'ai introduction':
      case 'introduction to ai': 
        return Brain;
      case 'pattern recognition': 
        return Zap;
      case 'machine learning': 
        return Lightbulb;
      case 'neural networks': 
        return Users;
      default: 
        return Star;
    }
  };

  const ConceptIcon = getIcon(panel.concept);

  if (!panel) return null;

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
        <Progress value={((currentPanel + 1) / panels.length) * 100} className="h-2" />
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
              <div className="text-6xl mb-2 animate-bounce">
                {panel.character}
              </div>
              <div className="text-2xl animate-pulse">{panel.visual}</div>
            </div>

            {/* Dialogue */}
            <div className="bg-background border rounded-lg p-3 relative">
              <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-border"></div>
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground text-sm leading-relaxed italic">
                  "{panel.dialogue}"
                </p>
              </div>
            </div>

            {/* Learning Tip */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1">Learning Tip:</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-xs">{panel.learningTip}</p>
                </div>
              </div>
            </div>

            {/* Interactive Element */}
            {panel.interactiveElement && (
              <div className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                {panel.interactiveElement.type === 'quiz' && panel.interactiveElement.options.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      {panel.interactiveElement.question}
                    </h4>
                    <div className="space-y-2">
                      {panel.interactiveElement.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start hover:bg-cyan-100 dark:hover:bg-cyan-900/20 transition-all duration-200"
                          onClick={() => {
                            handleInteraction();
                            if (option === panel.interactiveElement?.correctAnswer) {
                              // Add visual feedback for correct answer
                              const button = document.activeElement as HTMLElement;
                              if (button) {
                                button.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
                                setTimeout(() => {
                                  button.classList.remove('bg-green-100', 'border-green-500', 'text-green-700');
                                }, 1000);
                              }
                            }
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-2" />
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {panel.interactiveElement.type === 'demo' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white" 
                    onClick={() => handleInteraction()}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {panel.interactiveElement.description}
                  </Button>
                )}
                
                {panel.interactiveElement.type === 'challenge' && (
                  <div className="text-center">
                    <Button 
                      variant="secondary" 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                      onClick={() => handleInteraction()}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Accept Challenge
                    </Button>
                  </div>
                )}

                {panel.interactiveElement.type === 'question' && panel.interactiveElement.options.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      {panel.interactiveElement.question || panel.interactiveElement.content}
                    </h4>
                    <div className="space-y-2">
                      {panel.interactiveElement.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-200"
                          onClick={() => {
                            handleInteraction();
                            if (option === panel.interactiveElement?.correctAnswer) {
                              // Add celebration effect
                              const button = document.activeElement as HTMLElement;
                              if (button) {
                                button.innerHTML = `<span class="flex items-center gap-2"><span>🎉</span>${option}<span>✨</span></span>`;
                                setTimeout(() => {
                                  button.innerHTML = `<svg class="h-3 w-3 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>${option}`;
                                }, 2000);
                              }
                            }
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-2" />
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {panel.interactiveElement.type === 'click' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white animate-pulse" 
                    onClick={() => handleInteraction()}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {panel.interactiveElement.content}
                  </Button>
                )}
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
            className="hover:bg-primary/10"
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
            className="hover:bg-primary/10"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};