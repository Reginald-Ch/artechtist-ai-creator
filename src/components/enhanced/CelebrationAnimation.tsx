import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Award, Target, Flame } from 'lucide-react';
import Confetti from 'react-confetti';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

interface CelebrationAnimationProps {
  type: 'lesson' | 'streak' | 'achievement' | 'challenge';
  title: string;
  message: string;
  onComplete?: () => void;
}

export const CelebrationAnimation = ({
  type,
  title,
  message,
  onComplete
}: CelebrationAnimationProps) => {
  const [show, setShow] = useState(true);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'lesson':
        return Trophy;
      case 'streak':
        return Flame;
      case 'achievement':
        return Award;
      case 'challenge':
        return Target;
      default:
        return Star;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'lesson':
        return 'from-yellow-400 to-orange-500';
      case 'streak':
        return 'from-red-400 to-orange-500';
      case 'achievement':
        return 'from-purple-400 to-pink-500';
      case 'challenge':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-primary to-primary-glow';
    }
  };

  const Icon = getIcon();
  const colorGradient = getColor();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          {/* Confetti */}
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="relative max-w-md w-full mx-4"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 blur-2xl opacity-50">
              <div className={`absolute inset-0 bg-gradient-to-r ${colorGradient} rounded-3xl`} />
            </div>

            {/* Card Content */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl">
              {/* Animated Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-r ${colorGradient} flex items-center justify-center mb-6 shadow-lg`}
              >
                <Icon className="w-12 h-12 text-white" />
              </motion.div>

              {/* Text Content */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-3"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  {title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {message}
                </p>
              </motion.div>

              {/* Sparkles */}
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                >
                  <Zap className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>

              <div className="absolute bottom-4 left-4">
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                >
                  <Star className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>

              {/* Progress Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-b-3xl"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
