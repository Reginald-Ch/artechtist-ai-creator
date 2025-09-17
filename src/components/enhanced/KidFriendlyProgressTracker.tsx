import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  Heart, 
  Sparkles, 
  Target,
  Gift,
  Crown,
  Medal,
  Flame
} from "lucide-react";
import { useProgressiveStreak } from "@/hooks/useProgressiveStreak";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  maxProgress?: number;
}

export const KidFriendlyProgressTracker: React.FC = () => {
  const {
    streakData,
    getStreakMessage,
    getWeeklyProgress,
    getMotivationalMessage,
    shareProgress
  } = useProgressiveStreak();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const achievements: Achievement[] = [
    {
      id: 'first_bot',
      title: 'Bot Builder',
      description: 'Created your first chatbot!',
      icon: <Trophy className="w-4 h-4" />,
      unlocked: true,
      rarity: 'common'
    },
    {
      id: 'voice_master',
      title: 'Voice Master',
      description: 'Added voice to your bot!',
      icon: <Zap className="w-4 h-4" />,
      unlocked: false,
      rarity: 'rare'
    },
    {
      id: 'streak_hero',
      title: 'Streak Hero',
      description: 'Built bots 7 days in a row!',
      icon: <Flame className="w-4 h-4" />,
      unlocked: streakData.currentStreak >= 7,
      rarity: 'epic',
      progress: Math.min(streakData.currentStreak, 7),
      maxProgress: 7
    },
    {
      id: 'coding_champion',
      title: 'Coding Champion',
      description: 'Completed 10 Python challenges!',
      icon: <Crown className="w-4 h-4" />,
      unlocked: false,
      rarity: 'legendary',
      progress: 3,
      maxProgress: 10
    }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-200';
      case 'rare': return 'text-blue-600 border-blue-200';
      case 'epic': return 'text-purple-600 border-purple-200';
      case 'legendary': return 'text-yellow-600 border-yellow-200';
    }
  };

  const weeklyProgress = { completed: 3, target: 7 }; // Mock data since hook doesn't exist yet
  const motivationalMessage = getMotivationalMessage();

  useEffect(() => {
    // Check for new achievements
    const lastCheck = localStorage.getItem('lastAchievementCheck');
    const now = Date.now();
    
    if (!lastCheck || now - parseInt(lastCheck) > 24 * 60 * 60 * 1000) {
      // Check once per day
      const unlockedAchievements = achievements.filter(a => a.unlocked);
      if (unlockedAchievements.length > 0) {
        const randomAchievement = unlockedAchievements[Math.floor(Math.random() * unlockedAchievements.length)];
        setNewAchievement(randomAchievement);
        setShowCelebration(true);
        
        setTimeout(() => {
          setShowCelebration(false);
          setNewAchievement(null);
        }, 3000);
      }
      
      localStorage.setItem('lastAchievementCheck', now.toString());
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Your Progress
            <Badge variant="secondary" className="text-xs">
              {streakData.currentStreak} day streak!
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Weekly Goal */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Weekly Goal</span>
              <span className="text-muted-foreground">
                {weeklyProgress.completed}/{weeklyProgress.target} days
              </span>
            </div>
            <Progress 
              value={(weeklyProgress.completed / weeklyProgress.target) * 100} 
              className="h-2"
            />
          </div>
          
          {/* Motivational Message */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-center font-medium">
              {motivationalMessage}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold text-primary">
                {streakData.totalActiveDays}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Days
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-purple-600">
                {achievements.filter(a => a.unlocked).length}
              </div>
              <div className="text-xs text-muted-foreground">
                Badges
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-600">
                {streakData.longestStreak}
              </div>
              <div className="text-xs text-muted-foreground">
                Best Streak
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Medal className="w-5 h-5 text-yellow-600" />
            Achievement Badges
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br from-background to-muted/50 ${getRarityColor(achievement.rarity)}` 
                    : 'bg-muted/30 border-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1 rounded ${achievement.unlocked ? 'text-current' : 'text-muted-foreground'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">
                      {achievement.title}
                    </div>
                    <div className="text-xs opacity-75 line-clamp-2">
                      {achievement.description}
                    </div>
                    
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mt-1">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1"
                        />
                        <div className="text-xs mt-1 opacity-75">
                          {achievement.progress}/{achievement.maxProgress}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={shareProgress}
          >
            <Gift className="w-4 h-4 mr-2" />
            Share Progress
          </Button>
        </CardContent>
      </Card>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && newAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-background border-2 border-primary p-6 rounded-xl shadow-2xl max-w-sm mx-4">
              <div className="text-center space-y-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-6xl"
                >
                  🎉
                </motion.div>
                <div className="space-y-1">
                  <div className="font-bold text-lg">Achievement Unlocked!</div>
                  <div className="text-primary font-medium">{newAchievement.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {newAchievement.description}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};