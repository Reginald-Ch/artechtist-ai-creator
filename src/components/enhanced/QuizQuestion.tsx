import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestionProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  onAnswer: (isCorrect: boolean) => void;
  questionNumber?: number;
  totalQuestions?: number;
}

export const QuizQuestion = ({
  question,
  options,
  correctAnswer,
  explanation,
  onAnswer,
  questionNumber,
  totalQuestions
}: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelectAnswer = (option: string) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(option);
    setHasAnswered(true);
    setShowExplanation(true);
    
    const isCorrect = option === correctAnswer;
    onAnswer(isCorrect);
    
    toast[isCorrect ? 'success' : 'error'](
      isCorrect ? '✨ Correct!' : '🤔 Not quite right',
      {
        description: isCorrect ? 'Great job!' : 'Try reviewing the lesson',
        duration: 2000
      }
    );
  };

  const getOptionStyle = (option: string) => {
    if (!hasAnswered) return 'hover:border-primary hover:bg-primary/5';
    
    if (option === correctAnswer) {
      return 'border-green-500 bg-green-50 dark:bg-green-950';
    }
    
    if (option === selectedAnswer && option !== correctAnswer) {
      return 'border-destructive bg-destructive/5';
    }
    
    return 'opacity-50';
  };

  const getOptionIcon = (option: string) => {
    if (!hasAnswered) return null;
    
    if (option === correctAnswer) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    
    if (option === selectedAnswer && option !== correctAnswer) {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    
    return null;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2">
      {questionNumber && totalQuestions && (
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-sm">
            Question {questionNumber}/{totalQuestions}
          </Badge>
        </div>
      )}
      
      <div className="flex items-start gap-3 mb-6">
        <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <h3 className="text-lg font-semibold leading-relaxed">{question}</h3>
      </div>
      
      <div className="grid gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(option)}
            disabled={hasAnswered}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left ${getOptionStyle(option)} ${
              !hasAnswered ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <span className="font-medium">{option}</span>
            {getOptionIcon(option)}
          </button>
        ))}
      </div>
      
      {showExplanation && explanation && (
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Explanation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};