import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';
import { useProgressiveStreak } from '@/hooks/useProgressiveStreak';

export const SimpleStreak = () => {
  const { streakData } = useProgressiveStreak();
  
  const getStreakMessage = () => {
    if (streakData.currentStreak >= 7) return 'Amazing streak! 🌟';
    if (streakData.currentStreak >= 3) return 'Keep it up! 💪';
    if (streakData.currentStreak > 0) return 'Good start! 🚀';
    return 'Start today! 🌱';
  };

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <CardTitle className="text-base">Streak</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-1">
            {streakData.currentStreak}
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {streakData.currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>

        <div className="text-center text-sm font-medium text-orange-600">
          {getStreakMessage()}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
            <div className="text-lg font-bold text-purple-600">
              {streakData.longestStreak}
            </div>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>
          <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
            <div className="text-lg font-bold text-blue-600">
              {streakData.totalActiveDays}
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
