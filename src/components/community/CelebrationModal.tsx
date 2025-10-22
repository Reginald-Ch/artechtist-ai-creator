import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Award, Star, Crown } from 'lucide-react';
import Confetti from 'react-confetti';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'level_up' | 'top_10' | 'badge_earned' | 'challenge_complete';
  title: string;
  message: string;
  badgeIcon?: string;
  level?: number;
  rank?: number;
}

export function CelebrationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  badgeIcon,
  level,
  rank,
}: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      speak(message);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowConfetti(false);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'level_up':
        return <Crown className="w-20 h-20 text-amber-500" />;
      case 'top_10':
        return <Trophy className="w-20 h-20 text-amber-500" />;
      case 'badge_earned':
        return badgeIcon ? (
          <span className="text-8xl">{badgeIcon}</span>
        ) : (
          <Award className="w-20 h-20 text-primary" />
        );
      case 'challenge_complete':
        return <Star className="w-20 h-20 text-amber-500" />;
      default:
        return <Zap className="w-20 h-20 text-primary" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'level_up':
        return 'from-amber-500 via-yellow-500 to-orange-500';
      case 'top_10':
        return 'from-purple-500 via-pink-500 to-rose-500';
      case 'badge_earned':
        return 'from-blue-500 via-cyan-500 to-teal-500';
      case 'challenge_complete':
        return 'from-green-500 via-emerald-500 to-teal-500';
      default:
        return 'from-primary via-secondary to-accent';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          {showConfetti && (
            <Confetti
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
            />
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className={`relative overflow-hidden p-8 max-w-md bg-gradient-to-br ${getGradient()} border-4 border-white/20 shadow-2xl`}>
              {/* Animated background sparkles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/40 rounded-full"
                  initial={{
                    x: Math.random() * 400,
                    y: Math.random() * 400,
                    scale: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}

              <div className="relative text-center space-y-6">
                {/* Icon */}
                <motion.div
                  className="flex justify-center"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {getIcon()}
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-4xl font-bold text-white drop-shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {title}
                </motion.h2>

                {/* Level/Rank Badge */}
                {level && (
                  <motion.div
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Crown className="w-6 h-6 text-white" />
                    <span className="text-2xl font-bold text-white">Level {level}</span>
                  </motion.div>
                )}

                {rank && (
                  <motion.div
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                    <span className="text-2xl font-bold text-white">Rank #{rank}</span>
                  </motion.div>
                )}

                {/* Message */}
                <p className="text-xl text-white/90 font-medium leading-relaxed">
                  {message}
                </p>

                {/* Starburst effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    scale: [0, 2],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-radial from-white/30 to-transparent" />
                </motion.div>

                {/* Close Button */}
                <Button
                  onClick={handleClose}
                  className="mt-6 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-sm"
                  size="lg"
                >
                  Awesome!
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
