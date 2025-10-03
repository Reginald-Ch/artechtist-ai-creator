import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Calendar, 
  Snowflake, 
  Trophy, 
  TrendingUp,
  Info
} from 'lucide-react';
import { useRobustStreak } from '@/hooks/useRobustStreak';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const RobustStreakDisplay = () => {
  const { 
    streakData, 
    isLoading, 
    useFreezeDay,
    getCooldownRemaining 
  } = useRobustStreak();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData) return null;

  const cooldownMinutes = getCooldownRemaining();
  const canActivity = cooldownMinutes === 0;

  // Calculate streak health (percentage to next freeze day refill)
  const daysInMonth = new Date().getDate();
  const streakHealth = ((30 - daysInMonth) / 30) * 100;

  // Generate calendar view for last 30 days
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasActivity = streakData.streakHistory.some(
        h => h.date === dateStr && h.maintained
      );
      
      const isToday = i === 0;
      const isFuture = i < 0;
      
      days.push({
        date: dateStr,
        hasActivity,
        isToday,
        isFuture,
        day: date.getDate()
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: 'Legendary', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (streak >= 21) return { level: 'Master', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (streak >= 14) return { level: 'Expert', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (streak >= 7) return { level: 'Committed', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (streak >= 3) return { level: 'Building', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Starting', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const streakLevel = getStreakLevel(streakData.currentStreak);

  return (
    <div className="space-y-4">
      {/* Main Streak Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary animate-pulse" />
              Learning Streak
            </CardTitle>
            <Badge className={`${streakLevel.bgColor} ${streakLevel.color}`}>
              {streakLevel.level}
            </Badge>
          </div>
          <CardDescription>
            Keep learning daily to maintain your streak
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Streak */}
          <div className="text-center py-4">
            <div className="text-6xl font-bold text-primary mb-2">
              {streakData.currentStreak}
            </div>
            <p className="text-muted-foreground">
              {streakData.currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
            {streakData.longestStreak > streakData.currentStreak && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-muted-foreground">
                  Best: {streakData.longestStreak} days
                </span>
              </div>
            )}
          </div>

          {/* Freeze Days */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Freeze Days</p>
                <p className="text-xs text-muted-foreground">
                  Protect your streak when you can't learn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Freeze days protect your streak when you miss a day. 
                      You get 3 per month and they refresh on the 1st.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Badge variant="outline">
                {streakData.freezeDaysRemaining} / 3
              </Badge>
              {streakData.freezeDaysRemaining > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={useFreezeDay}
                  disabled={streakData.currentStreak === 0}
                >
                  Use
                </Button>
              )}
            </div>
          </div>

          {/* Cooldown Notice */}
          {!canActivity && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⏱️ Next activity allowed in {cooldownMinutes} minutes
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This prevents spam and ensures quality learning time
              </p>
            </div>
          )}

          {/* Total Activities */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Activities</span>
            <Badge variant="secondary">{streakData.totalActivities}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activity Calendar
          </CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        aspect-square rounded-md flex items-center justify-center text-xs font-medium
                        transition-all duration-200 cursor-pointer
                        ${day.hasActivity 
                          ? 'bg-primary text-primary-foreground hover:scale-110 shadow-sm' 
                          : 'bg-muted hover:bg-muted/70'
                        }
                        ${day.isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                        ${day.isFuture ? 'opacity-30' : ''}
                      `}
                    >
                      {day.day}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      {day.hasActivity ? '✓ Active' : 'No activity'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted" />
              <span>Inactive</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded ring-2 ring-primary" />
              <span>Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Streak Health
          </CardTitle>
          <CardDescription>
            Time until freeze days refresh
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={streakHealth} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {Math.max(0, 30 - new Date().getDate())} days until monthly refresh
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
