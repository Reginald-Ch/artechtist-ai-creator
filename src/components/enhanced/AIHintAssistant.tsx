import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIHintAssistantProps {
  panelContent: string;
  difficulty: string;
  onClose?: () => void;
}

export const AIHintAssistant = ({ 
  panelContent, 
  difficulty,
  onClose 
}: AIHintAssistantProps) => {
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);

  // Generate contextual hints based on panel content
  const generateHint = (level: 1 | 2 | 3): string => {
    const hints: Record<number, string> = {
      1: "🤔 Think about what you just learned. Can you summarize it in one sentence?",
      2: "💡 Try to connect this concept to something you already know. How are they similar?",
      3: "🎯 Here's a tip: Look for the key words in the lesson that explain the main idea!"
    };
    return hints[level];
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 animate-in slide-in-from-bottom-5">
      {!showHint ? (
        <Button
          onClick={() => setShowHint(true)}
          className="rounded-full shadow-lg h-14 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="lg"
        >
          <Lightbulb className="w-5 h-5 mr-2" />
          Need a hint?
        </Button>
      ) : (
        <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-base">AI Learning Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowHint(false);
                  setHintLevel(1);
                  onClose?.();
                }}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <p className="text-sm">{generateHint(hintLevel)}</p>
            </div>

            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHintLevel(prev => Math.max(1, prev - 1) as 1 | 2 | 3)}
                disabled={hintLevel === 1}
                className="flex-1"
              >
                Simpler
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHintLevel(prev => Math.min(3, prev + 1) as 1 | 2 | 3)}
                disabled={hintLevel === 3}
                className="flex-1"
              >
                More Detail
              </Button>
            </div>

            <div className="flex gap-1 justify-center">
              {[1, 2, 3].map(level => (
                <div
                  key={level}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    level === hintLevel ? "bg-purple-600" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
