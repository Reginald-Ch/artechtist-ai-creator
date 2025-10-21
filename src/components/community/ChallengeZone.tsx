import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Users, Zap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChallengeZoneProps {
  tribeId: string;
}

export function ChallengeZone({ tribeId }: ChallengeZoneProps) {
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    loadChallenges();
  }, [tribeId]);

  const loadChallenges = async () => {
    const { data } = await supabase
      .from('community_challenges')
      .select('*')
      .or(`tribe_id.eq.${tribeId},tribe_id.is.null`)
      .order('created_at', { ascending: false });

    setChallenges(data || []);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {challenges.map((challenge, index) => (
        <motion.div
          key={challenge.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    {challenge.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {challenge.description}
                  </CardDescription>
                </div>
                <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                  {challenge.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>{challenge.xp_reward} XP Reward</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participants} participants</span>
                  </div>
                </div>

                {challenge.end_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Ends {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}</span>
                  </div>
                )}

                <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                  Join Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
