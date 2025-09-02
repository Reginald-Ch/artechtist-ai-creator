import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  X, 
  Clock, 
  Target, 
  Trophy,
  Volume2,
  VolumeX,
  Play,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, totalTime: number) => void;
  onClose: () => void;
  title: string;
}

export const InteractiveQuiz = ({ questions, onComplete, onClose, title }: InteractiveQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [totalTime, setTotalTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isReading, setIsReading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const score = correctAnswers.size;

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showExplanation && !isComplete) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        setTotalTime(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showExplanation) {
      // Time's up - auto submit
      handleAnswer(-1); // No answer selected
    }
  }, [timeLeft, showExplanation, isComplete]);

  // Text-to-speech function
  const speakText = (text: string) => {
    if (!audioEnabled) return;
    
    setIsReading(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.7;
    
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsReading(false);
  };

  // Auto-read question when it changes
  useEffect(() => {
    if (currentQuestion && audioEnabled) {
      const textToRead = `Question ${currentQuestionIndex + 1}: ${currentQuestion.question}. The options are: ${currentQuestion.options.join(', ')}`;
      setTimeout(() => speakText(textToRead), 500);
    }
  }, [currentQuestionIndex]);

  const handleAnswer = (answerIndex: number) => {
    if (answeredQuestions.has(currentQuestionIndex)) return;

    setSelectedAnswer(answerIndex);
    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));
    
    if (answerIndex === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => new Set([...prev, currentQuestionIndex]));
    }
    
    setShowExplanation(true);
    
    // Read explanation
    if (audioEnabled) {
      const explanationText = answerIndex === currentQuestion.correctAnswer 
        ? `Correct! ${currentQuestion.explanation}`
        : `Incorrect. The correct answer is ${currentQuestion.options[currentQuestion.correctAnswer]}. ${currentQuestion.explanation}`;
      
      setTimeout(() => speakText(explanationText), 300);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(30); // Reset timer
    } else {
      // Quiz complete
      setIsComplete(true);
      onComplete(score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0), totalTime);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnsweredQuestions(new Set());
    setCorrectAnswers(new Set());
    setShowExplanation(false);
    setTimeLeft(30);
    setTotalTime(0);
    setIsComplete(false);
    stopSpeaking();
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
    const finalScore = Math.round((score / questions.length) * 100);
    const timeBonus = Math.max(0, 300 - totalTime); // Bonus for completing quickly
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg mx-auto animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Quiz Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{finalScore}%</div>
              <p className="text-muted-foreground mb-4">
                You got {score} out of {questions.length} questions correct!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{score}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-500">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
              </div>
              
              {finalScore >= 80 && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 mb-4">
                  🌟 Excellent Work!
                </Badge>
              )}
              {finalScore >= 60 && finalScore < 80 && (
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 mb-4">
                  👍 Good Job!
                </Badge>
              )}
              {finalScore < 60 && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 mb-4">
                  📚 Keep Learning!
                </Badge>
              )}
            </div>
            
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
      <Card className="w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={cn(
                  "transition-colors",
                  audioEnabled ? "text-primary" : "text-muted-foreground"
                )}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className={cn(
                    "font-mono",
                    timeLeft <= 10 && "text-red-500 font-bold animate-pulse"
                  )}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{score}/{answeredQuestions.size}</span>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex gap-2 mb-3">
                  <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {currentQuestion.points} points
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isReading) {
                    stopSpeaking();
                  } else {
                    speakText(currentQuestion.question);
                  }
                }}
                disabled={!audioEnabled}
                className={cn(
                  "ml-4",
                  isReading && "animate-pulse text-primary"
                )}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = showExplanation;
                
                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && handleAnswer(index)}
                    disabled={showExplanation}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102",
                      !showResult && "hover:border-primary/50 hover:bg-primary/5",
                      isSelected && !showResult && "border-primary bg-primary/10",
                      showResult && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/20",
                      showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/20",
                      showResult && !isSelected && !isCorrect && "border-muted bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold",
                        !showResult && "border-muted-foreground text-muted-foreground",
                        isSelected && !showResult && "border-primary text-primary",
                        showResult && isCorrect && "border-green-600 bg-green-600 text-white",
                        showResult && isSelected && !isCorrect && "border-red-600 bg-red-600 text-white"
                      )}>
                        {showResult && isCorrect && <CheckCircle className="h-4 w-4" />}
                        {showResult && isSelected && !isCorrect && <X className="h-4 w-4" />}
                        {!showResult && String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    selectedAnswer === currentQuestion.correctAnswer 
                      ? "bg-green-600 text-white" 
                      : "bg-red-600 text-white"
                  )}>
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-semibold">
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                
                <Button onClick={nextQuestion} className="w-full mt-4">
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};