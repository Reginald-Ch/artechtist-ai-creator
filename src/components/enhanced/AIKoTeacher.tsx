import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, MessageCircle, Lightbulb, Heart, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface AIKoTeacherProps {
  gameId: string;
  gameState: string;
  onHint?: () => void;
  onEncouragement?: () => void;
  className?: string;
}

interface TeachingDialogue {
  message: string;
  concept?: string;
  emoji: string;
  actionButton?: {
    text: string;
    action: () => void;
  };
}

export const AIKoTeacher = ({ gameId, gameState, onHint, onEncouragement, className }: AIKoTeacherProps) => {
  const [currentDialogue, setCurrentDialogue] = useState<TeachingDialogue | null>(null);
  const [mood, setMood] = useState<'happy' | 'encouraging' | 'teaching' | 'celebrating'>('happy');
  const [isVisible, setIsVisible] = useState(true);
  const { speak, isPlaying } = useSpeechSynthesis();

  // Game-specific teaching dialogues
  const getGameDialogues = (gameId: string, gameState: string): TeachingDialogue[] => {
    const dialogues: Record<string, Record<string, TeachingDialogue[]>> = {
      'emoji-predictor': {
        'idle': [{
          message: "Hi! I'm AI-ko! 🤖 Let's learn about Computer Vision together! This game teaches me to recognize your emotions.",
          concept: "Computer Vision",
          emoji: "👀",
          actionButton: { text: "Tell me more!", action: () => explainConcept("Computer Vision") }
        }],
        'training': [{
          message: "Great! Now I'm learning from your facial expressions. Each emotion you show helps me get smarter! 🧠",
          concept: "Machine Learning",
          emoji: "📚"
        }],
        'playing': [{
          message: "Wow! You're training me to be really smart! The more emotions you show, the better I get at recognizing them! ⭐",
          concept: "Training Data",
          emoji: "🎯"
        }]
      },
      'food-classifier': {
        'menu': [{
          message: "Time to learn Classification! 🍎 I'll show you foods and you help me learn their names. Ready to be my teacher?",
          concept: "Classification",
          emoji: "🏷️",
          actionButton: { text: "What's Classification?", action: () => explainConcept("Classification") }
        }],
        'playing': [{
          message: "You're helping me learn! Each correct answer makes me better at recognizing foods. That's how AI learns! 🎓",
          concept: "Supervised Learning",
          emoji: "👨‍🏫"
        }]
      },
      'rock-paper-scissors': {
        'idle': [{
          message: "Let's play Rock Paper Scissors! 🪨✂️📄 But here's the cool part - I'll try to learn your patterns and predict your moves!",
          concept: "Pattern Recognition",
          emoji: "🔍",
          actionButton: { text: "How do you learn?", action: () => explainConcept("Pattern Recognition") }
        }],
        'playing': [{
          message: "I'm watching your moves and learning! Do you always pick the same thing? I'm getting smarter with each round! 🧠⚡",
          concept: "Predictive AI",
          emoji: "🔮"
        }]
      },
      'magic-drawing': {
        'idle': [{
          message: "Welcome to Magic Drawing! ✨🎨 You draw, and I'll try to guess what it is! This teaches me about shapes and objects.",
          concept: "Image Recognition",
          emoji: "🖼️",
          actionButton: { text: "How do you see?", action: () => explainConcept("Computer Vision") }
        }],
        'drawing': [{
          message: "I'm analyzing your drawing! I look for lines, shapes, and patterns to understand what you're creating! 🔍✨",
          concept: "Feature Detection",
          emoji: "🔬"
        }]
      }
    };

    return dialogues[gameId]?.[gameState] || [{
      message: "Keep playing and learning! You're doing amazing! 🌟",
      emoji: "🎉"
    }];
  };

  const explainConcept = (concept: string) => {
    const explanations: Record<string, string> = {
      "Computer Vision": "Computer Vision is like giving me eyes! 👀 I can see images and understand what's in them, just like how you recognize your friends' faces!",
      "Machine Learning": "Machine Learning is how I get smarter! 🧠 Every time you show me something new, I remember it and get better at recognizing similar things!",
      "Classification": "Classification is sorting things into groups! 🏷️ Like putting all apples in one box and all bananas in another. I learn to tell them apart!",
      "Pattern Recognition": "Pattern Recognition helps me find similarities! 🔍 If you always pick rock first, I might notice that pattern and try to predict it!",
      "Training Data": "Training Data is all the examples you give me! 📚 The more emotions you show me, the better I become at recognizing feelings!",
      "Predictive AI": "Predictive AI means I try to guess what happens next! 🔮 Based on what you did before, I predict what you might do!"
    };

    setCurrentDialogue({
      message: explanations[concept] || "That's a great question! Keep exploring to learn more! 🌟",
      concept,
      emoji: "🤓"
    });
    setMood('teaching');
  };

  const providceEncouragement = () => {
    const encouragements = [
      "You're doing fantastic! Keep it up! 🌟",
      "Wow! You're really good at this! 🎉",
      "I'm learning so much from you! Thank you! 💫",
      "Amazing work! You're teaching me to be smarter! 🧠✨",
      "Keep going! Every try makes both of us better! 🚀"
    ];
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    setCurrentDialogue({
      message: randomEncouragement,
      emoji: "🎉"
    });
    setMood('celebrating');
    onEncouragement?.();
  };

  const provideHint = () => {
    const hints: Record<string, string[]> = {
      'emoji-predictor': [
        "Try making your emotions really clear! Big smiles, surprised eyes! 😮",
        "Look directly at the camera and make exaggerated expressions! 📸"
      ],
      'food-classifier': [
        "Look carefully at the shape and color of the food! 🔍",
        "Think about where you might find this food - kitchen, fruit bowl? 🤔"
      ],
      'rock-paper-scissors': [
        "Try to be unpredictable! Mix up your choices! 🔀",
        "I'm learning your patterns - can you outsmart me? 🧠"
      ],
      'magic-drawing': [
        "Draw clear, simple shapes! I look for basic forms! ⭕",
        "Make your drawing big and bold - I can see it better that way! 🖌️"
      ]
    };

    const gameHints = hints[gameId] || ["Keep trying! You're doing great! 🌟"];
    const randomHint = gameHints[Math.floor(Math.random() * gameHints.length)];
    
    setCurrentDialogue({
      message: randomHint,
      emoji: "💡"
    });
    setMood('teaching');
    onHint?.();
  };

  const speakDialogue = () => {
    if (currentDialogue) {
      const cleanMessage = currentDialogue.message.replace(/[🎉🌟🎯🔍✨🧠💫🚀🤖👀📚🏷️🔮🖼️🔬💡🎨📸🔀🖌️⭕]/g, '');
      speak(cleanMessage);
    }
  };

  useEffect(() => {
    const dialogues = getGameDialogues(gameId, gameState);
    if (dialogues.length > 0) {
      setCurrentDialogue(dialogues[0]);
    }
  }, [gameId, gameState]);

  useEffect(() => {
    // Auto-cycle through moods periodically
    const moodInterval = setInterval(() => {
      const moods: typeof mood[] = ['happy', 'encouraging', 'teaching'];
      setMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 8000);

    return () => clearInterval(moodInterval);
  }, []);

  const getMoodIcon = () => {
    switch (mood) {
      case 'celebrating': return Star;
      case 'encouraging': return Heart;
      case 'teaching': return Brain;
      default: return Sparkles;
    }
  };

  const getMoodColor = () => {
    switch (mood) {
      case 'celebrating': return 'from-yellow-400 to-orange-500';
      case 'encouraging': return 'from-pink-400 to-red-500';
      case 'teaching': return 'from-blue-400 to-purple-500';
      default: return 'from-green-400 to-teal-500';
    }
  };

  if (!isVisible || !currentDialogue) return null;

  const MoodIcon = getMoodIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed bottom-4 right-4 z-50 ${className}`}
    >
      <Card className="w-80 shadow-lg border-2 backdrop-blur-sm bg-card/95">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* AI-ko Avatar */}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMoodColor()} flex items-center justify-center flex-shrink-0`}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MoodIcon className="h-6 w-6 text-white" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">AI-ko</h4>
                {currentDialogue.concept && (
                  <Badge variant="secondary" className="text-xs">
                    {currentDialogue.concept}
                  </Badge>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={currentDialogue.message}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {currentDialogue.message}
                </motion.p>
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={speakDialogue}
                  className="h-7 px-2 text-xs"
                >
                  <MessageCircle className="mr-1 h-3 w-3" />
                  {isPlaying ? 'Speaking...' : 'Speak'}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={provideHint}
                  className="h-7 px-2 text-xs"
                >
                  <Lightbulb className="mr-1 h-3 w-3" />
                  Hint
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={providceEncouragement}
                  className="h-7 px-2 text-xs"
                >
                  <Heart className="mr-1 h-3 w-3" />
                  Cheer
                </Button>

                {currentDialogue.actionButton && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={currentDialogue.actionButton.action}
                    className="h-7 px-2 text-xs"
                  >
                    {currentDialogue.actionButton.text}
                  </Button>
                )}
              </div>
            </div>

            {/* Close Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};