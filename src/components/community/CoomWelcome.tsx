import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface CoomWelcomeProps {
  onComplete: () => void;
}

export function CoomWelcome({ onComplete }: CoomWelcomeProps) {
  const { speak, isPlaying } = useSpeechSynthesis();
  const [hasSpoken, setHasSpoken] = useState(false);

  const welcomeMessage = "Welcome to Me AI! Let's build, explore, and create together!";

  useEffect(() => {
    if (!hasSpoken) {
      // Auto-play welcome message
      setTimeout(() => {
        speak(welcomeMessage);
        setHasSpoken(true);
      }, 1000);
    }
  }, []);

  const handleSpeak = () => {
    speak(welcomeMessage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-secondary to-accent overflow-hidden relative">
      {/* Animated background particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 bg-background/95 backdrop-blur-lg border-2 border-primary/20 shadow-2xl">
          {/* Coom Avatar */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl shadow-lg">
                🤖
              </div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-accent" />
              </motion.div>
            </div>
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Hey there, explorer! 🚀
            </h1>
            
            <p className="text-xl text-muted-foreground">
              I'm <span className="font-bold text-primary">Coom</span>, your AI buddy!
            </p>

            <motion.div
              className="p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border-2 border-primary/20 relative"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-lg leading-relaxed">
                "Welcome to <span className="font-bold text-primary">Me AI</span>! Let's{' '}
                <span className="font-bold text-secondary">build</span>,{' '}
                <span className="font-bold text-accent">explore</span>, and{' '}
                <span className="font-bold text-primary">create</span> together!"
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary hover:bg-primary/90"
                disabled={isPlaying}
              >
                <Volume2 className={`w-5 h-5 text-white ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
            </motion.div>

            <motion.div
              className="pt-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Button
                size="lg"
                onClick={onComplete}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-xl transition-all duration-300"
              >
                Let's Go! <Rocket className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-accent rounded-full"
              initial={{ x: Math.random() * 300, y: Math.random() * 300 }}
              animate={{
                x: Math.random() * 300,
                y: Math.random() * 300,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </Card>
      </motion.div>
    </div>
  );
}
