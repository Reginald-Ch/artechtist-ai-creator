import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Play,
  Target,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  action?: string;
  tip?: string;
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  tutorialType: 'bot-builder' | 'voice-training' | 'template-usage';
  onStepComplete?: (stepId: string) => void;
}

const tutorials = {
  'bot-builder': {
    title: 'Building Your First AI Bot',
    description: 'Learn how to create intelligent conversational flows',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Bot Building!',
        description: 'Let\'s create your first AI chatbot step by step. This tutorial will guide you through the process.',
        tip: 'Take your time - learning AI concepts is a journey!'
      },
      {
        id: 'add-intent',
        title: 'Add Your First Intent',
        description: 'Click the "Add Intent" button to create a new intent. Think of an intent as what users want to accomplish.',
        target: 'add-intent-button',
        action: 'Click "Add Intent"',
        tip: 'Start with simple intents like "greeting" or "goodbye"'
      },
      {
        id: 'training-phrases',
        title: 'Add Training Phrases',
        description: 'Training phrases are different ways users might express the same intent. Add several variations.',
        target: 'training-phrases-input',
        action: 'Type training phrases',
        tip: 'Include variations like "Hi", "Hello", "Hey there" for a greeting intent'
      },
      {
        id: 'responses',
        title: 'Create Bot Responses',
        description: 'Add responses that your bot will give when this intent is triggered.',
        target: 'responses-section',
        action: 'Add responses',
        tip: 'Make responses friendly and helpful!'
      },
      {
        id: 'connect-flow',
        title: 'Connect Your Flow',
        description: 'Connect intents by dragging from one node to another to create conversation flows.',
        target: 'flow-canvas',
        action: 'Drag to connect nodes',
        tip: 'Think about the natural flow of conversation'
      },
      {
        id: 'test-bot',
        title: 'Test Your Bot',
        description: 'Use the Test Panel to try out your bot and see how it responds to different inputs.',
        target: 'test-button',
        action: 'Click "Test"',
        tip: 'Testing helps you improve your bot\'s responses'
      }
    ]
  },
  'voice-training': {
    title: 'Voice Training for African Languages',
    description: 'Improve AI understanding of African accents and languages',
    steps: [
      {
        id: 'voice-intro',
        title: 'Voice Training Basics',
        description: 'Voice training helps AI understand different accents and speaking styles better.',
        tip: 'This is especially important for African languages!'
      },
      {
        id: 'select-language',
        title: 'Choose Your Language',
        description: 'Select the language or dialect you want to train the AI to understand.',
        target: 'language-selector',
        action: 'Select language',
        tip: 'We support Swahili, Zulu, Yoruba, and more!'
      },
      {
        id: 'record-phrases',
        title: 'Record Training Phrases',
        description: 'Speak the training phrases clearly in your natural accent.',
        target: 'record-button',
        action: 'Click record and speak',
        tip: 'Speak naturally - don\'t try to change your accent!'
      },
      {
        id: 'review-recordings',
        title: 'Review Your Recordings',
        description: 'Listen to your recordings and re-record if needed for better quality.',
        target: 'recordings-list',
        action: 'Review recordings',
        tip: 'Clear audio helps the AI learn better'
      }
    ]
  },
  'template-usage': {
    title: 'Using Bot Templates',
    description: 'Start quickly with pre-built conversation templates',
    steps: [
      {
        id: 'browse-templates',
        title: 'Browse Available Templates',
        description: 'Explore our gallery of pre-built bot templates for different use cases.',
        target: 'template-gallery',
        action: 'Browse templates',
        tip: 'Templates save time and provide inspiration!'
      },
      {
        id: 'preview-template',
        title: 'Preview Template',
        description: 'Click on a template to see its conversation flow and features.',
        target: 'template-card',
        action: 'Click template',
        tip: 'Look for templates that match your goals'
      },
      {
        id: 'customize-template',
        title: 'Customize the Template',
        description: 'Modify the template to fit your specific needs and add your own personality.',
        target: 'customize-section',
        action: 'Edit template',
        tip: 'Make it your own with custom responses and training phrases!'
      }
    ]
  }
};

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isVisible,
  onClose,
  tutorialType,
  onStepComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  
  const tutorial = tutorials[tutorialType];
  const step = tutorial.steps[currentStep];
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorial.steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, step.id]));
      onStepComplete?.(step.id);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));
    onStepComplete?.(step.id);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-md bg-primary/20">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{tutorial.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <Badge variant="secondary">
                {currentStep + 1} of {tutorial.steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Step */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{step.title}</h3>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {step.action && (
              <div className="p-3 rounded-lg bg-accent/50 border border-accent">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Next Action:</span>
                </div>
                <p className="text-sm mt-1">{step.action}</p>
              </div>
            )}

            {step.tip && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI-ko's Tip:</span>
                </div>
                <p className="text-sm mt-1">{step.tip}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {currentStep === tutorial.steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                className="flex items-center space-x-1"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete</span>
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};