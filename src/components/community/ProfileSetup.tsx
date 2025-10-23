import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, User, Palette, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupProps {
  onComplete: () => void;
}

const avatarStyles = [
  { seed: 'felix', color: 'from-blue-500 to-cyan-500' },
  { seed: 'aneka', color: 'from-purple-500 to-pink-500' },
  { seed: 'luna', color: 'from-green-500 to-emerald-500' },
  { seed: 'max', color: 'from-orange-500 to-red-500' },
  { seed: 'riley', color: 'from-yellow-500 to-amber-500' },
  { seed: 'charlie', color: 'from-indigo-500 to-blue-500' },
];

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarStyles[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          first_name: username,
          bio: bio,
          avatar_seed: selectedAvatar.seed,
          avatar_color: selectedAvatar.color,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Profile created! 🎉');
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 bg-background/95 backdrop-blur-lg border-2 border-primary/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Create Your Profile
              </h1>
              <Sparkles className="w-6 h-6 text-accent" />
            </motion.div>
            <p className="text-muted-foreground">
              Choose your identity in the tech community!
            </p>
          </div>

          {/* Username Input */}
          <div className="mb-6">
            <Label htmlFor="username" className="flex items-center gap-2 text-lg mb-3">
              <User className="w-5 h-5 text-primary" />
              Choose Your Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a cool username..."
              className="text-lg p-6 border-2 border-primary/20 focus:border-primary transition-all"
              maxLength={20}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {username.length}/20 characters
            </p>
          </div>

          {/* Bio Input */}
          <div className="mb-8">
            <Label htmlFor="bio" className="flex items-center gap-2 text-lg mb-3">
              <Sparkles className="w-5 h-5 text-secondary" />
              Tell Us About Yourself
            </Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I love building amazing things..."
              className="text-lg p-6 border-2 border-primary/20 focus:border-primary transition-all"
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {bio.length}/100 characters (optional)
            </p>
          </div>

          {/* Avatar Selection */}
          <div className="mb-8">
            <Label className="flex items-center gap-2 text-lg mb-4">
              <Palette className="w-5 h-5 text-primary" />
              Pick Your Avatar Style
            </Label>
            <div className="grid grid-cols-3 gap-4">
              {avatarStyles.map((style, index) => (
                <motion.button
                  key={style.seed}
                  onClick={() => setSelectedAvatar(style)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border-4 transition-all ${
                    selectedAvatar.seed === style.seed
                      ? 'border-primary shadow-lg shadow-primary/50'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${style.color} p-1`}>
                    <Avatar className="w-full h-full border-4 border-background">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${style.seed}`} />
                      <AvatarFallback>AV</AvatarFallback>
                    </Avatar>
                  </div>
                  {selectedAvatar.seed === style.seed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {username && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20"
            >
              <p className="text-sm text-muted-foreground mb-3 text-center">Preview</p>
              <div className="flex items-center gap-4 justify-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedAvatar.color} p-1`}>
                  <Avatar className="w-full h-full border-4 border-background">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatar.seed}`} />
                    <AvatarFallback>AV</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-xl font-bold">{username}</p>
                  <p className="text-sm text-muted-foreground">Level 1 Explorer</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleSave}
            disabled={!username.trim() || username.length < 3 || saving}
            size="lg"
            className="w-full text-lg py-6 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-xl transition-all"
          >
            {saving ? 'Creating Profile...' : 'Continue to Tribe Selection'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
