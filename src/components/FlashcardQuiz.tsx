import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, RotateCcw, Brain, Sparkles, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardQuizProps {
  cards: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const FlashcardQuiz = ({ cards, onComplete, onClose }: FlashcardQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const correctAnswers = Object.values(userAnswers).filter(answer => answer === 'correct').length;
  const answeredCards = Object.keys(userAnswers).length;

  useEffect(() => {
    // Reset flip state when changing cards
    setIsFlipped(false);
  }, [currentIndex]);

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentCard) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentCard.id]: isCorrect ? 'correct' : 'incorrect'
    }));

    // Auto-advance after answer
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Quiz complete
        setIsComplete(true);
        const finalScore = Math.round(((correctAnswers + (isCorrect ? 1 : 0)) / cards.length) * 100);
        setTimeout(() => onComplete(finalScore), 1000);
      }
    }, 1500);
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setUserAnswers({});
    setIsComplete(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md mx-auto animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Quiz Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">{correctAnswers}/{cards.length}</div>
            <p className="text-muted-foreground">
              You got {Math.round((correctAnswers / cards.length) * 100)}% correct!
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={resetQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={onClose}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-background rounded-t-lg p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">AI Flashcard Quiz</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span>{answeredCards} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative h-96 mx-auto perspective-1000">
          <div 
            className={cn(
              "flashcard w-full h-full relative transition-transform duration-700 preserve-3d cursor-pointer",
              isFlipped && "rotate-y-180"
            )}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <Card className="flashcard-face absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  <Badge className={getDifficultyColor(currentCard?.difficulty || 'easy')}>
                    {currentCard?.difficulty}
                  </Badge>
                  <Badge variant="outline">{currentCard?.category}</Badge>
                </div>
                <CardTitle className="text-xl">Question</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center text-center p-8">
                <div className="space-y-4">
                  <Sparkles className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-lg font-medium leading-relaxed">
                    {currentCard?.question}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click to see the answer
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Back */}
            <Card className="flashcard-face absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-green-700 dark:text-green-300">Answer</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center text-center p-8">
                <div className="space-y-6">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                  <p className="text-lg font-medium leading-relaxed">
                    {currentCard?.answer}
                  </p>
                  
                  {/* Answer Buttons */}
                  {!userAnswers[currentCard?.id] && (
                    <div className="flex gap-3 justify-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(false);
                        }}
                        className="border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Incorrect
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Correct
                      </Button>
                    </div>
                  )}

                  {/* Show result if already answered */}
                  {userAnswers[currentCard?.id] && (
                    <div className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-full",
                      userAnswers[currentCard?.id] === 'correct' 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                    )}>
                      {userAnswers[currentCard?.id] === 'correct' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      {userAnswers[currentCard?.id] === 'correct' ? 'Correct!' : 'Try again next time!'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-background rounded-b-lg p-4 border-t">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevCard}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Score: {correctAnswers}/{answeredCards}
            </div>
            
            <Button 
              variant="outline" 
              onClick={nextCard}
              disabled={currentIndex === cards.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};