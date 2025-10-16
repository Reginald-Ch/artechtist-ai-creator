import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
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
  Play,
  Keyboard
} from 'lucide-react';
import { AnimatedCharacter } from '@/components/AnimatedCharacter';
import { OptimizedEncouragingAI } from './OptimizedEncouragingAI';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { QuizQuestion } from './QuizQuestion';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Lesson } from '@/types/lesson';
import { toast } from 'sonner';

interface AccessibleLessonViewProps {
  lesson: Lesson;
  completedLessons: number;
  isBookmarked: boolean;
  averageScore: number;
  streakDays: number;
  onComplete: (score: number) => void;
  onBack: () => void;
  onToggleBookmark: () => void;
  onStartFlashcards?: () => void;
  onQuizAnswer?: (questionId: string, correct: boolean) => void;
}

const AccessibleLessonView = memo(({ 
  lesson, 
  completedLessons, 
  isBookmarked,
  averageScore,
  streakDays,
  onComplete, 
  onBack,
  onToggleBookmark,
  onStartFlashcards,
  onQuizAnswer
}: AccessibleLessonViewProps) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const { speak, stop, isPlaying, isSupported } = useSpeechSynthesis();
  const panelRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  const currentPanelData = lesson.panels[currentPanel];

  // Real-time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // minutes
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [startTime]);

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

  const handlePlayAudio = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      const textToSpeak = `${currentPanelData.character}: ${currentPanelData.dialogue}`;
      speak(textToSpeak);
    }
  }, [isPlaying, stop, speak, currentPanelData]);

  // Enhanced keyboard navigation with help
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
        case 'S':
          e.preventDefault();
          handlePlayAudio();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          onToggleBookmark();
          break;
        case 'Escape':
          e.preventDefault();
          onBack();
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPanel, lesson.panels.length, isPlaying, onToggleBookmark, onBack]);

  // Touch gestures for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;
      
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;
      
      // Swipe threshold of 50px
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
      }
      
      setTouchStart(null);
    };

    const element = panelRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [touchStart, handleNext, handlePrevious]);

  // Focus management
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.focus();
    }
  }, [currentPanel]);

  // Auto-advance panels with announcements
  useEffect(() => {
    if (autoPlay && !isPlaying && currentPanel < lesson.panels.length - 1) {
      const timer = setTimeout(() => {
        setCurrentPanel(prev => prev + 1);
        if (announcementRef.current) {
          announcementRef.current.textContent = `Panel ${currentPanel + 2} of ${lesson.panels.length}`;
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isPlaying, currentPanel, lesson.panels.length]);

  // Screen reader announcements
  useEffect(() => {
    if (announcementRef.current) {
      const text = `${currentPanelData.character}: ${currentPanelData.dialogue}`;
      announcementRef.current.textContent = text;
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
      {/* Skip Navigation Link */}
      <a 
        href="#lesson-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to lesson content
      </a>

      {/* Screen Reader Live Region */}
      <div 
        ref={announcementRef}
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />

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
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Audio Controls */}
              {isSupported && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePlayAudio}
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                    className="min-w-[44px] min-h-[44px]"
                  >
                    {isPlaying ? (
                      <VolumeX className="w-4 h-4 sm:mr-2" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Listen'}</span>
                  </Button>
                  {isPlaying && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={stop}
                      aria-label="Stop audio"
                      className="min-w-[44px] min-h-[44px]"
                    >
                      <Square className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Stop</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoPlay(!autoPlay)}
                    aria-label={autoPlay ? "Disable auto-play" : "Enable auto-play"}
                    className={`min-w-[44px] min-h-[44px] ${autoPlay ? 'bg-primary/10' : ''}`}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowShortcuts(true)}
                aria-label="Show keyboard shortcuts"
                className="min-w-[44px] min-h-[44px]"
              >
                <Keyboard className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={onBack} className="min-w-[44px] min-h-[44px]">
                <span className="hidden sm:inline">Back to Topics</span>
                <span className="sm:hidden">Back</span>
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
      <Card 
        ref={panelRef}
        tabIndex={0}
        id="lesson-content"
        aria-label="Lesson panel content"
      >
        <CardContent className="space-y-6 p-4 sm:p-6">
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

          {/* Interactive Element - Real Assessment */}
          {currentPanelData.interactiveElement?.type === 'question' && (
            <QuizQuestion
              question={currentPanelData.interactiveElement.content}
              options={currentPanelData.interactiveElement.options}
              correctAnswer={currentPanelData.interactiveElement.correctAnswer || ''}
              explanation={currentPanelData.interactiveElement.explanation}
              questionNumber={currentPanel + 1}
              totalQuestions={lesson.panels.filter(p => p.interactiveElement).length}
              onAnswer={(isCorrect) => {
                const questionId = `${lesson.id}-panel-${currentPanel}`;
                setQuizAnswers(prev => ({ ...prev, [questionId]: isCorrect }));
                onQuizAnswer?.(questionId, isCorrect);
              }}
            />
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPanel === 0}
              aria-label="Previous panel"
              className="min-w-[44px] min-h-[44px] flex-1 sm:flex-none"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            <div className="flex flex-col sm:flex-row items-stretch gap-2 flex-1 sm:flex-none">
              <Button
                variant="outline"
                onClick={() => setShowFlashcards(true)}
                aria-label="Review flashcards"
                className="min-w-[44px] min-h-[44px]"
              >
                Review Cards
              </Button>
              
              {onStartFlashcards && lesson.flashcards.length > 0 && (
                <Button
                  variant="outline"
                  onClick={onStartFlashcards}
                  aria-label="Study Mode with spaced repetition"
                  className="min-w-[44px] min-h-[44px]"
                >
                  Study Mode
                </Button>
              )}
              
              {currentPanel === lesson.panels.length - 1 ? (
                <Button 
                  onClick={() => {
                    // Calculate real score from quiz answers
                    const totalQuestions = Object.keys(quizAnswers).length;
                    const correctAnswers = Object.values(quizAnswers).filter(Boolean).length;
                    const score = totalQuestions > 0 
                      ? Math.round((correctAnswers / totalQuestions) * 100)
                      : 80; // Default if no quiz questions
                    onComplete(score);
                  }} 
                  className="bg-gradient-to-r from-primary to-primary-glow min-w-[44px] min-h-[44px]"
                  aria-label="Complete lesson"
                >
                  Complete Lesson
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  aria-label="Next panel"
                  className="min-w-[44px] min-h-[44px]"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 sm:ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="text-xs text-muted-foreground border-t pt-4 text-center sm:text-left">
            <p className="hidden sm:block">Keyboard shortcuts: ← → (navigate) • Space (next) • S (speak) • B (bookmark) • ? (help) • Esc (back)</p>
            <button 
              onClick={() => setShowShortcuts(true)}
              className="sm:hidden text-primary underline"
            >
              View keyboard shortcuts
            </button>
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