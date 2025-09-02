import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceTrainingStats {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalPracticeTime: number;
  streakDays: number;
  achievements: string[];
}

export const useVoiceTrainingProgress = () => {
  const [stats, setStats] = useState<VoiceTrainingStats>({
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    totalPracticeTime: 0,
    streakDays: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progress, error } = await supabase
        .from('voice_training_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (progress) {
        const totalExercises = 10; // Total available exercises
        const completedExercises = progress.filter(p => p.completed_phrases === p.total_phrases).length;
        const averageScore = progress.reduce((sum, p) => sum + (p.accuracy_score || 0), 0) / progress.length || 0;
        
        // Calculate achievements based on progress
        const achievements: string[] = [];
        if (completedExercises >= 1) achievements.push('First Steps');
        if (completedExercises >= 5) achievements.push('Halfway There');
        if (completedExercises >= 10) achievements.push('Voice Master');
        if (averageScore >= 90) achievements.push('Perfectionist');
        if (averageScore >= 80) achievements.push('Excellence');

        setStats({
          totalExercises,
          completedExercises,
          averageScore: Math.round(averageScore),
          totalPracticeTime: progress.length * 300, // Estimated 5 minutes per exercise
          streakDays: 1, // Simplified for now
          achievements
        });
      }
    } catch (error) {
      console.error('Error loading voice training progress:', error);
      toast.error('Failed to load training progress');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (exerciseId: string, languageCode: string, score: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('voice_training_progress')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          language_code: languageCode,
          accuracy_score: score,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Reload progress after update
      await loadProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to save progress');
    }
  };

  return {
    stats,
    loading,
    updateProgress,
    refreshProgress: loadProgress
  };
};