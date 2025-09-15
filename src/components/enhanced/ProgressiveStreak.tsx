import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Trophy, Star, Target, Calendar, Award, Share2, Crown, Medal, Zap, BookOpen, Brain } from 'lucide-react';
import { useProgressiveStreak, Achievement } from '@/hooks/useProgressiveStreak';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressiveStreakProps {
  onViewAchievements?: () => void;
}

export const ProgressiveStreak = ({ onViewAchievements }: ProgressiveStreakProps) => {
  const { 
    streakData, 
    getStreakMessage, 
    getMotivationalMessage,
    getWeeklyProgress, 
    shareProgress,
    lessonsCompleted,
    categoriesExplored,
    perfectScores,
    highScores
  } = useProgressiveStreak();
  
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  
  const weeklyProgress = getWeeklyProgress();
  const weeklyPercentage = (weeklyProgress / streakData.weeklyGoal) * 100;
  
  const unlockedAchievements = streakData.achievements.filter(a => a.unlocked);
  const recentAchievements = unlockedAchievements
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 3);

  const getStreakEmoji = () => {
    if (streakData.currentStreak >= 100) return '🏅';
    if (streakData.currentStreak >= 30) return '👑';
    if (streakData.currentStreak >= 14) return '⚡';
    if (streakData.currentStreak >= 7) return '🔥';
    if (streakData.currentStreak >= 3) return '💪';
    return '🌱';
  };

  const getAchievementsByCategory = () => {
    const categories = {
      streak: streakData.achievements.filter(a => a.type === 'streak'),
      score: streakData.achievements.filter(a => a.type === 'score'),
      completion: streakData.achievements.filter(a => a.type === 'completion'),
      exploration: streakData.achievements.filter(a => a.type === 'exploration')
    };
    return categories;
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Main Streak Card */}
      <Card className="comic-card overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950/20 dark:via-yellow-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <motion.div 
                className="relative"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                <span className="text-3xl filter drop-shadow-md">{getStreakEmoji()}</span>
                {streakData.currentStreak > 0 && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div>
                <motion.span 
                  className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold text-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Learning Streak
                </motion.span>
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Keep the momentum going!
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-3 py-1 text-sm shadow-lg">
                  <Flame className="w-3 h-3 mr-1" />
                  {streakData.currentStreak} days
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareProgress}
                  className="h-9 w-9 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full transition-all duration-300"
                  title="Share Progress"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div 
            className="text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              {streakData.currentStreak}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {getMotivationalMessage()}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <motion.div 
              className="p-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="text-xl font-semibold text-purple-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {streakData.longestStreak}
              </motion.div>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </motion.div>
            <motion.div 
              className="p-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="text-xl font-semibold text-blue-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {streakData.totalActiveDays}
              </motion.div>
              <p className="text-xs text-muted-foreground">Total Days</p>
            </motion.div>
            <motion.div 
              className="p-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="text-xl font-semibold text-green-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                {lessonsCompleted.length}
              </motion.div>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </motion.div>
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

      {/* Enhanced Achievements Section */}
      <Card className="comic-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Achievements
              <Badge variant="outline" className="ml-1">
                {unlockedAchievements.length}/{streakData.achievements.length}
              </Badge>
            </CardTitle>
            <Dialog open={showAllAchievements} onOpenChange={setShowAllAchievements}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Achievement Gallery
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="streak">Streaks</TabsTrigger>
                    <TabsTrigger value="score">Scores</TabsTrigger>
                    <TabsTrigger value="completion">Progress</TabsTrigger>
                    <TabsTrigger value="exploration">Explore</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(getAchievementsByCategory()).map(([category, achievements]) => (
                    <TabsContent key={category} value={category} className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {achievements.map((achievement) => (
                          <motion.div
                            key={achievement.id}
                            className={`p-3 rounded-lg border transition-all ${
                              achievement.unlocked 
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950/20 dark:to-orange-950/20 dark:border-yellow-800' 
                                : 'bg-muted/30 border-muted opacity-60'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`text-2xl ${!achievement.unlocked && 'grayscale'}`}>
                                {achievement.icon}
                              </span>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{achievement.title}</h4>
                                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                {achievement.unlocked && achievement.unlockedAt && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              {achievement.unlocked && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                  
                  <TabsContent value="all" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {streakData.achievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          className={`p-3 rounded-lg border transition-all ${
                            achievement.unlocked 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950/20 dark:to-orange-950/20 dark:border-yellow-800' 
                              : 'bg-muted/30 border-muted opacity-60'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl ${!achievement.unlocked && 'grayscale'}`}>
                              {achievement.icon}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{achievement.title}</h4>
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
                              {achievement.unlocked && achievement.unlockedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {achievement.unlocked && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <AnimatePresence>
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-xl animate-bounce">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                </div>
                <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {recentAchievements.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Complete lessons to unlock achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="comic-card p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{categoriesExplored.length}</div>
            <p className="text-xs text-muted-foreground">Categories Explored</p>
          </div>
        </Card>
        <Card className="comic-card p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{perfectScores}</div>
            <p className="text-xs text-muted-foreground">Perfect Scores</p>
          </div>
        </Card>
      </div>
    </div>
  );
};