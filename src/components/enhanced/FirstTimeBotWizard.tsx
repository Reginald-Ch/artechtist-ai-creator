import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  Bot, 
  MessageSquare, 
  Mic, 
  Sparkles,
  CheckCircle,
  Lightbulb
} from "lucide-react";

interface FirstTimeBotWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (botData: {
    name: string;
    description: string;
    personality: string;
    firstIntent: string;
    responses: string[];
  }) => void;
}

export const FirstTimeBotWizard: React.FC<FirstTimeBotWizardProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [botData, setBotData] = useState({
    name: '',
    description: '',
    personality: '',
    firstIntent: '',
    responses: ['']
  });

  const steps = [
    {
      title: "Name Your Bot",
      description: "Give your AI assistant a friendly name!",
      icon: <Bot className="w-6 h-6" />
    },
    {
      title: "Bot Personality",
      description: "What kind of personality should your bot have?",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "First Conversation",
      description: "What should your bot say when someone greets it?",
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      title: "Ready to Build!",
      description: "Your bot is ready to be created!",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const personalities = [
    { id: 'friendly', name: 'Friendly Helper', emoji: '😊', description: 'Warm and helpful' },
    { id: 'funny', name: 'Funny Friend', emoji: '😄', description: 'Loves to make jokes' },
    { id: 'smart', name: 'Smart Tutor', emoji: '🤓', description: 'Loves to teach' },
    { id: 'cool', name: 'Cool Buddy', emoji: '😎', description: 'Laid-back and chill' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(botData);
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return botData.name.trim().length > 0;
      case 1: return botData.personality.length > 0;
      case 2: return botData.firstIntent.trim().length > 0 && botData.responses[0].trim().length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">🤖</div>
              <p className="text-sm text-muted-foreground">
                Choose a name that kids will love!
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="botName">Bot Name</Label>
              <Input
                id="botName"
                placeholder="e.g., Buddy, Helper, SmartBot..."
                value={botData.name}
                onChange={(e) => setBotData({ ...botData, name: e.target.value })}
                className="text-center text-lg font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="botDescription">What does your bot do?</Label>
              <Textarea
                id="botDescription"
                placeholder="e.g., Helps with homework, tells jokes, answers questions..."
                value={botData.description}
                onChange={(e) => setBotData({ ...botData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">✨</div>
              <p className="text-sm text-muted-foreground">
                Pick a personality that matches your bot!
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {personalities.map((personality) => (
                <motion.div
                  key={personality.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      botData.personality === personality.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setBotData({ ...botData, personality: personality.id })}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className="text-2xl">{personality.emoji}</div>
                      <div className="font-medium text-sm">{personality.name}</div>
                      <div className="text-xs text-muted-foreground">{personality.description}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">💬</div>
              <p className="text-sm text-muted-foreground">
                Teach your bot how to start conversations!
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firstIntent">When someone says "hello", what should your bot understand?</Label>
              <Input
                id="firstIntent"
                placeholder="e.g., greeting, hello, hi there..."
                value={botData.firstIntent}
                onChange={(e) => setBotData({ ...botData, firstIntent: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="response">How should your bot respond?</Label>
              <Textarea
                id="response"
                placeholder="e.g., Hi there! I'm here to help you with anything you need!"
                value={botData.responses[0]}
                onChange={(e) => setBotData({ ...botData, responses: [e.target.value] })}
                rows={3}
              />
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium">Tip:</p>
                  <p>Make your bot's response friendly and helpful. You can always add more responses later!</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <p className="text-lg font-semibold">Your bot is ready!</p>
              <p className="text-sm text-muted-foreground">
                Here's what we're creating for you:
              </p>
            </div>
            
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="font-medium">{botData.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {personalities.find(p => p.id === botData.personality)?.name}
                  </Badge>
                </div>
                
                {botData.description && (
                  <p className="text-sm text-muted-foreground">
                    {botData.description}
                  </p>
                )}
                
                <div className="bg-background p-3 rounded border">
                  <div className="text-xs text-muted-foreground mb-1">First conversation:</div>
                  <div className="text-sm">
                    <strong>User:</strong> hello<br />
                    <strong>{botData.name}:</strong> {botData.responses[0]}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {steps[currentStep].icon}
            <span>{steps[currentStep].title}</span>
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-muted h-2 rounded-full">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === steps.length - 1 ? 'Create Bot!' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};