import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Sparkles, 
  Zap, 
  Heart, 
  Star,
  Lightbulb,
  Rocket,
  Brain,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface AIMascotProps {
  onStartTutorial?: () => void;
  onClose?: () => void;
  className?: string;
  mood?: 'excited' | 'helpful' | 'encouraging' | 'celebrating';
}

const mascotPhrases = {
  greetings: [
    "Hey there, future bot builder! 🚀",
    "Ready to create something amazing? ✨",
    "Let's build the next generation of AI together! 🤖",
    "Welcome to the wonderful world of conversational AI! 🎯"
  ],
  encouraging: [
    "You're doing great! Keep building! 💪",
    "Every expert was once a beginner! 🌟",
    "Your bot is going to be incredible! 🎉",
    "AI magic happens one intent at a time! ✨",
    "The future of conversation is in your hands! 🚀"
  ],
  helpful: [
    "Need help? I'm here to guide you! 🤝",
    "Stuck? Let's break it down step by step! 🔧",
    "Pro tip: Start simple, then add complexity! 💡",
    "Remember: Great bots understand context! 🧠"
  ],
  celebrating: [
    "Woohoo! You're crushing it! 🎊",
    "Your bot building skills are leveling up! ⬆️",
    "That's the spirit of innovation! 🔥",
    "You're officially a bot builder now! 🏆"
  ]
};

const moodIcons = {
  excited: <Rocket className="h-5 w-5" />,
  helpful: <Lightbulb className="h-5 w-5" />,
  encouraging: <Heart className="h-5 w-5" />,
  celebrating: <Star className="h-5 w-5" />
};

const moodColors = {
  excited: 'from-orange-500 to-red-500',
  helpful: 'from-blue-500 to-indigo-500',
  encouraging: 'from-green-500 to-emerald-500',
  celebrating: 'from-purple-500 to-pink-500'
};

export const AIMascot = ({ onStartTutorial, onClose, className, mood = 'helpful' }: AIMascotProps) => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [currentMood, setCurrentMood] = useState<keyof typeof mascotPhrases>('helpful');
  const { speak, isPlaying } = useSpeechSynthesis();

  // Show mascot after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Cycle through phrases
  useEffect(() => {
    if (!isVisible) return;

    const showPhrase = () => {
      const phrases = mascotPhrases[currentMood];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setCurrentPhrase(randomPhrase);
    };

    // Show initial phrase
    showPhrase();

    // Rotate phrases every 8 seconds
    const interval = setInterval(showPhrase, 8000);
    return () => clearInterval(interval);
  }, [currentMood, isVisible]);

  // Change mood occasionally
  useEffect(() => {
    const moodTimer = setInterval(() => {
      const moods = Object.keys(mascotPhrases) as Array<keyof typeof mascotPhrases>;
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setCurrentMood(randomMood);
    }, 15000);

    return () => clearInterval(moodTimer);
  }, []);

  const handleSpeak = () => {
    if (currentPhrase) {
      // Remove emojis for speech
      const cleanPhrase = currentPhrase.replace(/[^\w\s!?.,]/g, '');
      speak(cleanPhrase);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
      transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
      className={cn("fixed bottom-6 right-6 z-50", className)}
    >
      <Card className="w-80 shadow-2xl border-0 overflow-hidden bg-background/95 backdrop-blur-md">
        <CardContent className="p-0">
          {/* Mascot Header */}
          <div className={cn(
            "relative p-4 bg-gradient-to-r text-white",
            moodColors[currentMood]
          )}>
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
            
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={cn("absolute top-2", onClose ? "right-8" : "right-2")}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>

            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotateY: [0, 360],
                  scale: isPlaying ? [1, 1.2, 1] : 1
                }}
                transition={{ 
                  rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 0.5, repeat: isPlaying ? Infinity : 0 }
                }}
                className="bg-white/20 rounded-full p-3"
              >
                <Bot className="h-8 w-8" />
              </motion.div>
              
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-white/80 text-sm">Your Bot Building Guide</p>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="p-4 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhrase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="min-h-[60px] flex items-center"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className={cn(
                      "p-2 rounded-full bg-gradient-to-r shrink-0",
                      moodColors[currentMood]
                    )}
                  >
                    {moodIcons[currentMood]}
                  </motion.div>
                  <p className="text-sm leading-relaxed text-foreground">{currentPhrase}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {onStartTutorial && (
                <Button 
                  onClick={onStartTutorial}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Start Tutorial
                </Button>
              )}
              
              <Button 
                onClick={handleSpeak}
                variant="outline"
                size="sm"
                disabled={isPlaying}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {isPlaying ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Zap className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Brain className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};