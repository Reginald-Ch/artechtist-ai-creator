import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Star, Target, Calendar, Award } from 'lucide-react';
import { useProgressiveStreak, Achievement } from '@/hooks/useProgressiveStreak';

interface ProgressiveStreakProps {
  onViewAchievements?: () => void;
}

export const ProgressiveStreak = ({ onViewAchievements }: ProgressiveStreakProps) => {
  const { streakData, getStreakMessage, getWeeklyProgress } = useProgressiveStreak();
  
  const weeklyProgress = getWeeklyProgress();
  const weeklyPercentage = (weeklyProgress / streakData.weeklyGoal) * 100;
  
  const recentAchievements = streakData.achievements
    .filter(a => a.unlocked)
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Main Streak Card */}
      <Card className="comic-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Learning Streak
            </CardTitle>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {streakData.currentStreak} days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {streakData.currentStreak}
            </div>
            <p className="text-sm text-muted-foreground">
              {getStreakMessage()}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-purple-600">
                {streakData.longestStreak}
              </div>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">
                {streakData.totalActiveDays}
              </div>
              <p className="text-xs text-muted-foreground">Total Days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card className="comic-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-green-500" />
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>{weeklyProgress} / {streakData.weeklyGoal} days</span>
            <Badge variant={weeklyProgress >= streakData.weeklyGoal ? "default" : "outline"}>
              {Math.round(weeklyPercentage)}%
            </Badge>
          </div>
          <Progress value={weeklyPercentage} className="h-2" />
          {weeklyProgress >= streakData.weeklyGoal && (
            <div className="text-center text-sm text-green-600 font-medium">
              🎉 Weekly goal achieved!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="comic-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-yellow-500" />
                Recent Achievements
              </CardTitle>
              {onViewAchievements && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onViewAchievements}
                  className="text-xs"
                >
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <span className="text-xl">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {achievement.description}
                  </p>
                </div>
                <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};