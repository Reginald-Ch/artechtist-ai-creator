import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCharacterProps {
  character: string;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export const AnimatedCharacter = ({ character, size = 'md', isActive = false }: AnimatedCharacterProps) => {
  const getCharacterEmoji = (name: string) => {
    const characterMap: { [key: string]: string } = {
      'Context Manager': '🤖',
      'Data Detective': '🕵️',
      'AI Assistant': '🎯',
      'Ethics Guardian': '🛡️',
      'Bot Builder': '⚙️',
      'Learning Companion': '📚',
      'Code Wizard': '🧙‍♂️',
      'Neural Navigator': '🧠',
      'Algorithm Artist': '🎨',
      'Pattern Pioneer': '🔍',
      'Logic Leader': '💡',
      'Innovation Guide': '🚀'
    };
    return characterMap[name] || '🤖';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 backdrop-blur-sm border-2 border-primary/30 flex items-center justify-center cursor-pointer`}
      animate={{
        scale: isActive ? [1, 1.1, 1] : 1,
        rotate: isActive ? [0, 5, -5, 0] : 0,
      }}
      transition={{
        duration: 0.6,
        repeat: isActive ? Infinity : 0,
        repeatType: "reverse"
      }}
      whileHover={{ 
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="animate-pulse">{getCharacterEmoji(character)}</span>
    </motion.div>
  );
};

export default AnimatedCharacter;