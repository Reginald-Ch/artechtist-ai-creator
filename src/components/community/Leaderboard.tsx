import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Crown, Zap, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface LeaderboardProps {
  tribeId: string;
}

export function Leaderboard({ tribeId }: LeaderboardProps) {
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [tribeId]);

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from('tribe_memberships')
      .select('*, profiles(first_name)')
      .eq('tribe_id', tribeId)
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
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
            <p className="text-sm text-muted-foreground">Top tribe innovators</p>
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
