import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Trophy, Star, Flame, BookOpen, Target, Zap, 
  Award, Crown, Sparkles, TrendingUp, Brain, Heart, CheckCircle2
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Confetti from 'react-confetti';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  requirement: number;
  current: number;
  category: 'lessons' | 'streak' | 'score' | 'time' | 'special';
  color: string;
}

interface AchievementSystemProps {
  completedLessons: number;
  streakDays: number;
  averageScore: number;
  totalTimeSpent: number;
}

export const AchievementSystem = ({
  completedLessons,
  streakDays,
  averageScore,
  totalTimeSpent
}: AchievementSystemProps) => {
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousState, setPreviousState] = useState({
    lessons: 0,
    streak: 0,
    score: 0,
    time: 0
  });

  // Simplified achievements for kids
  const achievements: Achievement[] = [
    {
      id: 'first-steps',
      title: '🌟 First Lesson!',
      description: 'You completed your first lesson!',
      icon: BookOpen,
      requirement: 1,
      current: completedLessons,
      category: 'lessons',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'super-learner',
      title: '🚀 Super Learner',
      description: 'Complete 5 lessons',
      icon: Star,
      requirement: 5,
      current: completedLessons,
      category: 'lessons',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'ai-champion',
      title: '👑 AI Champion',
      description: 'Complete 10 lessons',
      icon: Crown,
      requirement: 10,
      current: completedLessons,
      category: 'lessons',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'streak-starter',
      title: '🔥 3 Day Streak',
      description: 'Learn 3 days in a row!',
      icon: Flame,
      requirement: 3,
      current: streakDays,
      category: 'streak',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'week-master',
      title: '⚡ Week Superstar',
      description: 'Learn 7 days in a row!',
      icon: Zap,
      requirement: 7,
      current: streakDays,
      category: 'streak',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'perfect-score',
      title: '⭐ Star Performer',
      description: 'Get 90% or higher average',
      icon: Trophy,
      requirement: 90,
      current: averageScore,
      category: 'score',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  useEffect(() => {
    // Check for newly unlocked achievements
    achievements.forEach(achievement => {
      const wasUnlocked = checkWasUnlocked(achievement, previousState);
      const isNowUnlocked = achievement.current >= achievement.requirement;

      if (!wasUnlocked && isNowUnlocked) {
        setUnlockedAchievement(achievement);
        setShowConfetti(true);
        toast.success(`🏆 Achievement Unlocked: ${achievement.title}!`, {
          description: achievement.description,
          duration: 5000
        });
        setTimeout(() => setShowConfetti(false), 5000);
      }
    });

    setPreviousState({
      lessons: completedLessons,
      streak: streakDays,
      score: averageScore,
      time: totalTimeSpent
    });
  }, [completedLessons, streakDays, averageScore, totalTimeSpent]);

  const checkWasUnlocked = (achievement: Achievement, prevState: typeof previousState) => {
    switch (achievement.category) {
      case 'lessons':
        return prevState.lessons >= achievement.requirement;
      case 'streak':
        return prevState.streak >= achievement.requirement;
      case 'score':
        return prevState.score >= achievement.requirement;
      case 'time':
        return prevState.time >= achievement.requirement;
      default:
        return false;
    }
  };

  const unlockedCount = achievements.filter(a => a.current >= a.requirement).length;
  const progressPercent = (unlockedCount / achievements.length) * 100;

  return (
    <>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
        />
      )}

      <Dialog open={!!unlockedAchievement} onOpenChange={() => setUnlockedAchievement(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Achievement Unlocked!</DialogTitle>
          </DialogHeader>
          {unlockedAchievement && (
            <div className="text-center space-y-4 py-6">
              <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${unlockedAchievement.color} flex items-center justify-center animate-pulse`}>
                <unlockedAchievement.icon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold">{unlockedAchievement.title}</h3>
              <p className="text-muted-foreground">{unlockedAchievement.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Your Badges</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {unlockedCount}/{achievements.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {achievements.map(achievement => {
              const Icon = achievement.icon;
              const isUnlocked = achievement.current >= achievement.requirement;
              const progress = Math.min((achievement.current / achievement.requirement) * 100, 100);

              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isUnlocked 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${!isUnlocked && 'grayscale opacity-50'}`}>
                      {achievement.title.split(' ')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      {!isUnlocked && (
                        <div className="mt-1">
                          <Progress value={progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.current}/{achievement.requirement}
                          </p>
                        </div>
                      )}
                    </div>
                    {isUnlocked && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
};