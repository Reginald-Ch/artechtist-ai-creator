import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2 } from 'lucide-react';

interface DailyGoalsProps {
  completedToday: number;
  timeSpentToday: number;
  dailyTarget?: number;
  timeTarget?: number;
}

export const DailyGoals = ({ 
  completedToday, 
  timeSpentToday,
  dailyTarget = 2,
  timeTarget = 15
}: DailyGoalsProps) => {
  const lessonProgress = (completedToday / dailyTarget) * 100;
  const isGoalComplete = completedToday >= dailyTarget;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Today's Goal</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Simple Lesson Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Complete Lessons</span>
            <span className="text-2xl font-bold text-primary">
              {completedToday}/{dailyTarget}
            </span>
          </div>
          <Progress 
            value={Math.min(lessonProgress, 100)} 
            className="h-3"
          />
        </div>

        {/* Simple Motivational Message */}
        <div className="text-center text-sm font-medium pt-2">
          {isGoalComplete ? (
            <p className="text-green-600">🎉 Great job today!</p>
          ) : completedToday > 0 ? (
            <p className="text-primary">💪 Keep it up!</p>
          ) : (
            <p className="text-muted-foreground">🌟 Start learning!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};