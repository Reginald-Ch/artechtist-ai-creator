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
import { TribeWelcome } from './TribeWelcome';
import { ChatbotGuide } from './ChatbotGuide';

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
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

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

  const handleJoinTribe = (tribe: Tribe) => {
    setSelectedTribe(tribe);
    setShowWelcome(true);
  };

  const confirmJoinTribe = async () => {
    if (!user || !selectedTribe) return;

    setJoining(selectedTribe.id);

    try {
      const { error } = await supabase
        .from('tribe_memberships')
        .insert({
          user_id: user.id,
          tribe_id: selectedTribe.id,
          xp_points: 0,
          level: 1,
          badges: []
        });

      if (error) throw error;

      // Update member count
      await supabase
        .from('tribes')
        .update({ member_count: selectedTribe.member_count + 1 })
        .eq('id', selectedTribe.id);

      setShowConfetti(true);
      setShowWelcome(false);
      toast.success(`Welcome to ${selectedTribe.name}! 🎉`);
      
      setTimeout(() => {
        setShowConfetti(false);
        onTribeSelected(selectedTribe);
      }, 3000);
    } catch (error) {
      console.error('Error joining tribe:', error);
      toast.error('Failed to join tribe');
    } finally {
      setJoining(null);
      setSelectedTribe(null);
    }
  };

  return (
    <>
      {showGuide && (
        <ChatbotGuide 
          context="tribe-selection" 
          onDismiss={() => setShowGuide(false)} 
        />
      )}

      {showWelcome && selectedTribe && (
        <TribeWelcome
          tribeName={selectedTribe.name}
          tribeEmoji={selectedTribe.emoji}
          tribeColor={selectedTribe.color}
          onAccept={confirmJoinTribe}
          onDecline={() => {
            setShowWelcome(false);
            setSelectedTribe(null);
          }}
        />
      )}

      <div className="min-h-screen p-4 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="max-w-6xl mx-auto py-8 relative z-10">
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
                  <Card className="h-full border-2 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
                    style={{
                      borderColor: `${tribe.color}40`,
                      boxShadow: `0 0 30px ${tribe.color}20`
                    }}
                  >
                    <CardHeader 
                      className="bg-gradient-to-br text-white rounded-t-lg relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${tribe.color}dd, ${tribe.color}aa)`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-6xl drop-shadow-lg">{tribe.emoji}</span>
                        <Badge variant="secondary" className="bg-white/20 backdrop-blur">
                          <Users className="w-3 h-3 mr-1" />
                          {tribe.member_count}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl mt-4 drop-shadow-md">{tribe.name}</CardTitle>
                      <CardDescription className="text-white/90 drop-shadow">
                        {tribe.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Button
                        onClick={() => handleJoinTribe(tribe)}
                        disabled={joining === tribe.id}
                        className="w-full transition-glow"
                        style={{
                          background: `linear-gradient(135deg, ${tribe.color}, ${tribe.color}dd)`,
                          boxShadow: `0 0 20px ${tribe.color}60`,
                          color: '#fff'
                        }}
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
    </>
  );
}
