import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bot Builder',
    content: 'Create intelligent conversational AI agents with our visual flow builder. Let\'s walk through the basics.',
    icon: <Bot className="h-5 w-5" />,
    highlight: true
  },
  {
    id: 'intents',
    title: 'Understanding Intents',
    content: 'Intents represent what users want to accomplish. Each intent contains training phrases (what users say) and responses (what your bot replies).',
    icon: <MessageSquare className="h-5 w-5" />,
    target: '.react-flow__node'
  },
  {
    id: 'connections',
    title: 'Connecting Intents',
    content: 'Connect intents to create conversation flows. Click and drag from the blue connection points to link intents together.',
    icon: <Target className="h-5 w-5" />,
    target: '.react-flow__handle'
  },
  {
    id: 'editing',
    title: 'Editing Intents',
    content: 'Click on any intent to select it, then use the properties panel to add training phrases and responses. The "Edit" button opens detailed editing.',
    icon: <Lightbulb className="h-5 w-5" />,
    target: '.properties-panel'
  },
  {
    id: 'testing',
    title: 'Test Your Bot',
    content: 'Use the test panel to chat with your bot and see how it responds. Switch to the "Speaker" tab to test voice integration.',
    icon: <Play className="h-5 w-5" />,
    target: '.test-panel'
  },
  {
    id: 'voice',
    title: 'Voice Integration',
    content: 'Connect your bot to Google Assistant or test voice recognition locally. Configure voice settings in the Speaker tab.',
    icon: <Mic className="h-5 w-5" />,
    target: '.speaker-panel'
  },
  {
    id: 'deployment',
    title: 'Save & Deploy',
    content: 'Save your bot locally or export it as JSON. Use the deploy features to connect with Google Assistant for voice interactions.',
    icon: <Zap className="h-5 w-5" />
  }
];

export const TutorialOverlay = ({ isOpen, onClose, onComplete }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      setIsCompleting(true);
      setTimeout(() => {
        onComplete();
        onClose();
        setIsCompleting(false);
        setCurrentStep(0);
      }, 1000);
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {currentStepData.icon}
              {currentStepData.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} of {tutorialSteps.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300",
            currentStepData.highlight ? "border-primary bg-primary/5" : "border-border bg-background"
          )}>
            <p className="text-sm leading-relaxed">{currentStepData.content}</p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentStep 
                    ? "bg-primary scale-125" 
                    : index < currentStep 
                      ? "bg-primary/60" 
                      : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
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
              disabled={isCompleting}
              className="flex items-center gap-2"
            >
              {isCompleting ? 'Completing...' : isLastStep ? 'Finish' : 'Next'}
              {!isCompleting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};