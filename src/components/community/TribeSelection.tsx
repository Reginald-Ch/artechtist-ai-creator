import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import Confetti from 'react-confetti';

interface Tribe {
  id: string;
  name: string;
  tribe_type: string;
  description: string;
  emoji: string;
  color: string;
  member_count: number;
}

interface TribeSelectionProps {
  onTribeSelected: (tribe: Tribe) => void;
}

export function TribeSelection({ onTribeSelected }: TribeSelectionProps) {
  const { user } = useAuth();
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadTribes();
  }, []);

  const loadTribes = async () => {
    const { data, error } = await supabase
      .from('tribes')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading tribes:', error);
      toast.error('Failed to load tribes');
    } else {
      setTribes(data || []);
    }
    setLoading(false);
  };

  const joinTribe = async (tribe: Tribe) => {
    if (!user) return;

    setJoining(tribe.id);

    try {
      const { error } = await supabase
        .from('tribe_memberships')
        .insert({
          user_id: user.id,
          tribe_id: tribe.id,
          xp_points: 0,
          level: 1,
          badges: []
        });

      if (error) throw error;

      // Update member count
      await supabase
        .from('tribes')
        .update({ member_count: tribe.member_count + 1 })
        .eq('id', tribe.id);

      setShowConfetti(true);
      toast.success(`Welcome to ${tribe.name}! 🎉`);
      
      setTimeout(() => {
        setShowConfetti(false);
        onTribeSelected(tribe);
      }, 3000);
    } catch (error) {
      console.error('Error joining tribe:', error);
      toast.error('Failed to join tribe');
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <div className="max-w-6xl mx-auto py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Choose Your Tech Tribe
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Join a community that matches your passion! 🚀
          </p>
          <p className="text-sm text-muted-foreground">
            ✨ All tribes have access to the General Chat for cross-tribe fun!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {tribes.map((tribe, index) => (
              <motion.div
                key={tribe.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-2xl">
                  <CardHeader className={`bg-gradient-to-br ${tribe.color} text-white rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <span className="text-6xl">{tribe.emoji}</span>
                      <Badge variant="secondary" className="bg-white/20 backdrop-blur">
                        <Users className="w-3 h-3 mr-1" />
                        {tribe.member_count}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mt-4">{tribe.name}</CardTitle>
                    <CardDescription className="text-white/90">
                      {tribe.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Button
                      onClick={() => joinTribe(tribe)}
                      disabled={joining === tribe.id}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                    >
                      {joining === tribe.id ? (
                        'Joining...'
                      ) : (
                        <>
                          Join Tribe <Sparkles className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
