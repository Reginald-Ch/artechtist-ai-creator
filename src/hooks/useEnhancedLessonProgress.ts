import { useState, useEffect, useCallback } from 'react';
import { LessonProgress } from '@/types/lesson';
import { toast } from 'sonner';

interface AnalyticsData {
  totalTimeSpent: number;
  averageScore: number;
  completionRate: number;
  streakDays: number;
  weakAreas: string[];
  strongAreas: string[];
}

export const useEnhancedLessonProgress = () => {
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    // Load from localStorage first for immediate display
    const localProgress = localStorage.getItem('lessonProgress');
    if (localProgress) {
      try {
        setLessonProgress(JSON.parse(localProgress));
      } catch (error) {
        console.warn('Failed to parse localStorage progress:', error);
      }
    }

    // TODO: Future Supabase integration will be added here
    // when the types are updated after the migration
  };

  const updateProgress = useCallback((lessonId: string, updates: Partial<LessonProgress>) => {
    setLessonProgress(prev => {
      const updated = {
        ...prev,
        [lessonId]: {
          lessonId,
          completed: false,
          score: 0,
          currentPanel: 0,
          timeSpent: 0,
          attempts: 0,
          lastVisited: new Date(),
          ...prev[lessonId],
          ...updates,
        },
      };
      localStorage.setItem('lessonProgress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completeLesson = useCallback((lessonId: string, score: number) => {
    updateProgress(lessonId, {
      completed: true,
      score,
      completedAt: new Date(),
      attempts: (lessonProgress[lessonId]?.attempts || 0) + 1,
    });
    toast.success('Lesson completed! 🎉', {
      description: `You scored ${score}%`
    });
  }, [lessonProgress, updateProgress]);

  const toggleBookmark = useCallback((lessonId: string) => {
    const current = lessonProgress[lessonId]?.bookmarked || false;
    updateProgress(lessonId, { bookmarked: !current });
    toast.success(current ? 'Bookmark removed' : 'Lesson bookmarked! 📚');
  }, [lessonProgress, updateProgress]);

  const calculateAnalytics = useCallback((): AnalyticsData => {
    const progressArray = Object.values(lessonProgress);
    const completed = progressArray.filter(p => p.completed);
    
    const totalTimeSpent = progressArray.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageScore = completed.length > 0 
      ? completed.reduce((sum, p) => sum + p.score, 0) / completed.length 
      : 0;
    const completionRate = progressArray.length > 0 
      ? (completed.length / progressArray.length) * 100 
      : 0;

    // Calculate streak (simplified)
    const streakDays = Math.floor(Math.random() * 7) + 1; // Placeholder

    // Analyze weak/strong areas based on scores
    const weakAreas = ['Data Processing']; // Placeholder
    const strongAreas = ['AI Fundamentals']; // Placeholder

    return {
      totalTimeSpent,
      averageScore: Math.round(averageScore),
      completionRate: Math.round(completionRate),
      streakDays,
      weakAreas,
      strongAreas
    };
  }, [lessonProgress]);

  useEffect(() => {
    setAnalytics(calculateAnalytics());
  }, [lessonProgress, calculateAnalytics]);

  const exportProgress = useCallback(() => {
    const data = {
      progress: lessonProgress,
      analytics: analytics,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-lessons-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Progress exported! 📊');
  }, [lessonProgress, analytics]);

  return {
    lessonProgress,
    analytics,
    syncStatus,
    isOnline,
    updateProgress,
    completeLesson,
    toggleBookmark,
    exportProgress,
    isLessonCompleted: (lessonId: string) => lessonProgress[lessonId]?.completed || false,
    isLessonBookmarked: (lessonId: string) => lessonProgress[lessonId]?.bookmarked || false,
    getLessonScore: (lessonId: string) => lessonProgress[lessonId]?.score || 0,
    getTotalProgress: () => {
      const total = Object.keys(lessonProgress).length;
      const completed = Object.values(lessonProgress).filter(p => p.completed).length;
      return total > 0 ? (completed / total) * 100 : 0;
    }
  };
};