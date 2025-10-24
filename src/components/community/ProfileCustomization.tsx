import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileCustomizationProps {
  membership: any;
}

export function ProfileCustomization({ membership }: ProfileCustomizationProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadBadges();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    setUserProfile(data);
  };

  const loadBadges = async () => {
    if (!user) return;
    
    // Get real badges from user_achievements
    const { data } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id);
    
    setBadges(data || []);
  };

  const earnedBadges = membership.badges || badges;
  const displayBadges = earnedBadges.length > 0 ? earnedBadges : [
    { id: 'welcome', achievement_id: 'welcome', title: 'Welcome', icon: '👋', earned: true },
    { id: 'explorer', achievement_id: 'explorer', title: 'Explorer', icon: '🗺️', earned: false },
    { id: 'builder', achievement_id: 'builder', title: 'Builder', icon: '🔨', earned: false },
    { id: 'master', achievement_id: 'master', title: 'Master', icon: '🏆', earned: false },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Bio Section */}
      {userProfile?.bio && (
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-foreground">{userProfile.bio}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-green-400/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                  <div className="text-2xl font-bold">{membership.xp_points}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-400/10 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                  <div className="text-2xl font-bold">{membership.level}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-400/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Badges Earned</div>
                  <div className="text-2xl font-bold">{earnedBadges.length}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Badge Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            {displayBadges.map((badge: any) => {
              const isEarned = badge.earned !== false;
              return (
                <div
                  key={badge.id || badge.achievement_id}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    isEarned
                      ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 shadow-lg'
                      : 'bg-muted/50 border-muted opacity-50 grayscale'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon || '🏅'}</div>
                  <div className="text-sm font-semibold">{badge.title || badge.name}</div>
                  {isEarned && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Unlocked!
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
