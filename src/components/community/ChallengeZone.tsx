import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar, Target, Flame, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ChallengeZoneProps {
  tribeId: string;
}

export function ChallengeZone({ tribeId }: ChallengeZoneProps) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadChallenges();
    loadUserProgress();
  }, [tribeId, user]);

  const loadChallenges = async () => {
    const { data } = await supabase
      .from('community_challenges')
      .select('*')
      .or(`tribe_id.eq.${tribeId},tribe_id.is.null`)
      .order('created_at', { ascending: false });

    setChallenges(data || []);
  };

  const loadUserProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', user.id);

    const progressMap = new Map();
    data?.forEach(p => progressMap.set(p.challenge_id, p));
    setUserProgress(progressMap);
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error('Please log in to join challenges');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_challenge_progress')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          current_value: 0,
          completed: false,
        });

      if (error) throw error;

      // Update participant count
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        await supabase
          .from('community_challenges')
          .update({ participants: (challenge.participants || 0) + 1 })
          .eq('id', challengeId);
      }

      toast.success('Challenge joined! 🎉');
      loadChallenges();
      loadUserProgress();
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      if (error.code === '23505') {
        toast.error('You already joined this challenge!');
      } else {
        toast.error('Failed to join challenge');
      }
    }
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return { 
          color: 'from-green-500/20 to-emerald-500/20',
          badge: 'bg-green-500/10 text-green-500 border-green-500/30',
          icon: '🌱'
        };
      case 'intermediate':
        return { 
          color: 'from-yellow-500/20 to-amber-500/20',
          badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
          icon: '⚡'
        };
      case 'advanced':
        return { 
          color: 'from-red-500/20 to-rose-500/20',
          badge: 'bg-red-500/10 text-red-500 border-red-500/30',
          icon: '🔥'
        };
      default:
        return { 
          color: 'from-blue-500/20 to-cyan-500/20',
          badge: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
          icon: '🎯'
        };
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Challenges</h2>
            <p className="text-sm text-muted-foreground">Test your skills and earn rewards</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
          {challenges.map((challenge, index) => {
            const config = getDifficultyConfig(challenge.difficulty);
            const userChallengeProgress = userProgress.get(challenge.id);
            const hasJoined = !!userChallengeProgress;
            const progress = userChallengeProgress ? 
              Math.min(100, (userChallengeProgress.current_value / (challenge.target_value || 100)) * 100) : 
              0;
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className={`
                  relative overflow-hidden rounded-xl p-6 
                  bg-gradient-to-br ${config.color}
                  border border-border/40 hover:border-primary/50
                  transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                `}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 text-6xl opacity-10 transform translate-x-4 -translate-y-2">
                    {config.icon}
                  </div>

                  <div className="relative space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {challenge.description}
                        </p>
                      </div>
                      <Badge className={`${config.badge} border capitalize flex-shrink-0`}>
                        {challenge.difficulty}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                        <Zap className="w-4 h-4" />
                        <span>{challenge.xp_reward} XP</span>
                      </div>
                      {challenge.end_date && (
                        <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      onClick={() => joinChallenge(challenge.id)}
                      disabled={hasJoined}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      {hasJoined ? 'Joined!' : 'Join Challenge'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
