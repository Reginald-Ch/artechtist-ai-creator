import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, PartyPopper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CompletionAnimationProps {
  isVisible: boolean;
  title: string;
  message: string;
  points?: number;
  onClose: () => void;
  variant?: 'success' | 'achievement' | 'milestone';
}

export const CompletionAnimation: React.FC<CompletionAnimationProps> = ({
  isVisible,
  title,
  message,
  points,
  onClose,
  variant = 'success'
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getIcon = () => {
    switch (variant) {
      case 'achievement':
        return Trophy;
      case 'milestone':
        return Star;
      default:
        return Sparkles;
    }
  };

  const Icon = getIcon();

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{
                    y: window.innerHeight + 100,
                    rotate: Math.random() * 720,
                    opacity: 0
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    ease: "easeIn",
                    delay: Math.random() * 0.5
                  }}
                  className="absolute"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][
                        Math.floor(Math.random() * 5)
                      ]
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Main Card */}
          <div className="fixed inset-0 flex items-center justify-center z-[55] p-4">
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.6
              }}
            >
              <Card className="max-w-md w-full border-2 border-primary/50 shadow-2xl overflow-hidden">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-pulse" />
                
                <CardContent className="relative p-8 text-center space-y-6">
                  {/* Animated Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="mx-auto"
                  >
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                        <Icon className="h-12 w-12 text-white" />
                      </div>
                      
                      {/* Pulsing Ring */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full border-4 border-primary"
                      />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {title}
                    </h2>
                  </motion.div>

                  {/* Message */}
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-muted-foreground"
                  >
                    {message}
                  </motion.p>

                  {/* Points */}
                  {points && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.5,
                        type: "spring",
                        stiffness: 300,
                        damping: 15
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full border-2 border-primary/30"
                    >
                      <Star className="h-5 w-5 text-primary fill-primary" />
                      <span className="text-2xl font-bold text-primary">
                        +{points} Points
                      </span>
                    </motion.div>
                  )}

                  {/* Close Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all"
                      size="lg"
                    >
                      Continue Learning 🚀
                    </Button>
                  </motion.div>

                  {/* Floating Stars */}
                  <div className="absolute top-4 left-4">
                    <motion.div
                      animate={{
                        y: [-5, 5, -5],
                        rotate: [0, 10, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-6 w-6 text-primary/60" />
                    </motion.div>
                  </div>

                  <div className="absolute top-4 right-4">
                    <motion.div
                      animate={{
                        y: [5, -5, 5],
                        rotate: [0, -10, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    >
                      <PartyPopper className="h-6 w-6 text-primary/60" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};