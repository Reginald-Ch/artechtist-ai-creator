import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  Trophy, 
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface ComicPanel {
  id: string;
  character: string;
  dialogue: string;
  action?: string;
  background: string;
  animation?: string; // Allow any animation string for flexibility
  interactiveElement?: {
    type: string; // Allow any type string for flexibility
    content: string;
    options?: string[];
    correctAnswer?: string;
  };
}

interface ComicLessonProps {
  lessonId: string;
  title: string;
  character: string;
  panels: ComicPanel[];
  onComplete: (lessonId: string, score: number) => void;
  onProgress: (lessonId: string, panelIndex: number) => void;
}

const characterAvatars = {
  'AI-ko': '🤖',
  'Student Amara': '👩🏾‍🎓',
  'Teacher Kwame': '👨🏿‍🏫',
  'Elder Fatima': '👵🏾',
  'Inventor Zuberi': '👨🏾‍💻',
  'Market Vendor Asha': '👩🏾‍💼',
  'Village Chief': '👴🏿',
};

export const ComicLesson: React.FC<ComicLessonProps> = ({
  lessonId,
  title,
  character,
  panels,
  onComplete,
  onProgress,
}) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const progress = ((currentPanel + 1) / panels.length) * 100;

  useEffect(() => {
    onProgress(lessonId, currentPanel);
  }, [currentPanel, lessonId, onProgress]);

  useEffect(() => {
    if (isAutoPlay && currentPanel < panels.length - 1) {
      const timer = setTimeout(() => {
        nextPanel();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, currentPanel]);

  const nextPanel = () => {
    if (currentPanel < panels.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPanel(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      // Lesson complete
      const finalScore = Math.round((score / panels.filter(p => p.interactiveElement).length) * 100);
      onComplete(lessonId, finalScore);
    }
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPanel(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleAnswer = (panelId: string, answer: string) => {
    const panel = panels[currentPanel];
    const isCorrect = answer === panel.interactiveElement?.correctAnswer;
    
    setUserAnswers(prev => ({ ...prev, [panelId]: answer }));
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Auto-advance after answering
    setTimeout(nextPanel, 1000);
  };

  const resetLesson = () => {
    setCurrentPanel(0);
    setUserAnswers({});
    setScore(0);
    setIsAnimating(false);
  };

  const panel = panels[currentPanel];
  if (!panel) return null;

  const getAnimationClass = () => {
    if (isAnimating) return 'opacity-50 scale-95';
    
    switch (panel.animation) {
      case 'fadeIn':
        return 'animate-fade-in';
      case 'slideLeft':
        return 'animate-slide-in-right';
      case 'slideRight':
        return 'animate-slide-out-right';
      case 'bounce':
        return 'animate-bounce';
      case 'pulse':
        return 'animate-pulse';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{characterAvatars[character as keyof typeof characterAvatars] || '🤖'}</div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <Badge variant="secondary">{character}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetLesson}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Panel {currentPanel + 1} of {panels.length}</span>
            <span>Score: {score}/{panels.filter(p => p.interactiveElement).length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Comic Panel */}
        <div 
          className={`relative rounded-lg p-8 min-h-96 transition-all duration-300 ${getAnimationClass()}`}
          style={{ 
            background: panel.background || 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)'
          }}
        >
          {/* Character */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center space-x-2">
              <div className="text-4xl">
                {characterAvatars[panel.character as keyof typeof characterAvatars] || '🤖'}
              </div>
              <Badge variant="outline" className="bg-white/80">
                {panel.character}
              </Badge>
            </div>
          </div>

          {/* Action Text */}
          {panel.action && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/80">
                {panel.action}
              </Badge>
            </div>
          )}

          {/* Dialogue */}
          <div className="flex items-center justify-center h-full">
            <div className="bg-white/90 rounded-lg p-6 max-w-2xl mx-auto shadow-lg">
              <p className="text-lg leading-relaxed text-center">
                {panel.dialogue}
              </p>
              
              {/* Interactive Element */}
              {panel.interactiveElement && (
                <div className="mt-6">
                  {panel.interactiveElement.type === 'question' && (
                    <div className="space-y-3">
                      <p className="font-medium text-center">
                        {panel.interactiveElement.content}
                      </p>
                      {panel.interactiveElement.options?.map((option, index) => (
                        <Button
                          key={index}
                          variant={userAnswers[panel.id] === option ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => handleAnswer(panel.id, option)}
                          disabled={!!userAnswers[panel.id]}
                        >
                          {option}
                          {userAnswers[panel.id] === option && (
                            option === panel.interactiveElement?.correctAnswer ? 
                              <Star className="ml-2 h-4 w-4 text-yellow-500" /> :
                              <span className="ml-2 text-red-500">✗</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {panel.interactiveElement.type === 'click' && (
                    <div className="text-center">
                      <Button
                        onClick={() => handleAnswer(panel.id, 'clicked')}
                        disabled={!!userAnswers[panel.id]}
                      >
                        {panel.interactiveElement.content}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={prevPanel}
            disabled={currentPanel === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {panels.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPanel 
                    ? 'bg-primary' 
                    : index < currentPanel 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextPanel}
            disabled={panel.interactiveElement && !userAnswers[panel.id]}
          >
            {currentPanel === panels.length - 1 ? (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};