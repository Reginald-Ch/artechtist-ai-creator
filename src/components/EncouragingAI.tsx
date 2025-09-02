import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Trophy, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EncouragingAIProps {
  completedLessons: number;
  currentPanel: number;
  totalPanels: number;
  onPanelComplete?: () => void;
}

export const EncouragingAI = ({ completedLessons, currentPanel, totalPanels, onPanelComplete }: EncouragingAIProps) => {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [aiMood, setAiMood] = useState('happy');

  const encouragingMessages = {
    start: [
      "Ready to explore the amazing world of AI? Let's go! 🚀",
      "Your AI learning journey begins now! I'm here to help! 🤖",
      "Every expert was once a beginner. You've got this! 💪"
    ],
    progress: [
      "You're doing fantastic! Keep up the great work! ⭐",
      "Amazing progress! Your AI knowledge is growing! 🌱",
      "Brilliant! You're mastering these concepts beautifully! ✨",
      "Wow! You're becoming an AI expert step by step! 🎯",
      "Incredible! Your dedication is really paying off! 🏆"
    ],
    milestone: [
      "Outstanding! You've completed another lesson! 🎉",
      "Congratulations! You're building amazing AI knowledge! 🏅",
      "Superb! Another milestone reached in your AI journey! 🌟",
      "Excellent work! You're unlocking the secrets of AI! 🔓"
    ],
    mastery: [
      "Phenomenal! You're becoming an AI master! 👑",
      "Incredible achievement! Your AI expertise is impressive! 🚀",
      "Magnificent! You've conquered multiple AI concepts! ⚡",
      "Extraordinary! You're ready for advanced AI challenges! 🎓"
    ]
  };

  const getMessageType = () => {
    if (currentPanel === 0) return 'start';
    if (completedLessons >= 4) return 'mastery';
    if (currentPanel === totalPanels - 1) return 'milestone';
    return 'progress';
  };

  const getRandomMessage = (type: keyof typeof encouragingMessages) => {
    const messages = encouragingMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getAIIcon = () => {
    switch (aiMood) {
      case 'excited': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'proud': return <Trophy className="w-5 h-5 text-gold-500" />;
      case 'celebrating': return <Star className="w-5 h-5 text-purple-500" />;
      default: return <Heart className="w-5 h-5 text-red-500" />;
    }
  };

  useEffect(() => {
    if (onPanelComplete) {
      const messageType = getMessageType();
      setCurrentMessage(getRandomMessage(messageType));
      setAiMood(messageType === 'mastery' ? 'celebrating' : messageType === 'milestone' ? 'proud' : 'excited');
      setShowMessage(true);

      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [currentPanel, completedLessons, onPanelComplete]);

  // Show initial welcome message
  useEffect(() => {
    if (currentPanel === 0 && completedLessons === 0) {
      setTimeout(() => {
        setCurrentMessage(getRandomMessage('start'));
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }, 1000);
    }
  }, []);

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/10 backdrop-blur-md border-primary/20 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="flex-shrink-0 p-2 rounded-full bg-primary/20"
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {getAIIcon()}
                  </motion.div>
                </motion.div>
                <div className="flex-1">
                  <motion.p 
                    className="text-sm font-medium text-foreground leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentMessage}
                  </motion.p>
                  <motion.div
                    className="flex items-center gap-1 mt-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">AI Learning Companion</span>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EncouragingAI;