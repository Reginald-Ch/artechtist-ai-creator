import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProgress {
  modelId: string;
  completed: boolean;
  score: number;
  points: number;
  lastTrainedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  educationalValue: string;
}

interface PlaygroundData {
  userProgress: UserProgress[];
  achievements: Achievement[];
  totalPoints: number;
  streakCount: number;
  reflections: Array<{
    modelId: string;
    reflection: string;
    createdAt: string;
  }>;
}

const STORAGE_KEY = 'ai-playground-progress';

export const usePlaygroundProgress = () => {
  const [data, setData] = useState<PlaygroundData>({
    userProgress: [],
    achievements: [],
    totalPoints: 0,
    streakCount: 0,
    reflections: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
    loadFromSupabase();
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage();
    }
  }, [data, isLoading]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  const loadFromSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progressData, error } = await supabase
        .from('ai_playground_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Failed to load from Supabase:', error);
        return;
      }

      if (progressData) {
        setData({
          userProgress: progressData.user_progress || [],
          achievements: progressData.achievements || [],
          totalPoints: progressData.total_points || 0,
          streakCount: progressData.streak_count || 0,
          reflections: progressData.reflections || []
        });
        saveToLocalStorage();
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error);
    }
  };

  const saveToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsSyncing(true);

      const { error } = await supabase
        .from('ai_playground_progress')
        .upsert({
          user_id: user.id,
          user_progress: data.userProgress,
          achievements: data.achievements,
          total_points: data.totalPoints,
          streak_count: data.streakCount,
          reflections: data.reflections,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to save to Supabase:', error);
        toast.error('Failed to sync progress to cloud');
      } else {
        toast.success('✅ Progress synced to cloud!');
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProgress = (progress: UserProgress) => {
    setData(prev => {
      const existing = prev.userProgress.find(p => p.modelId === progress.modelId);
      const newProgress = existing
        ? prev.userProgress.map(p => p.modelId === progress.modelId ? progress : p)
        : [...prev.userProgress, progress];

      return { ...prev, userProgress: newProgress };
    });
  };

  const addAchievement = (achievement: Achievement) => {
    setData(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement]
    }));
  };

  const updatePoints = (points: number) => {
    setData(prev => ({ ...prev, totalPoints: prev.totalPoints + points }));
  };

  const updateStreak = (increment: boolean = true) => {
    setData(prev => ({
      ...prev,
      streakCount: increment ? prev.streakCount + 1 : 0
    }));
  };

  const addReflection = (modelId: string, reflection: string) => {
    setData(prev => ({
      ...prev,
      reflections: [
        ...prev.reflections,
        {
          modelId,
          reflection,
          createdAt: new Date().toISOString()
        }
      ]
    }));
  };

  const getModelProgress = (modelId: string) => {
    return data.userProgress.find(p => p.modelId === modelId);
  };

  return {
    ...data,
    isLoading,
    isSyncing,
    updateProgress,
    addAchievement,
    updatePoints,
    updateStreak,
    addReflection,
    getModelProgress,
    saveToSupabase,
    refreshFromSupabase: loadFromSupabase
  };
};
