import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Flame, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';
import Confetti from 'react-confetti';

interface DailyGoalsProps {
  completedToday: number;
  timeSpentToday: number;
  dailyTarget?: number;
  timeTarget?: number;
}

export const DailyGoals = ({ 
  completedToday, 
  timeSpentToday,
  dailyTarget = 3,
  timeTarget = 30
}: DailyGoalsProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(0);

  const lessonProgress = (completedToday / dailyTarget) * 100;
  const timeProgress = (timeSpentToday / timeTarget) * 100;
  const overallProgress = (lessonProgress + timeProgress) / 2;
  const isGoalComplete = lessonProgress >= 100 && timeProgress >= 100;

  useEffect(() => {
    if (isGoalComplete && previousProgress < 100) {
      setShowConfetti(true);
      toast.success('🎉 Daily Goal Achieved!', {
        description: 'Amazing work! Keep up the streak!',
        duration: 5000
      });
      setTimeout(() => setShowConfetti(false), 5000);
    }
    setPreviousProgress(overallProgress);
  }, [isGoalComplete, previousProgress, overallProgress]);

  return (
    <>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <Card className="overflow-hidden border-2 border-primary/20">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Daily Goals</CardTitle>
                  <CardDescription>Stay consistent, grow faster</CardDescription>
                </div>
              </div>
              {isGoalComplete && (
                <Badge className="bg-green-500 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
          </CardHeader>
        </div>
        
        <CardContent className="space-y-4 pt-6">
          {/* Lessons Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="font-medium">Complete Lessons</span>
              </div>
              <span className="font-bold text-primary">
                {completedToday}/{dailyTarget}
              </span>
            </div>
            <Progress 
              value={Math.min(lessonProgress, 100)} 
              className="h-2"
            />
          </div>

          {/* Time Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Learning Time</span>
              </div>
              <span className="font-bold text-orange-600">
                {timeSpentToday}/{timeTarget} min
              </span>
            </div>
            <Progress 
              value={Math.min(timeProgress, 100)} 
              className="h-2"
            />
          </div>

          {/* Overall Progress */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{Math.round(overallProgress)}%</span>
            </div>
            <Progress 
              value={Math.min(overallProgress, 100)} 
              className="h-3"
            />
          </div>

          {/* Motivational Message */}
          <div className="text-center text-sm text-muted-foreground">
            {isGoalComplete ? (
              <p className="text-green-600 font-semibold">🎉 Fantastic work today!</p>
            ) : overallProgress >= 50 ? (
              <p>🔥 You're more than halfway there!</p>
            ) : completedToday > 0 ? (
              <p>💪 Great start! Keep going!</p>
            ) : (
              <p>🎯 Ready to start your learning journey?</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};