import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  Trophy, 
  Play,
  Pause,
  RotateCcw,
  Code,
  CheckCircle,
  XCircle
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
  codeExamples?: {
    language: string;
    code: string;
    explanation: string;
  }[];
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
  codeExamples,
}) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<Record<string, { correct: boolean; explanation?: string }>>({});
  const [activeTab, setActiveTab] = useState<'comic' | 'code'>('comic');

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
    
    // Provide immediate feedback
    const feedback = {
      correct: isCorrect,
      explanation: isCorrect 
        ? "Great job! That's correct!" 
        : `Not quite right. The correct answer is: ${panel.interactiveElement?.correctAnswer}`
    };
    
    setAnswerFeedback(prev => ({ ...prev, [panelId]: feedback }));
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Auto-advance after answering with delay for feedback
    setTimeout(nextPanel, 2000);
  };

  const resetLesson = () => {
    setCurrentPanel(0);
    setUserAnswers({});
    setScore(0);
    setIsAnimating(false);
    setAnswerFeedback({});
    setActiveTab('comic');
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
      <CardContent className="p-3 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="text-2xl md:text-3xl">{characterAvatars[character as keyof typeof characterAvatars] || '🤖'}</div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">{title}</h2>
              <Badge variant="secondary" className="text-xs">{character}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {codeExamples && codeExamples.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab(activeTab === 'comic' ? 'code' : 'comic')}
              >
                <Code className="h-4 w-4" />
              </Button>
            )}
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
        <div className="mb-4 md:mb-6">
          <div className="flex justify-between text-xs md:text-sm text-muted-foreground mb-2">
            <span>Panel {currentPanel + 1} of {panels.length}</span>
            <span>Score: {score}/{panels.filter(p => p.interactiveElement).length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'comic' | 'code')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="comic">Comic Story</TabsTrigger>
            <TabsTrigger value="code" disabled={!codeExamples || codeExamples.length === 0}>
              Code Examples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comic">
            {/* Comic Panel */}
            <div 
              className={`relative rounded-lg p-4 md:p-8 min-h-64 md:min-h-96 transition-all duration-300 ${getAnimationClass()}`}
              style={{ 
                background: panel.background || 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)'
              }}
            >
              {/* Character */}
              <div className="absolute top-2 md:top-4 left-2 md:left-4">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="text-2xl md:text-4xl">
                    {characterAvatars[panel.character as keyof typeof characterAvatars] || '🤖'}
                  </div>
                  <Badge variant="outline" className="bg-white/80 text-xs md:text-sm">
                    {panel.character}
                  </Badge>
                </div>
              </div>

              {/* Action Text */}
              {panel.action && (
                <div className="absolute top-2 md:top-4 right-2 md:right-4">
                  <Badge variant="secondary" className="bg-white/80 text-xs md:text-sm">
                    {panel.action}
                  </Badge>
                </div>
              )}

              {/* Dialogue */}
              <div className="flex items-center justify-center h-full">
                <div className="bg-white/90 rounded-lg p-3 md:p-6 max-w-2xl mx-auto shadow-lg">
                  <p className="text-sm md:text-lg leading-relaxed text-center">
                    {panel.dialogue}
                  </p>
              
                  {/* Interactive Element */}
                  {panel.interactiveElement && (
                    <div className="mt-4 md:mt-6">
                      {panel.interactiveElement.type === 'question' && (
                        <div className="space-y-2 md:space-y-3">
                          <p className="font-medium text-center text-sm md:text-base">
                            {panel.interactiveElement.content}
                          </p>
                          {panel.interactiveElement.options?.map((option, index) => (
                            <Button
                              key={index}
                              variant={userAnswers[panel.id] === option ? 'default' : 'outline'}
                              className="w-full text-sm md:text-base"
                              onClick={() => handleAnswer(panel.id, option)}
                              disabled={!!userAnswers[panel.id]}
                            >
                              {option}
                              {userAnswers[panel.id] === option && (
                                option === panel.interactiveElement?.correctAnswer ? 
                                  <CheckCircle className="ml-2 h-4 w-4 text-green-500" /> :
                                  <XCircle className="ml-2 h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          ))}
                          
                          {/* Feedback */}
                          {answerFeedback[panel.id] && (
                            <div className={`p-3 rounded-lg text-sm ${
                              answerFeedback[panel.id].correct 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {answerFeedback[panel.id].explanation}
                            </div>
                          )}
                        </div>
                      )}
                  
                      {panel.interactiveElement.type === 'click' && (
                        <div className="text-center">
                          <Button
                            onClick={() => handleAnswer(panel.id, 'clicked')}
                            disabled={!!userAnswers[panel.id]}
                            className="text-sm md:text-base"
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
          </TabsContent>

          <TabsContent value="code">
            {codeExamples && codeExamples.length > 0 && (
              <div className="space-y-4">
                {codeExamples.map((example, index) => (
                  <Card key={index} className="bg-slate-900 text-white">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <Badge variant="secondary" className="bg-slate-700">
                          {example.language}
                        </Badge>
                      </div>
                      <pre className="text-xs md:text-sm overflow-x-auto bg-slate-800 p-3 rounded">
                        <code>{example.code}</code>
                      </pre>
                      <div className="mt-3 p-3 bg-blue-900/30 rounded border border-blue-700">
                        <p className="text-sm text-blue-100">{example.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 md:mt-6 gap-3">
          <Button
            variant="outline"
            onClick={prevPanel}
            disabled={currentPanel === 0}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-1 md:space-x-2">
            {panels.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
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
            className="w-full sm:w-auto"
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