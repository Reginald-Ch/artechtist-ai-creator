import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Volume2, 
  VolumeX, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark,
  BookmarkCheck,
  SkipForward,
  Play
} from 'lucide-react';
import { AnimatedCharacter } from '@/components/AnimatedCharacter';
import { OptimizedEncouragingAI } from './OptimizedEncouragingAI';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Lesson } from '@/types/lesson';
import { toast } from 'sonner';

interface AccessibleLessonViewProps {
  lesson: Lesson;
  completedLessons: number;
  isBookmarked: boolean;
  averageScore: number;
  streakDays: number;
  onComplete: () => void;
  onBack: () => void;
  onToggleBookmark: () => void;
}

const AccessibleLessonView = memo(({ 
  lesson, 
  completedLessons, 
  isBookmarked,
  averageScore,
  streakDays,
  onComplete, 
  onBack,
  onToggleBookmark
}: AccessibleLessonViewProps) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const { speak, stop, isPlaying, isSupported } = useSpeechSynthesis();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 's':
          e.preventDefault();
          handlePlayAudio();
          break;
        case 'b':
          e.preventDefault();
          onToggleBookmark();
          break;
        case 'Escape':
          e.preventDefault();
          onBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPanel, lesson.panels.length, isPlaying, onToggleBookmark, onBack]);

  // Auto-advance panels
  useEffect(() => {
    if (autoPlay && !isPlaying && currentPanel < lesson.panels.length - 1) {
      const timer = setTimeout(() => {
        setCurrentPanel(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isPlaying, currentPanel, lesson.panels.length]);

  const currentPanelData = lesson.panels[currentPanel];

  const handlePlayAudio = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      const textToSpeak = `${currentPanelData.character}: ${currentPanelData.dialogue}`;
      speak(textToSpeak);
    }
  }, [isPlaying, stop, speak, currentPanelData]);

  const handleNext = useCallback(() => {
    if (currentPanel < lesson.panels.length - 1) {
      setCurrentPanel(prev => prev + 1);
    }
  }, [currentPanel, lesson.panels.length]);

  const handlePrevious = useCallback(() => {
    if (currentPanel > 0) {
      setCurrentPanel(prev => prev - 1);
    }
  }, [currentPanel]);

  const progressPercentage = ((currentPanel + 1) / lesson.panels.length) * 100;

  if (showFlashcards) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Flashcard Review</CardTitle>
              <CardDescription>
                Review key concepts from this lesson
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFlashcards(false)}
              aria-label="Return to lesson content"
            >
              Back to Lesson
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {lesson.flashcards.slice(0, 6).map((card, index) => (
              <Card key={card.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <Badge 
                    className={
                      card.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {card.difficulty}
                  </Badge>
                  <h4 className="font-medium">{card.question}</h4>
                  <p className="text-sm text-muted-foreground">{card.answer}</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleBookmark}
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  className="p-1"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-primary" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <CardDescription>
                Panel {currentPanel + 1} of {lesson.panels.length} • {lesson.difficulty} • {lesson.duration}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Audio Controls */}
              {isSupported && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePlayAudio}
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                  >
                    {isPlaying ? (
                      <VolumeX className="w-4 h-4 mr-2" />
                    ) : (
                      <Volume2 className="w-4 h-4 mr-2" />
                    )}
                    {isPlaying ? 'Pause' : 'Listen'}
                  </Button>
                  {isPlaying && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={stop}
                      aria-label="Stop audio"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoPlay(!autoPlay)}
                    aria-label={autoPlay ? "Disable auto-play" : "Enable auto-play"}
                    className={autoPlay ? 'bg-primary/10' : ''}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={onBack}>
                Back to Topics
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              aria-label={`Lesson progress: ${Math.round(progressPercentage)}%`}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Panel Content */}
      <Card>
        <CardContent className="space-y-6 p-6">
          {/* Character & Dialogue */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <AnimatedCharacter 
                character={currentPanelData.character} 
                size="lg" 
                isActive={isPlaying}
              />
              <div>
                <h3 className="font-semibold text-lg">{currentPanelData.character}</h3>
                {currentPanelData.action && (
                  <p className="text-sm text-muted-foreground">{currentPanelData.action}</p>
                )}
              </div>
            </div>
            
            <div 
              className="speech-bubble bg-gradient-to-r from-background to-muted/20 p-6 rounded-2xl border shadow-sm"
              style={{ background: currentPanelData.background }}
            >
              <p className="leading-relaxed text-base">{currentPanelData.dialogue}</p>
            </div>
          </div>

          {/* Interactive Element */}
          {currentPanelData.interactiveElement?.type === 'question' && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h4 className="font-medium mb-3">{currentPanelData.interactiveElement.content}</h4>
              <div className="grid gap-2">
                {currentPanelData.interactiveElement.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => {
                      const isCorrect = option === currentPanelData.interactiveElement?.correctAnswer;
                      toast[isCorrect ? 'success' : 'error'](
                        isCorrect ? 'Correct! 🎉' : 'Try again!'
                      );
                    }}
                    aria-label={`Option ${index + 1}: ${option}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPanel === 0}
              aria-label="Previous panel"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFlashcards(true)}
                aria-label="Review flashcards"
              >
                Review Cards
              </Button>
              
              {currentPanel === lesson.panels.length - 1 ? (
                <Button 
                  onClick={onComplete} 
                  className="bg-gradient-to-r from-primary to-primary-glow"
                  aria-label="Complete lesson"
                >
                  Complete Lesson
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  aria-label="Next panel"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>Keyboard shortcuts: ← → (navigate) • Space (next) • S (speak) • B (bookmark) • Esc (back)</p>
          </div>
        </CardContent>
      </Card>

      {/* Encouraging AI */}
      <OptimizedEncouragingAI 
        completedLessons={completedLessons}
        currentPanel={currentPanel}
        totalPanels={lesson.panels.length}
        streakDays={streakDays}
        averageScore={averageScore}
        onPanelComplete={currentPanel > 0 ? () => {} : undefined}
      />
    </div>
  );
});

AccessibleLessonView.displayName = 'AccessibleLessonView';

export { AccessibleLessonView };