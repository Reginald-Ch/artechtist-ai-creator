import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  freezeDaysRemaining: number;
  freezeDaysUsedThisMonth: number;
  totalActivities: number;
  streakHistory: Array<{ date: string; maintained: boolean }>;
}

interface ActivityData {
  activityType: string;
  timeSpent: number;
  score?: number;
  lessonId?: string;
  category?: string;
}

const MINIMUM_TIME_SPENT = 120; // 2 minutes minimum
const MINIMUM_SCORE = 50; // 50% minimum score for quiz activities
const COOLDOWN_PERIOD = 3600000; // 1 hour in milliseconds

export const useRobustStreak = () => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState<number>(0);

  // Load streak data
  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        throw error;
      }

      if (data) {
        setStreakData({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          lastActivityDate: data.last_activity_date,
        freezeDaysRemaining: data.freeze_days_remaining,
        freezeDaysUsedThisMonth: data.freeze_days_used_this_month,
        totalActivities: data.total_activities,
        streakHistory: (data.streak_history as any) || []
      });
      } else {
        // Initialize streak for new user
        await initializeStreak(user.id);
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeStreak = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString().split('T')[0],
          freeze_days_remaining: 3,
          freeze_days_used_this_month: 0,
          total_activities: 0,
          streak_history: []
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: data.last_activity_date,
          freezeDaysRemaining: 3,
          freezeDaysUsedThisMonth: 0,
          totalActivities: 0,
          streakHistory: []
        });
      }
    } catch (error) {
      console.error('Failed to initialize streak:', error);
    }
  };

  const validateActivity = (activity: ActivityData): { valid: boolean; reason?: string } => {
    // Check minimum time spent
    if (activity.timeSpent < MINIMUM_TIME_SPENT) {
      return {
        valid: false,
        reason: `Activity must last at least ${MINIMUM_TIME_SPENT / 60} minutes`
      };
    }

    // Check score for quiz/lesson activities
    if (activity.activityType === 'lesson' && activity.score !== undefined) {
      if (activity.score < MINIMUM_SCORE) {
        return {
          valid: false,
          reason: `Score must be at least ${MINIMUM_SCORE}%`
        };
      }
    }

    // Check cooldown period
    const now = Date.now();
    if (now - lastActivityTime < COOLDOWN_PERIOD) {
      const remainingMinutes = Math.ceil((COOLDOWN_PERIOD - (now - lastActivityTime)) / 60000);
      return {
        valid: false,
        reason: `Please wait ${remainingMinutes} minutes before next activity`
      };
    }

    return { valid: true };
  };

  const recordActivity = useCallback(async (activity: ActivityData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to track activities');
        return false;
      }

      // Validate activity
      const validation = validateActivity(activity);
      if (!validation.valid) {
        toast.error(validation.reason || 'Activity validation failed');
        return false;
      }

      const today = new Date().toISOString().split('T')[0];

      // Log the activity
      const { error: logError } = await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          activity_type: activity.activityType,
          activity_date: today,
          time_spent: activity.timeSpent,
          score: activity.score,
          lesson_id: activity.lessonId,
          category: activity.category
        });

      if (logError) throw logError;

      // Update last activity time
      setLastActivityTime(Date.now());

      // Update streak
      await updateStreak(user.id, today);

      return true;
    } catch (error) {
      console.error('Failed to record activity:', error);
      toast.error('Failed to record activity');
      return false;
    }
  }, [lastActivityTime]);

  const updateStreak = async (userId: string, activityDate: string) => {
    try {
      if (!streakData) return;

      const lastDate = new Date(streakData.lastActivityDate);
      const currentDate = new Date(activityDate);
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = streakData.currentStreak;
      let streakBroken = false;

      if (daysDiff === 0) {
        // Same day, no change to streak
        return;
      } else if (daysDiff === 1) {
        // Consecutive day, increase streak
        newStreak = streakData.currentStreak + 1;
      } else if (daysDiff > 1) {
        // Streak broken, reset to 1
        newStreak = 1;
        streakBroken = true;
      }

      const newLongest = Math.max(newStreak, streakData.longestStreak);

      // Update streak history
      const newHistory = [...streakData.streakHistory, {
        date: activityDate,
        maintained: !streakBroken
      }];

      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: activityDate,
          total_activities: streakData.totalActivities + 1,
          streak_history: newHistory
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setStreakData({
        ...streakData,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: activityDate,
        totalActivities: streakData.totalActivities + 1,
        streakHistory: newHistory
      });

      // Show streak milestone notifications
      if (newStreak % 7 === 0 && newStreak > 0) {
        toast.success(`🔥 ${newStreak} day streak! Amazing consistency!`);
      } else if (newStreak === newLongest && newStreak > 3) {
        toast.success(`🏆 New record! ${newStreak} days is your longest streak!`);
      }

      if (streakBroken && streakData.currentStreak > 3) {
        toast.error(`Streak broken! But you can start fresh. Your best was ${streakData.longestStreak} days.`);
      }
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  const useFreezeDay = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !streakData) return false;

      if (streakData.freezeDaysRemaining <= 0) {
        toast.error('No freeze days remaining');
        return false;
      }

      const today = new Date().toISOString().split('T')[0];
      const lastDate = new Date(streakData.lastActivityDate);
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        toast.error('Freeze day can only be used when you miss a day');
        return false;
      }

      const { error } = await supabase
        .from('user_streaks')
        .update({
          freeze_days_remaining: streakData.freezeDaysRemaining - 1,
          freeze_days_used_this_month: streakData.freezeDaysUsedThisMonth + 1,
          last_activity_date: today
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setStreakData({
        ...streakData,
        freezeDaysRemaining: streakData.freezeDaysRemaining - 1,
        freezeDaysUsedThisMonth: streakData.freezeDaysUsedThisMonth + 1,
        lastActivityDate: today
      });

      toast.success('❄️ Freeze day used! Your streak is protected.');
      return true;
    } catch (error) {
      console.error('Failed to use freeze day:', error);
      toast.error('Failed to use freeze day');
      return false;
    }
  }, [streakData]);

  const resetMonthlyFreezedays = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !streakData) return;

      const { error } = await supabase
        .from('user_streaks')
        .update({
          freeze_days_remaining: 3,
          freeze_days_used_this_month: 0
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setStreakData({
        ...streakData,
        freezeDaysRemaining: 3,
        freezeDaysUsedThisMonth: 0
      });

      toast.success('Freeze days refreshed for the month!');
    } catch (error) {
      console.error('Failed to reset freeze days:', error);
    }
  }, [streakData]);

  return {
    streakData,
    isLoading,
    recordActivity,
    useFreezeDay,
    resetMonthlyFreezedays,
    canUseActivity: () => {
      const now = Date.now();
      return now - lastActivityTime >= COOLDOWN_PERIOD;
    },
    getCooldownRemaining: () => {
      const now = Date.now();
      const remaining = COOLDOWN_PERIOD - (now - lastActivityTime);
      return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
    }
  };
};
