import { useState, useEffect } from 'react';
import { BotBuilderTutorial } from '@/components/tutorial/BotBuilderTutorial';
import { AIMascot } from '@/components/tutorial/AIMascot';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TutorialManagerProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

interface TutorialProgress {
  completed: boolean;
  currentStep: number;
  lastVisit: string;
  skipCount: number;
}

const TUTORIAL_STORAGE_KEY = 'bot-builder-tutorial-progress';

export const TutorialManager = ({ onComplete, autoStart = false }: TutorialManagerProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [progress, setProgress] = useState<TutorialProgress>({
    completed: false,
    currentStep: 0,
    lastVisit: new Date().toISOString(),
    skipCount: 0
  });

  // Load tutorial progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
        
        // Auto-start tutorial if not completed and autoStart is true
        if (!parsed.completed && autoStart && parsed.skipCount < 3) {
          setShowTutorial(true);
        }
      } catch (error) {
        console.error('Failed to load tutorial progress:', error);
      }
    } else if (autoStart) {
      // First time user
      setShowTutorial(true);
    }
  }, [autoStart]);

  // Save progress to localStorage
  const saveProgress = (newProgress: Partial<TutorialProgress>) => {
    const updated = { ...progress, ...newProgress, lastVisit: new Date().toISOString() };
    setProgress(updated);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleTutorialComplete = () => {
    saveProgress({ completed: true });
    setShowTutorial(false);
    
    toast({
      title: "🎉 Tutorial Complete!",
      description: "You're now ready to build amazing chatbots!"
    });

    onComplete?.();
  };

  const handleTutorialClose = () => {
    saveProgress({ skipCount: progress.skipCount + 1 });
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    const reset: TutorialProgress = {
      completed: false,
      currentStep: 0,
      lastVisit: new Date().toISOString(),
      skipCount: 0
    };
    setProgress(reset);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(reset));
    setShowTutorial(true);
  };

  return (
    <>
      {/* Tutorial Dialog */}
      <BotBuilderTutorial
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        onComplete={handleTutorialComplete}
      />

      {/* AI Mascot Helper */}
      {showMascot && !showTutorial && (
        <AIMascot
          onClose={() => setShowMascot(false)}
        />
      )}

      {/* Help Button (Always visible) */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg hover:shadow-xl transition-all"
        title="Show Tutorial"
        aria-label="Show tutorial"
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        Tutorial
      </Button>
    </>
  );
};
