import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Trophy, Star, Zap, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface OptimizedEncouragingAIProps {
  completedLessons: number;
  currentPanel: number;
  totalPanels: number;
  onPanelComplete?: () => void;
  streakDays?: number;
  averageScore?: number;
}

const OptimizedEncouragingAI = memo(({ 
  completedLessons, 
  currentPanel, 
  totalPanels, 
  onPanelComplete,
  streakDays = 0,
  averageScore = 0
}: OptimizedEncouragingAIProps) => {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [aiMood, setAiMood] = useState('happy');

  const encouragingMessages = {
    welcome: [
      "Welcome back! Ready to continue your AI journey? 🚀",
      "Hello there! Let's explore amazing AI concepts together! 🤖",
      "Great to see you! Your learning adventure continues! ✨"
    ],
    progress: [
      "Fantastic progress! You're really understanding these concepts! ⭐",
      "Amazing work! Your AI knowledge is expanding beautifully! 🌱",
      "Brilliant! Keep up this wonderful momentum! 🎯",
      "Outstanding! You're becoming quite the AI expert! 🏆"
    ],
    milestone: [
      "Congratulations! Another lesson mastered! 🎉",
      "Superb achievement! You're building incredible knowledge! 🏅",
      "Excellent completion! Ready for the next challenge? 🌟"
    ],
    streak: [
      `Wow! ${streakDays} days of consistent learning! 🔥`,
      `Incredible ${streakDays}-day streak! You're on fire! ⚡`,
      "Your dedication is truly inspiring! Keep it up! 💪"
    ],
    highScore: [
      `Amazing ${averageScore}% average! You're excelling! 🎯`,
      "Your scores are impressive! Natural AI learner! 🌟",
      "Outstanding performance! You've got this mastered! 👑"
    ],
    encouragement: [
      "Every expert was once a beginner. You're doing great! 💪",
      "Learning AI opens infinite possibilities! Keep exploring! 🌌",
      "Your curiosity and persistence will take you far! 🚀"
    ]
  };

  const getMessageType = () => {
    if (currentPanel === 0 && completedLessons === 0) return 'welcome';
    if (streakDays >= 3) return 'streak';
    if (averageScore >= 80) return 'highScore';
    if (completedLessons >= 5) return 'milestone';
    if (currentPanel > totalPanels * 0.5) return 'progress';
    return 'encouragement';
  };

  const getRandomMessage = (type: keyof typeof encouragingMessages) => {
    const messages = encouragingMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getAIIcon = () => {
    switch (aiMood) {
      case 'excited': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'proud': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'celebrating': return <Star className="w-5 h-5 text-purple-500" />;
      case 'motivated': return <Target className="w-5 h-5 text-blue-500" />;
      default: return <Heart className="w-5 h-5 text-red-500" />;
    }
  };

  const updateMoodBasedOnProgress = () => {
    if (streakDays >= 7) return 'celebrating';
    if (averageScore >= 90) return 'proud';
    if (completedLessons >= 3) return 'excited';
    if (currentPanel > 0) return 'motivated';
    return 'happy';
  };

  useEffect(() => {
    if (onPanelComplete && currentPanel > 0) {
      const messageType = getMessageType();
      const mood = updateMoodBasedOnProgress();
      
      setCurrentMessage(getRandomMessage(messageType));
      setAiMood(mood);
      setShowMessage(true);

      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [currentPanel, completedLessons, onPanelComplete, streakDays, averageScore]);

  // Show welcome message for new users
  useEffect(() => {
    if (currentPanel === 0) {
      const timer = setTimeout(() => {
        setCurrentMessage(getRandomMessage('welcome'));
        setAiMood('happy');
        setShowMessage(true);
        
        setTimeout(() => setShowMessage(false), 3500);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-show encouragement every few panels
  useEffect(() => {
    if (currentPanel > 0 && currentPanel % 3 === 0) {
      const timer = setTimeout(() => {
        setCurrentMessage(getRandomMessage('progress'));
        setAiMood('motivated');
        setShowMessage(true);
        
        setTimeout(() => setShowMessage(false), 3000);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentPanel]);

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
});

OptimizedEncouragingAI.displayName = 'OptimizedEncouragingAI';

export { OptimizedEncouragingAI };