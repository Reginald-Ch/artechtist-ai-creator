import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Check, 
  X, 
  RotateCcw,
  ArrowRight,
  Star,
  Trophy,
  Calendar
} from 'lucide-react';
import { Flashcard } from '@/types/lesson';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FlashcardProgress {
  flashcard_id: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  mastery_level: number;
}

interface EnhancedFlashcardStudyProps {
  lessonId: string;
  flashcards: Flashcard[];
  onComplete?: () => void;
  onBack?: () => void;
}

export const EnhancedFlashcardStudy = ({ 
  lessonId, 
  flashcards,
  onComplete,
  onBack
}: EnhancedFlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState<Record<number, FlashcardProgress>>({});
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });

  const currentCard = flashcards[currentIndex];

  // Load flashcard progress from Supabase
  useEffect(() => {
    loadFlashcardProgress();
  }, [lessonId]);

  const loadFlashcardProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId);

      if (error) throw error;

      if (data) {
        const progressMap: Record<number, FlashcardProgress> = {};
        data.forEach((item: any) => {
          progressMap[item.flashcard_id] = {
            flashcard_id: item.flashcard_id,
            ease_factor: parseFloat(item.ease_factor),
            interval_days: item.interval_days,
            repetitions: item.repetitions,
            next_review_date: item.next_review_date,
            mastery_level: item.mastery_level
          };
        });
        setProgress(progressMap);
      }
    } catch (error) {
      console.error('Failed to load flashcard progress:', error);
    }
  };

  // SM-2 Spaced Repetition Algorithm
  const calculateNextReview = useCallback((
    quality: number, // 0-5 (0=fail, 5=perfect)
    currentProgress?: FlashcardProgress
  ): FlashcardProgress => {
    const easeFactor = currentProgress?.ease_factor || 2.5;
    const interval = currentProgress?.interval_days || 0;
    const repetitions = currentProgress?.repetitions || 0;

    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure ease factor doesn't go below 1.3
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }

    let newInterval: number;
    let newRepetitions: number;

    if (quality < 3) {
      // Failed - restart
      newInterval = 1;
      newRepetitions = 0;
    } else {
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
      newRepetitions = repetitions + 1;
    }

    // Calculate mastery level (0-100)
    const masteryLevel = Math.min(100, Math.round((newRepetitions / 10) * 100));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      flashcard_id: currentCard.id,
      ease_factor: newEaseFactor,
      interval_days: newInterval,
      repetitions: newRepetitions,
      next_review_date: nextReviewDate.toISOString(),
      mastery_level: masteryLevel
    };
  }, [currentCard]);

  const handleRating = async (difficulty: 'hard' | 'medium' | 'easy') => {
    const qualityMap = {
      hard: 2,
      medium: 3,
      easy: 5
    };

    const quality = qualityMap[difficulty];
    const currentProgress = progress[currentCard.id];
    const newProgress = calculateNextReview(quality, currentProgress);

    // Update local state
    setProgress(prev => ({
      ...prev,
      [currentCard.id]: newProgress
    }));

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      [difficulty]: prev[difficulty] + 1
    }));

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('flashcard_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          flashcard_id: currentCard.id,
          ease_factor: newProgress.ease_factor,
          interval_days: newProgress.interval_days,
          repetitions: newProgress.repetitions,
          next_review_date: newProgress.next_review_date,
          mastery_level: newProgress.mastery_level,
          last_reviewed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id,flashcard_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save flashcard progress:', error);
      toast.error('Failed to save progress');
    }

    // Move to next card or complete
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      toast.success('Study session complete! 🎉');
      if (onComplete) {
        onComplete();
      }
    }
  };

  const getMasteryLevel = () => {
    const cardProgress = progress[currentCard.id];
    return cardProgress?.mastery_level || 0;
  };

  const getMasteryBadge = (level: number) => {
    if (level >= 80) return { text: 'Mastered', color: 'bg-green-100 text-green-800' };
    if (level >= 60) return { text: 'Learning', color: 'bg-blue-100 text-blue-800' };
    if (level >= 40) return { text: 'Familiar', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'New', color: 'bg-gray-100 text-gray-800' };
  };

  const getNextReviewInfo = () => {
    const cardProgress = progress[currentCard.id];
    if (!cardProgress) return 'Not reviewed yet';

    const nextDate = new Date(cardProgress.next_review_date);
    const now = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Due for review';
    if (diffDays === 1) return 'Review tomorrow';
    if (diffDays < 7) return `Review in ${diffDays} days`;
    if (diffDays < 30) return `Review in ${Math.ceil(diffDays / 7)} weeks`;
    return `Review in ${Math.ceil(diffDays / 30)} months`;
  };

  const progressPercentage = ((currentIndex + 1) / flashcards.length) * 100;
  const masteryLevel = getMasteryLevel();
  const masteryBadge = getMasteryBadge(masteryLevel);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Flashcard Study Mode
              </CardTitle>
              <CardDescription className="mt-1">
                Using spaced repetition for optimal learning
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Card {currentIndex + 1} of {flashcards.length}
              </Badge>
              {onBack && (
                <Button variant="outline" size="sm" onClick={onBack}>
                  Back
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Session Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Flashcard */}
      <Card className="min-h-[400px]">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Card Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={masteryBadge.color}>
                  {masteryBadge.text}
                </Badge>
                <Badge variant="outline">
                  {currentCard.category}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3" />
                  {masteryLevel}%
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {getNextReviewInfo()}
              </div>
            </div>

            {/* Question */}
            <div className="text-center space-y-6 py-8">
              <div className="text-xl font-semibold">
                {currentCard.question}
              </div>

              {/* Answer */}
              {showAnswer && (
                <div className="p-6 bg-muted/50 rounded-lg space-y-4 animate-fade-in">
                  <div className="text-lg">
                    {currentCard.answer}
                  </div>
                  
                  {/* Rating Buttons */}
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      How well did you know this?
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={() => handleRating('hard')}
                        variant="outline"
                        className="border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2 text-red-500" />
                        Hard
                      </Button>
                      <Button
                        onClick={() => handleRating('medium')}
                        variant="outline"
                        className="border-yellow-200 hover:bg-yellow-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-2 text-yellow-500" />
                        Medium
                      </Button>
                      <Button
                        onClick={() => handleRating('easy')}
                        variant="outline"
                        className="border-green-200 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Easy
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Answer Button */}
              {!showAnswer && (
                <Button 
                  onClick={() => setShowAnswer(true)}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-glow"
                >
                  Show Answer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Session Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{sessionStats.reviewed}</div>
              <div className="text-xs text-muted-foreground">Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sessionStats.easy}</div>
              <div className="text-xs text-muted-foreground">Easy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{sessionStats.medium}</div>
              <div className="text-xs text-muted-foreground">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{sessionStats.hard}</div>
              <div className="text-xs text-muted-foreground">Hard</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
