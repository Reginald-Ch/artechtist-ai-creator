import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Zap } from 'lucide-react';

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
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Top Tribe Members
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {topUsers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                index < 3 ? 'bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20' : 'bg-card'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl font-bold text-muted-foreground w-8">
                  {index < 3 ? getRankIcon(index) : `#${index + 1}`}
                </div>
                
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                    {member.profiles?.first_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="font-semibold">{member.profiles?.first_name || 'Anonymous'}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    Level {member.level} • {member.badges?.length || 0} badges
                  </div>
                </div>
              </div>

              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <Zap className="w-3 h-3 text-primary" />
                {member.xp_points} XP
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
