import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Crown, Zap, Star, Filter, TrendingUp, Hash } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CelebrationModal } from './CelebrationModal';

interface LeaderboardProps {
  tribeId: string;
}

export function Leaderboard({ tribeId }: LeaderboardProps) {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'tribe' | 'global'>('tribe');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [tribeId, filter]);

  const loadLeaderboard = async () => {
    let query = supabase
      .from('tribe_memberships')
      .select('*, profiles(first_name), tribes(name, emoji)');

    if (filter === 'tribe') {
      query = query.eq('tribe_id', tribeId);
    }

    const { data } = await query
      .order('xp_points', { ascending: false })
      .limit(10);

    setTopUsers(data || []);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-white" />;
      case 1:
        return <Medal className="w-6 h-6 text-white" />;
      case 2:
        return <Award className="w-6 h-6 text-white" />;
      default:
        return null;
    }
  };

  const getPodiumColor = (index: number) => {
    if (index === 0) return 'from-amber-500/20 to-yellow-500/20';
    if (index === 1) return 'from-slate-400/20 to-slate-300/20';
    if (index === 2) return 'from-orange-600/20 to-orange-500/20';
    return '';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        type="top_10"
        title="Top 10!"
        message="You're among the best innovators! Keep crushing it! 🔥"
        rank={5}
      />

      {/* Header */}
      <div className="p-6 border-b border-border/40 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Leaderboard
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Top innovators across tribes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={filter === 'tribe' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('tribe')}
              className="gap-2"
            >
              <Hash className="w-4 h-4" />
              My Tribe
            </Button>
            <Button
              variant={filter === 'global' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('global')}
              className="gap-2"
            >
              <Trophy className="w-4 h-4" />
              Global
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-3">
          {topUsers.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                group relative overflow-hidden rounded-xl p-4 
                ${index < 3 
                  ? `bg-gradient-to-r ${getPodiumColor(index)} border-2 ${
                      index === 0 ? 'border-amber-500/50' : 
                      index === 1 ? 'border-slate-400/50' : 
                      'border-orange-600/50'
                    }` 
                  : 'bg-card hover:bg-accent/50 border border-border/40'
                }
                transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
              `}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {index < 3 ? (
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${index === 0 ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-300' :
                        'bg-gradient-to-br from-orange-600 to-orange-500'}
                    `}>
                      {getRankIcon(index)}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    </div>
                  )}
                </div>

                {/* Avatar & Info */}
                <Avatar className="w-14 h-14 border-2 border-background">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.profiles?.first_name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground truncate">
                      {user.profiles?.first_name || 'Anonymous'}
                    </h3>
                    {index === 0 && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                    {filter === 'global' && user.tribes && (
                      <Badge variant="secondary" className="text-xs">
                        {user.tribes.emoji} {user.tribes.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Level {user.level || 1}
                    </span>
                    {user.badges && user.badges.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {user.badges.length} {user.badges.length === 1 ? 'Badge' : 'Badges'}
                      </Badge>
                    )}
                  </div>
                  {index < 3 && (
                    <Progress 
                      value={((user.xp_points || 0) % 1000) / 10} 
                      className="mt-2 h-1.5"
                    />
                  )}
                </div>

                {/* XP Points */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1 text-xl font-bold">
                    <Zap className={`w-5 h-5 ${index < 3 ? 'text-amber-500' : 'text-primary'}`} />
                    <span className={index < 3 ? 'text-amber-500' : 'text-primary'}>
                      {user.xp_points || 0}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
