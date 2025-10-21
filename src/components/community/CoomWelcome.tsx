import { motion } from 'framer-motion';
import { Sparkles, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CoomWelcomeProps {
  onComplete: () => void;
}

export function CoomWelcome({ onComplete }: CoomWelcomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-secondary to-accent overflow-hidden">
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
              className="p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border-2 border-primary/20"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-lg leading-relaxed">
                Ready to join your <span className="font-bold text-primary">tech tribe</span> and unlock{' '}
                <span className="font-bold text-secondary">epic challenges</span>,{' '}
                <span className="font-bold text-accent">cool chats</span>, and{' '}
                <span className="font-bold text-primary">awesome badges</span>?
              </p>
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
