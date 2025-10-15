import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Trophy, Star, Flame, BookOpen, Target, Zap, 
  Award, Crown, Sparkles, TrendingUp, Brain, Heart
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

  const achievements: Achievement[] = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: BookOpen,
      requirement: 1,
      current: completedLessons,
      category: 'lessons',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'curious-learner',
      title: 'Curious Learner',
      description: 'Complete 5 lessons',
      icon: Brain,
      requirement: 5,
      current: completedLessons,
      category: 'lessons',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'knowledge-seeker',
      title: 'Knowledge Seeker',
      description: 'Complete 10 lessons',
      icon: Star,
      requirement: 10,
      current: completedLessons,
      category: 'lessons',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'ai-expert',
      title: 'AI Expert',
      description: 'Complete 25 lessons',
      icon: Crown,
      requirement: 25,
      current: completedLessons,
      category: 'lessons',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'streak-starter',
      title: 'Streak Starter',
      description: 'Maintain a 3-day streak',
      icon: Flame,
      requirement: 3,
      current: streakDays,
      category: 'streak',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'dedicated-scholar',
      title: 'Dedicated Scholar',
      description: 'Maintain a 7-day streak',
      icon: Flame,
      requirement: 7,
      current: streakDays,
      category: 'streak',
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 'unstoppable',
      title: 'Unstoppable',
      description: 'Maintain a 30-day streak',
      icon: Zap,
      requirement: 30,
      current: streakDays,
      category: 'streak',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Achieve 95%+ average score',
      icon: Trophy,
      requirement: 95,
      current: averageScore,
      category: 'score',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'high-achiever',
      title: 'High Achiever',
      description: 'Achieve 85%+ average score',
      icon: Award,
      requirement: 85,
      current: averageScore,
      category: 'score',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'time-traveler',
      title: 'Time Traveler',
      description: 'Spend 60 minutes learning',
      icon: Target,
      requirement: 60,
      current: totalTimeSpent,
      category: 'time',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'marathon-learner',
      title: 'Marathon Learner',
      description: 'Spend 5 hours learning',
      icon: TrendingUp,
      requirement: 300,
      current: totalTimeSpent,
      category: 'time',
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'passion-driven',
      title: 'Passion Driven',
      description: 'Spend 10 hours learning',
      icon: Heart,
      requirement: 600,
      current: totalTimeSpent,
      category: 'time',
      color: 'from-rose-500 to-red-600'
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle>Achievements</CardTitle>
            </div>
            <Badge variant="outline">
              {unlockedCount}/{achievements.length}
            </Badge>
          </div>
          <CardDescription>Track your learning milestones</CardDescription>
          <Progress value={progressPercent} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map(achievement => {
              const Icon = achievement.icon;
              const isUnlocked = achievement.current >= achievement.requirement;
              const progress = Math.min((achievement.current / achievement.requirement) * 100, 100);

              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isUnlocked 
                      ? 'border-primary bg-gradient-to-br from-primary/10 to-transparent' 
                      : 'border-border opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${isUnlocked ? `bg-gradient-to-br ${achievement.color}` : 'bg-muted'}`}>
                      <Icon className={`w-4 h-4 ${isUnlocked ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                      {!isUnlocked && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{achievement.current}/{achievement.requirement}</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      )}
                    </div>
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