import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Crown, 
  Medal, 
  Target, 
  Flame, 
  Users, 
  Share2, 
  Gift,
  Gamepad2,
  Award,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'streak' | 'score' | 'completion' | 'exploration' | 'social';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirements: {
    type: string;
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'limited';
  progress: number;
  target: number;
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  expiresAt?: Date;
  completed: boolean;
}

interface PlayerLevel {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
}

interface GamificationData {
  playerLevel: PlayerLevel;
  totalXP: number;
  achievements: Achievement[];
  challenges: Challenge[];
  streakDays: number;
  lessonsCompleted: number;
  perfectScores: number;
  friendsCount: number;
  leaderboardRank: number;
}

interface GamificationSystemProps {
  data: GamificationData;
  onShareProgress: () => void;
  onStartChallenge: (challengeId: string) => void;
  onClaimReward: (type: 'achievement' | 'challenge', id: string) => void;
}

export const GamificationSystem: React.FC<GamificationSystemProps> = ({
  data,
  onShareProgress,
  onStartChallenge,
  onClaimReward
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);

  // Animate new achievements
  useEffect(() => {
    const recentUnlocks = data.achievements
      .filter(a => a.unlocked && a.unlockedAt && 
        Date.now() - new Date(a.unlockedAt).getTime() < 5000)
      .map(a => a.id);
    
    if (recentUnlocks.length > 0) {
      setNewUnlocks(recentUnlocks);
      const timer = setTimeout(() => setNewUnlocks([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [data.achievements]);

  const getLevelColor = (level: number) => {
    if (level < 10) return 'from-green-400 to-green-600';
    if (level < 25) return 'from-blue-400 to-blue-600';
    if (level < 50) return 'from-purple-400 to-purple-600';
    return 'from-yellow-400 to-yellow-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Target className="h-4 w-4" />;
      case 'weekly': return <Flame className="h-4 w-4" />;
      case 'limited': return <Crown className="h-4 w-4" />;
      default: return <Gamepad2 className="h-4 w-4" />;
    }
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* New Achievement Notifications */}
      <AnimatePresence>
        {newUnlocks.map(unlockId => {
          const achievement = data.achievements.find(a => a.id === unlockId);
          if (!achievement) return null;
          
          return (
            <motion.div
              key={unlockId}
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              <Card className="comic-card border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white">
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="font-bold text-yellow-800">Achievement Unlocked!</div>
                      <div className="text-sm text-yellow-700">{achievement.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Player Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="comic-card overflow-hidden">
          <div className={`bg-gradient-to-r ${getLevelColor(data.playerLevel.level)} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="p-3 bg-white/20 rounded-full"
                >
                  <Crown className="h-8 w-8" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">Level {data.playerLevel.level}</h2>
                  <p className="opacity-90">{data.playerLevel.title}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{data.totalXP} XP</div>
                <div className="text-sm opacity-90">Total Experience</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>{data.playerLevel.xp} XP</span>
                <span>{data.playerLevel.xpToNext} XP to next level</span>
              </div>
              <Progress 
                value={(data.playerLevel.xp / data.playerLevel.xpToNext) * 100} 
                className="h-3 bg-white/20"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Streak', value: `${data.streakDays} days`, color: 'from-red-400 to-red-600' },
          { icon: Trophy, label: 'Completed', value: data.lessonsCompleted, color: 'from-blue-400 to-blue-600' },
          { icon: Star, label: 'Perfect Scores', value: data.perfectScores, color: 'from-yellow-400 to-yellow-600' },
          { icon: Users, label: 'Rank', value: `#${data.leaderboardRank}`, color: 'from-purple-400 to-purple-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="comic-card text-center">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-full bg-gradient-to-r ${stat.color} text-white mb-2`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Trophy className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Medal className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="social">
            <Users className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Achievements */}
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {data.achievements
                  .filter(a => a.unlocked)
                  .slice(-3)
                  .map(achievement => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className={`p-2 rounded-full bg-gradient-to-r ${getDifficultyColor(achievement.difficulty)} text-white`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                      <Badge variant="outline">+{achievement.xpReward} XP</Badge>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {data.challenges
                  .filter(c => !c.completed)
                  .slice(0, 3)
                  .map(challenge => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        {getChallengeIcon(challenge.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{challenge.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">{challenge.description}</div>
                        <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {challenge.progress}/{challenge.target} completed
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">+{challenge.reward.xp} XP</Badge>
                        {challenge.expiresAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimeRemaining(challenge.expiresAt)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievement Categories */}
          {['streak', 'score', 'completion', 'exploration', 'social'].map(category => {
            const categoryAchievements = data.achievements.filter(a => a.category === category);
            const unlockedCount = categoryAchievements.filter(a => a.unlocked).length;

            return (
              <Card key={category} className="comic-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{category} Achievements</CardTitle>
                    <Badge variant="outline">
                      {unlockedCount}/{categoryAchievements.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {categoryAchievements.map(achievement => (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border transition-all ${
                          achievement.unlocked 
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 dark:from-green-950/20 dark:to-green-900/20 dark:border-green-800' 
                            : 'bg-muted/30 border-muted'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            achievement.unlocked 
                              ? `bg-gradient-to-r ${getDifficultyColor(achievement.difficulty)} text-white`
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${!achievement.unlocked && 'text-muted-foreground'}`}>
                              {achievement.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {achievement.description}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant="outline" 
                                className={achievement.unlocked ? 'border-green-300 text-green-700' : ''}
                              >
                                {achievement.difficulty}
                              </Badge>
                              <Badge variant="outline">+{achievement.xpReward} XP</Badge>
                            </div>
                          </div>
                          {achievement.unlocked && (
                            <div className="text-green-600">
                              <Star className="h-5 w-5 fill-current" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          {/* Challenge Types */}
          {['daily', 'weekly', 'limited'].map(type => {
            const typeChallenges = data.challenges.filter(c => c.type === type);

            return (
              <Card key={type} className="comic-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {getChallengeIcon(type)}
                    {type} Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {typeChallenges.map(challenge => (
                      <motion.div
                        key={challenge.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border ${
                          challenge.completed 
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 dark:from-green-950/20 dark:to-green-900/20 dark:border-green-800'
                            : 'bg-card border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{challenge.title}</h4>
                              {challenge.completed && (
                                <Badge className="bg-green-100 text-green-800">Complete</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {challenge.description}
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{challenge.progress}/{challenge.target}</span>
                              </div>
                              <Progress 
                                value={(challenge.progress / challenge.target) * 100} 
                                className="h-2"
                              />
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="flex flex-col gap-2">
                              <Badge variant="outline">+{challenge.reward.xp} XP</Badge>
                              {challenge.reward.badge && (
                                <Badge variant="outline" className="text-xs">
                                  +{challenge.reward.badge}
                                </Badge>
                              )}
                              {challenge.expiresAt && !challenge.completed && (
                                <div className="text-xs text-muted-foreground">
                                  {formatTimeRemaining(challenge.expiresAt)} left
                                </div>
                              )}
                              {!challenge.completed && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onStartChallenge(challenge.id)}
                                >
                                  Continue
                                </Button>
                              )}
                              {challenge.completed && (
                                <Button
                                  size="sm"
                                  onClick={() => onClaimReward('challenge', challenge.id)}
                                >
                                  <Gift className="h-4 w-4 mr-1" />
                                  Claim
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          {/* Leaderboard */}
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'You', xp: data.totalXP, isPlayer: true },
                  { rank: 2, name: 'Sarah M.', xp: data.totalXP - 150, isPlayer: false },
                  { rank: 3, name: 'Alex K.', xp: data.totalXP - 300, isPlayer: false },
                  { rank: 4, name: 'Jordan L.', xp: data.totalXP - 450, isPlayer: false },
                  { rank: 5, name: 'Casey R.', xp: data.totalXP - 600, isPlayer: false }
                ].map(entry => (
                  <motion.div
                    key={entry.rank}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      entry.isPlayer 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 dark:from-blue-950/20 dark:to-blue-900/20 dark:border-blue-800'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1 ? 'bg-yellow-500 text-white' :
                      entry.rank === 2 ? 'bg-gray-500 text-white' :
                      entry.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${entry.isPlayer ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                        {entry.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{entry.xp} XP</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Actions */}
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button onClick={onShareProgress} className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Achievement
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Invite Friends
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationSystem;