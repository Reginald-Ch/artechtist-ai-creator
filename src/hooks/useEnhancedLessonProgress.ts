import { useState, useEffect, useCallback } from 'react';
import { LessonProgress } from '@/types/lesson';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalTimeSpent: number;
  averageScore: number;
  completionRate: number;
  streakDays: number;
  weakAreas: Array<{ topic: string; avgScore: number; count: number }>;
  strongAreas: Array<{ topic: string; avgScore: number; count: number }>;
  progressOverTime: Array<{ date: string; lessonsCompleted: number; avgScore: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  timeByTopic: Array<{ topic: string; minutes: number }>;
  peakLearningHours: Array<{ hour: number; sessions: number }>;
}

interface OfflineQueue {
  action: 'update' | 'complete' | 'bookmark';
  lessonId: string;
  data: Partial<LessonProgress>;
  timestamp: number;
}

export const useEnhancedLessonProgress = () => {
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueue[]>([]);

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

  // Load progress from localStorage and Supabase
  useEffect(() => {
    loadProgress();
  }, []);

  // Process offline queue when online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      processOfflineQueue();
    }
  }, [isOnline, offlineQueue]);

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

    // Sync with Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          const progressMap: Record<string, LessonProgress> = {};
          data.forEach((item: any) => {
            progressMap[item.lesson_id] = {
              lessonId: item.lesson_id,
              completed: item.completed,
              score: item.score,
              currentPanel: item.current_panel,
              timeSpent: item.time_spent,
              attempts: item.attempts,
              completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
              bookmarked: item.bookmarked,
              lastVisited: item.last_visited ? new Date(item.last_visited) : undefined,
            };
          });
          setLessonProgress(progressMap);
          localStorage.setItem('lessonProgress', JSON.stringify(progressMap));
        }
      }
    } catch (error) {
      console.error('Failed to load progress from Supabase:', error);
    }
  };

  const processOfflineQueue = async () => {
    setSyncStatus('syncing');
    try {
      for (const item of offlineQueue) {
        await syncToSupabase(item.lessonId, item.data);
      }
      setOfflineQueue([]);
      localStorage.removeItem('offlineQueue');
      setSyncStatus('idle');
      toast.success('Progress synced! ☁️');
    } catch (error) {
      console.error('Failed to process offline queue:', error);
      setSyncStatus('error');
    }
  };

  const syncToSupabase = async (lessonId: string, data: Partial<LessonProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user for sync');
        return;
      }

      const payload = {
        user_id: user.id,
        lesson_id: lessonId,
        completed: data.completed ?? false,
        score: data.score ?? 0,
        current_panel: data.currentPanel ?? 0,
        time_spent: data.timeSpent ?? 0,
        attempts: data.attempts ?? 0,
        completed_at: data.completedAt?.toISOString(),
        bookmarked: data.bookmarked ?? false,
        last_visited: data.lastVisited?.toISOString() ?? new Date().toISOString(),
      };

      console.log('Syncing to Supabase:', payload);

      const { error } = await supabase
        .from('lesson_progress')
        .upsert(payload, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Supabase sync error:', error);
        throw error;
      }
      
      console.log('Successfully synced to Supabase');
    } catch (error) {
      console.error('Failed to sync to Supabase:', error);
      throw error;
    }
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
      
      // Sync to Supabase or queue for offline
      if (isOnline) {
        syncToSupabase(lessonId, updated[lessonId]).catch(err => {
          console.error('Sync error:', err);
          toast.error('Failed to sync progress to cloud');
          setSyncStatus('error');
          
          // Queue for retry
          const queue: OfflineQueue = {
            action: 'update',
            lessonId,
            data: updated[lessonId],
            timestamp: Date.now(),
          };
          setOfflineQueue(prev => {
            const newQueue = [...prev, queue];
            localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
            return newQueue;
          });
        });
      } else {
        const queue: OfflineQueue = {
          action: 'update',
          lessonId,
          data: updated[lessonId],
          timestamp: Date.now(),
        };
        setOfflineQueue(prev => {
          const newQueue = [...prev, queue];
          localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
          return newQueue;
        });
      }
      
      return updated;
    });
  }, [isOnline]);

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

    // Calculate streak (count consecutive days with activity)
    const dates = completed
      .filter(p => p.completedAt)
      .map(p => p.completedAt!)
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streakDays = 0;
    if (dates.length > 0) {
      streakDays = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < dates.length - 1; i++) {
        const current = new Date(dates[i]);
        const next = new Date(dates[i + 1]);
        current.setHours(0, 0, 0, 0);
        next.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    // Analyze weak/strong areas (placeholder - would need topic mapping)
    const scoreRanges: Record<string, number> = {
      '0-60': 0,
      '60-70': 0,
      '70-80': 0,
      '80-90': 0,
      '90-100': 0
    };

    completed.forEach(p => {
      const score = p.score;
      if (score < 60) scoreRanges['0-60']++;
      else if (score < 70) scoreRanges['60-70']++;
      else if (score < 80) scoreRanges['70-80']++;
      else if (score < 90) scoreRanges['80-90']++;
      else scoreRanges['90-100']++;
    });

    const scoreDistribution = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count
    }));

    // Progress over time (last 7 days)
    const progressOverTime = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayLessons = completed.filter(p => {
        const completedDate = new Date(p.completedAt!);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === date.getTime();
      });

      progressOverTime.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        lessonsCompleted: dayLessons.length,
        avgScore: dayLessons.length > 0 
          ? Math.round(dayLessons.reduce((sum, p) => sum + p.score, 0) / dayLessons.length)
          : 0
      });
    }

    // Peak learning hours (simulate data)
    const peakLearningHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessions: Math.floor(Math.random() * 5)
    })).filter(h => h.sessions > 0);

    // Topic-based analytics (simplified)
    const weakAreas: Array<{ topic: string; avgScore: number; count: number }> = [];
    const strongAreas: Array<{ topic: string; avgScore: number; count: number }> = [];
    const timeByTopic: Array<{ topic: string; minutes: number }> = [
      { topic: 'AI Fundamentals', minutes: Math.floor(totalTimeSpent * 0.3) },
      { topic: 'Data & Learning', minutes: Math.floor(totalTimeSpent * 0.25) },
      { topic: 'AI Ethics', minutes: Math.floor(totalTimeSpent * 0.2) },
      { topic: 'Applications', minutes: Math.floor(totalTimeSpent * 0.25) }
    ];

    // Identify weak and strong areas based on average scores
    if (completed.length > 0) {
      if (averageScore < 75) {
        weakAreas.push({ topic: 'Data Processing', avgScore: 65, count: 2 });
      }
      if (averageScore >= 85) {
        strongAreas.push({ topic: 'AI Fundamentals', avgScore: 92, count: 3 });
      }
    }

    return {
      totalTimeSpent,
      averageScore: Math.round(averageScore),
      completionRate: Math.round(completionRate),
      streakDays,
      weakAreas,
      strongAreas,
      progressOverTime,
      scoreDistribution,
      timeByTopic,
      peakLearningHours
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