import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  MessageSquare, 
  Bot, 
  Mic, 
  Play,
  Lightbulb,
  Target,
  Zap,
  Wand2,
  Sparkles,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  visual?: string;
  tip?: string;
  action?: string;
  icon: React.ReactNode;
}

interface BotBuilderTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bot Builder! 🚀',
    content: 'Ready to create your first AI chatbot? I\'ll guide you through building intelligent conversational agents that can understand and respond to users naturally.',
    tip: 'Think of intents as the "topics" your bot can understand',
    icon: <Bot className="h-5 w-5" />
  },
  {
    id: 'intents',
    title: 'Understanding Intents',
    content: 'Intents are the heart of your bot! Each intent represents something a user wants to do - like asking for help, booking a service, or getting information.',
    visual: 'Click "Add Intent" to create your first conversation topic',
    action: 'Try clicking the blue "Add Intent" button in the toolbar',
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    id: 'training',
    title: 'Training Your Bot',
    content: 'Add training phrases - these are examples of what users might say. The more examples you provide, the smarter your bot becomes at understanding variations.',
    tip: 'Add at least 5-10 training phrases per intent for best results',
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    id: 'responses',
    title: 'Creating Responses',
    content: 'Write responses that your bot will use to reply. You can add multiple responses - your bot will randomly pick one to keep conversations fresh!',
    visual: 'Mix up your responses to make conversations feel natural',
    icon: <Wand2 className="h-5 w-5" />
  },
  {
    id: 'connections',
    title: 'Connecting the Flow',
    content: 'Connect intents to create conversation flows. Drag from the blue dot at the bottom of one intent to the top of another to link them together.',
    action: 'Drag between the blue connection points on nodes',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'testing',
    title: 'Test Your Creation',
    content: 'Use the "Test Bot" button to chat with your creation! This is where you see your bot come to life and respond to real messages.',
    tip: 'Test frequently as you build to catch issues early',
    icon: <Play className="h-5 w-5" />
  },
  {
    id: 'voice',
    title: 'Voice Powers! 🎤',
    content: 'Want to make your bot talk? Configure voice settings and connect to services like ElevenLabs to give your bot a voice that speaks multiple languages.',
    visual: 'Your bot can speak in different voices and accents',
    icon: <Mic className="h-5 w-5" />
  },
  {
    id: 'deployment',
    title: 'Launch Time! 🎉',
    content: 'Ready to share your bot with the world? Export your creation, integrate with platforms, or deploy it live. Your AI assistant is ready to help people!',
    tip: 'Save your work regularly using the Save button',
    icon: <Zap className="h-5 w-5" />
  }
];

export const BotBuilderTutorial = ({ isOpen, onClose, onComplete }: BotBuilderTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (isLastStep) {
      setTimeout(() => {
        onComplete();
        onClose();
        setCurrentStep(0);
        setCompletedSteps(new Set());
      }, 800);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
    setCompletedSteps(new Set());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-br from-primary to-primary-glow p-2 rounded-xl"
              >
                {currentStepData.icon}
              </motion.div>
              {currentStepData.title}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm font-mono">
                {currentStep + 1} / {tutorialSteps.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tutorial Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={cn(
                "relative overflow-hidden transition-all duration-500",
                isLastStep ? "bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary" : "hover:shadow-md"
              )}>
                <CardContent className="p-6 space-y-4">
                  {/* Sparkle decoration for last step */}
                  {isLastStep && (
                    <motion.div
                      className="absolute top-4 right-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-6 w-6 text-primary" />
                    </motion.div>
                  )}

                  <p className="text-base leading-relaxed">{currentStepData.content}</p>

                  {currentStepData.visual && (
                    <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                      <p className="text-sm font-medium text-primary">💡 Visual Hint:</p>
                      <p className="text-sm text-muted-foreground mt-1">{currentStepData.visual}</p>
                    </div>
                  )}

                  {currentStepData.action && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-400">
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">🎯 Try This:</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{currentStepData.action}</p>
                    </div>
                  )}

                  {currentStepData.tip && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">💡 Pro Tip:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{currentStepData.tip}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "relative w-3 h-3 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "bg-primary scale-125 shadow-lg" 
                    : completedSteps.has(index)
                      ? "bg-green-500 hover:scale-110"
                      : index < currentStep 
                        ? "bg-primary/60 hover:scale-110" 
                        : "bg-muted hover:bg-muted-foreground/20"
                )}
              >
                {completedSteps.has(index) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check className="h-2 w-2 text-white" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button 
              onClick={handleNext}
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                isLastStep && "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg"
              )}
            >
              {isLastStep ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Complete Tutorial
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};