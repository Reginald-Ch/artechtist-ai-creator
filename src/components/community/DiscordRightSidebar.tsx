import { useState, useEffect } from 'react';
import { Trophy, Zap, Shield, Star, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DiscordRightSidebarProps {
  userProfile: any;
  membership: any;
}

export function DiscordRightSidebar({ userProfile, membership }: DiscordRightSidebarProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('tribe_memberships')
        .select('*, profiles(first_name, avatar_seed, avatar_color)')
        .order('xp_points', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const currentXP = membership?.xp_points || 1250;
  const currentLevel = membership?.level || 5;
  const xpForNextLevel = currentLevel * 2000;
  const progressPercent = (currentXP / xpForNextLevel) * 100;
  const xpNeeded = xpForNextLevel - currentXP;

  const badges = [
    { id: 'first-message', icon: '✨', name: 'First Message', color: 'from-blue-500 to-cyan-500' },
    { id: 'helper', icon: '🛡️', name: 'Helper', color: 'from-green-500 to-emerald-500' },
    { id: 'quick-learner', icon: '⚡', name: 'Quick Learner', color: 'from-yellow-500 to-amber-500' },
    { id: 'code-ninja', icon: '💻', name: 'Code Ninja', color: 'from-purple-500 to-pink-500' },
  ];

  const interests = ['Python', 'AI', 'Robotics', 'Games'];

  return (
    <div className="w-80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-l border-primary/20 h-screen overflow-hidden flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* User Profile Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 shadow-lg shadow-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span>👩‍🚀</span>
                  My Profile
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-primary/40 shadow-xl shadow-primary/30">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.avatar_seed || user?.id}`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-2xl font-bold">
                      YT
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-secondary rounded-full p-1.5 shadow-lg">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mt-3 text-foreground">
                  {userProfile?.first_name || 'Young Techie'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-gradient-to-r from-primary to-secondary border-0 shadow-lg">
                    Level {currentLevel}
                  </Badge>
                  <Badge variant="outline" className="border-accent text-accent-foreground">
                    AI Explorer
                  </Badge>
                </div>
              </div>

              {/* Level Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Level {currentLevel} Progress</span>
                  <span className="font-bold text-primary">{currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
                </div>
                <Progress value={progressPercent} className="h-2.5 bg-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all rounded-full shadow-lg shadow-primary/50"
                    style={{ width: `${progressPercent}%` }}
                  />
                </Progress>
                <p className="text-xs text-muted-foreground text-center">
                  {xpNeeded.toLocaleString()} XP to Level {currentLevel + 1}! 🚀
                </p>
              </div>

              {/* Badges */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">My Badges</h4>
                <div className="grid grid-cols-2 gap-2">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-2 rounded-lg bg-gradient-to-br ${badge.color} bg-opacity-20 border border-white/20 text-center hover:scale-105 transition-transform cursor-pointer`}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <p className="text-xs font-semibold text-white">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">My Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((interest) => (
                    <Badge 
                      key={interest}
                      variant="secondary"
                      className="bg-accent/20 border-accent/40 hover:bg-accent/30 transition-colors"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Top Innovators of the Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((member, idx) => (
                  <div
                    key={member.id}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg transition-all
                      ${idx === 0 ? 'bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/40' : ''}
                      ${idx === 1 ? 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/40' : ''}
                      ${idx === 2 ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/40' : ''}
                      ${idx > 2 ? 'bg-accent/20 hover:bg-accent/30' : ''}
                    `}
                  >
                    <div className="flex-shrink-0 w-6 text-center font-bold">
                      {idx === 0 && <span className="text-amber-400 text-lg">🥇</span>}
                      {idx === 1 && <span className="text-slate-300 text-lg">🥈</span>}
                      {idx === 2 && <span className="text-orange-400 text-lg">🥉</span>}
                      {idx > 2 && <span className="text-muted-foreground text-sm">#{idx + 1}</span>}
                    </div>
                    
                    <Avatar className="w-8 h-8 border-2 border-primary/30">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.profiles?.avatar_seed}`} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-secondary">
                        {member.profiles?.first_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">
                        {member.profiles?.first_name || 'User'}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">{member.xp_points?.toLocaleString() || 0} XP</span>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      L{member.level || 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Safe Space Banner */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-green-300 mb-1 flex items-center gap-1">
                    Safe Space 💚
                  </h4>
                  <p className="text-xs text-green-100/80">
                    Mentors are online to help! Be kind, creative, and have fun learning together.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
