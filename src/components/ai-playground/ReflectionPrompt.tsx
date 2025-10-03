import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Lightbulb, MessageSquare, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReflectionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  score: number;
  onSubmit: (reflection: string) => void;
}

export const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({
  open,
  onOpenChange,
  modelName,
  score,
  onSubmit
}) => {
  const [reflection, setReflection] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const prompts = [
    {
      id: 'learning',
      question: 'What did you learn about how AI works?',
      hint: 'Think about patterns, training data, or predictions...',
      icon: '🧠'
    },
    {
      id: 'real-world',
      question: 'Where else could you use this kind of AI in real life?',
      hint: 'Schools, homes, hospitals, games, apps...',
      icon: '🌍'
    },
    {
      id: 'improve',
      question: 'If you built this again, what would you do differently?',
      hint: 'More data, different categories, better images...',
      icon: '💡'
    },
    {
      id: 'challenge',
      question: 'What was the most challenging part?',
      hint: 'Getting good data, understanding results, fixing errors...',
      icon: '🎯'
    }
  ];

  const handleSubmit = () => {
    if (reflection.trim()) {
      onSubmit(reflection);
      onOpenChange(false);
      setReflection('');
      setSelectedPrompt(null);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setReflection('');
    setSelectedPrompt(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Reflect on Your Learning 🤔</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Take a moment to think about what you learned from building {modelName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900 mb-1">
                  Great job completing this model with {score}% accuracy!
                </p>
                <p className="text-xs text-green-800">
                  Reflection helps you remember what you learned and apply it to new challenges.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Choose a reflection prompt:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedPrompt === prompt.id
                      ? 'border-2 border-primary bg-primary/5'
                      : 'border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPrompt(prompt.id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPrompt(prompt.id);
                    }
                  }}
                  aria-pressed={selectedPrompt === prompt.id}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{prompt.icon}</span>
                      <Badge variant={selectedPrompt === prompt.id ? "default" : "outline"}>
                        {selectedPrompt === prompt.id && '✓ '}Selected
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{prompt.question}</p>
                    <p className="text-xs text-muted-foreground">{prompt.hint}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reflection" className="text-sm font-semibold">
              Your Reflection:
            </label>
            <Textarea
              id="reflection"
              placeholder={
                selectedPrompt
                  ? prompts.find(p => p.id === selectedPrompt)?.question
                  : "What did you learn? Where could you use this? What would you change?"
              }
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={6}
              className="resize-none"
              aria-label="Write your reflection"
            />
            <p className="text-xs text-muted-foreground">
              {reflection.length} characters • Write at least a few sentences
            </p>
          </div>

          <Card className="bg-blue-50 border-blue-200 p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">💡 Why reflect?</p>
                <p>
                  Thinking about what you learned helps your brain remember it better and 
                  helps you apply these ideas to new projects!
                </p>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reflection.trim() || reflection.length < 10}
            className="w-full sm:w-auto gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Save Reflection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
