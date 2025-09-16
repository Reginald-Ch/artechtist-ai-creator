import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Gift, 
  Heart, 
  Zap, 
  Target,
  Sparkles,
  Crown,
  Medal,
  Gem
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface KidFriendlyFeaturesProps {
  streakCount?: number;
  totalProjects?: number;
  completedChallenges?: number;
  className?: string;
}

export const KidFriendlyFeatures: React.FC<KidFriendlyFeaturesProps> = ({
  streakCount = 0,
  totalProjects = 0,
  completedChallenges = 0,
  className
}) => {
  const [showCelebration, setShowCelebration] = useState(false);

  const achievements = [
    {
      id: 'first-bot',
      title: 'Bot Builder Beginner',
      icon: <Trophy className="h-5 w-5" />,
      description: 'Created your first AI friend!',
      unlocked: totalProjects >= 1,
      color: 'text-yellow-500'
    },
    {
      id: 'streak-master',
      title: 'Coding Streak Star',
      icon: <Star className="h-5 w-5" />,
      description: 'Keep coming back to code!',
      unlocked: streakCount >= 3,
      color: 'text-purple-500'
    },
    {
      id: 'challenge-champion',
      title: 'Challenge Champion',
      icon: <Medal className="h-5 w-5" />,
      description: 'Completed 5 coding challenges!',
      unlocked: completedChallenges >= 5,
      color: 'text-blue-500'
    },
    {
      id: 'master-builder',
      title: 'Master Bot Builder',
      icon: <Crown className="h-5 w-5" />,
      description: 'Created 5 amazing AI friends!',
      unlocked: totalProjects >= 5,
      color: 'text-orange-500'
    }
  ];

  const motivationalMessages = [
    "You're doing amazing! Keep building! 🌟",
    "Every coder was once a beginner! 💪",
    "Your creativity is unlimited! 🚀",
    "Building the future, one bot at a time! 🤖",
    "You're becoming a coding superstar! ⭐"
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Overview */}
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            Your Coding Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-primary">{totalProjects}</div>
              <div className="text-xs text-muted-foreground">AI Friends Created</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-orange-500">{streakCount}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-green-500">{completedChallenges}</div>
              <div className="text-xs text-muted-foreground">Challenges Done</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-center text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {randomMessage}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800'
                    : 'bg-muted/30 border-muted border-dashed'
                }`}
                whileHover={achievement.unlocked ? { scale: 1.05 } : {}}
                whileTap={achievement.unlocked ? { scale: 0.95 } : {}}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={achievement.unlocked ? achievement.color : 'text-muted-foreground'}>
                    {achievement.icon}
                  </div>
                  <Badge 
                    variant={achievement.unlocked ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {achievement.unlocked ? "Unlocked!" : "Locked"}
                  </Badge>
                </div>
                <h3 className={`text-sm font-semibold mb-1 ${
                  achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {achievement.title}
                </h3>
                <p className={`text-xs ${
                  achievement.unlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'
                }`}>
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-blue-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5"
            >
              <Gift className="h-6 w-6 text-pink-500" />
              <span className="text-sm font-medium">Daily Challenge</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col gap-2 border-2 border-dashed hover:border-secondary/50 hover:bg-secondary/5"
            >
              <Heart className="h-6 w-6 text-red-500" />
              <span className="text-sm font-medium">Share Creation</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidFriendlyFeatures;