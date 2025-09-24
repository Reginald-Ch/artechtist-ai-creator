import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Brain, Trophy, Clock, Star, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  hint?: string;
}

interface QuizSystemProps {
  questions: QuizQuestion[];
  title: string;
  onComplete: (score: number, details: QuizResults) => void;
  onClose: () => void;
  timeLimit?: number; // in seconds
  showHints?: boolean;
  allowRetry?: boolean;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  categoryPerformance: Record<string, { correct: number; total: number }>;
  difficultyPerformance: Record<string, { correct: number; total: number }>;
}

export const EnhancedQuizSystem: React.FC<QuizSystemProps> = ({
  questions,
  title,
  onComplete,
  onClose,
  timeLimit,
  showHints = true,
  allowRetry = true
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  const { speak, stop, isPlaying } = useSpeechSynthesis();

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestion?.id];
  const isCorrect = isAnswered === currentQuestion?.correctAnswer;

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining > 0 && !isComplete) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, timeLimit, isComplete]);

  // Auto-read question when audio is enabled
  useEffect(() => {
    if (audioEnabled && currentQuestion && !showExplanation) {
      speak(currentQuestion.question);
    }
  }, [currentQuestionIndex, audioEnabled, currentQuestion, speak, showExplanation]);

  const handleAnswer = useCallback((answer: string) => {
    if (isAnswered) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    setShowExplanation(true);

    // Provide audio feedback
    if (audioEnabled) {
      const isCorrectAnswer = answer === currentQuestion.correctAnswer;
      toast.success(isCorrectAnswer ? '🎉 Correct!' : '❌ Not quite right', {
        description: isCorrectAnswer ? 'Great job!' : 'Check the explanation below'
      });
    }
  }, [currentQuestion, isAnswered, audioEnabled]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      completeQuiz();
    }
  }, [currentQuestionIndex, questions.length]);

  const completeQuiz = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = Object.entries(selectedAnswers).filter(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      return question && answer === question.correctAnswer;
    }).length;

    const score = Math.round((correctCount / questions.length) * 100);

    // Calculate category performance
    const categoryPerformance: Record<string, { correct: number; total: number }> = {};
    const difficultyPerformance: Record<string, { correct: number; total: number }> = {};

    questions.forEach(question => {
      const userAnswer = selectedAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      // Category performance
      if (!categoryPerformance[question.category]) {
        categoryPerformance[question.category] = { correct: 0, total: 0 };
      }
      categoryPerformance[question.category].total++;
      if (isCorrect) categoryPerformance[question.category].correct++;

      // Difficulty performance
      if (!difficultyPerformance[question.difficulty]) {
        difficultyPerformance[question.difficulty] = { correct: 0, total: 0 };
      }
      difficultyPerformance[question.difficulty].total++;
      if (isCorrect) difficultyPerformance[question.difficulty].correct++;
    });

    const results: QuizResults = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      timeSpent,
      categoryPerformance,
      difficultyPerformance
    };

    setQuizResults(results);
    setIsComplete(true);
    onComplete(score, results);
  }, [questions, selectedAnswers, startTime, onComplete]);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsComplete(false);
    setTimeRemaining(timeLimit || 0);
    setShowHint(false);
    setQuizResults(null);
  }, [timeLimit]);

  const toggleAudio = useCallback(() => {
    if (isPlaying) {
      stop();
    }
    setAudioEnabled(prev => !prev);
  }, [isPlaying, stop]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isComplete && quizResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="comic-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
              >
                <Trophy className="h-12 w-12" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl mb-2">Quiz Complete!</CardTitle>
            <div className="text-4xl font-bold text-primary mb-2">{quizResults.score}%</div>
            <p className="text-muted-foreground">
              {quizResults.correctAnswers} out of {quizResults.totalQuestions} correct
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Performance by Category */}
            <div>
              <h4 className="font-semibold mb-3">Performance by Category</h4>
              <div className="space-y-2">
                {Object.entries(quizResults.categoryPerformance).map(([category, performance]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(performance.correct / performance.total) * 100} 
                        className="w-20 h-2" 
                      />
                      <span className="text-sm text-muted-foreground">
                        {performance.correct}/{performance.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance by Difficulty */}
            <div>
              <h4 className="font-semibold mb-3">Performance by Difficulty</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(quizResults.difficultyPerformance).map(([difficulty, performance]) => (
                  <div key={difficulty} className="text-center">
                    <Badge className={getDifficultyColor(difficulty)}>
                      {difficulty}
                    </Badge>
                    <div className="mt-2 text-lg font-semibold">
                      {performance.correct}/{performance.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Time Spent</div>
                <div className="font-semibold">{formatTime(quizResults.timeSpent)}</div>
              </div>
              <div className="text-center">
                <Star className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Achievement</div>
                <div className="font-semibold">
                  {quizResults.score >= 90 ? 'Excellent!' : 
                   quizResults.score >= 70 ? 'Good Job!' : 
                   'Keep Learning!'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              {allowRetry && (
                <Button onClick={resetQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button onClick={onClose}>
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Quiz Header */}
      <Card className="comic-card mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAudio}
              className="text-muted-foreground"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            {timeLimit && (
              <span className={timeRemaining <= 30 ? 'text-red-500 font-semibold' : ''}>
                <Clock className="h-4 w-4 inline mr-1" />
                {formatTime(timeRemaining)}
              </span>
            )}
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="comic-card">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.points} points
                </Badge>
              </div>
              <CardTitle className="text-lg leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
              {showHints && currentQuestion.hint && (
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="text-primary"
                  >
                    💡 {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          💡 {currentQuestion.hint}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = isAnswered === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                const showResult = showExplanation;

                let buttonVariant: "outline" | "default" | "destructive" = "outline";
                let buttonClass = "";

                if (showResult) {
                  if (isCorrectOption) {
                    buttonVariant = "default";
                    buttonClass = "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300";
                  } else if (isSelected && !isCorrectOption) {
                    buttonVariant = "destructive";
                    buttonClass = "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
                  }
                }

                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={buttonVariant}
                      className={`w-full text-left justify-start h-auto p-4 relative ${buttonClass}`}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {showResult && isCorrectOption && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </Button>
                  </motion.div>
                );
              })}

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-muted/50 rounded-lg border"
                  >
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Explanation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.explanation}
                    </p>
                    <div className="mt-4 flex justify-center">
                      <Button onClick={nextQuestion}>
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedQuizSystem;