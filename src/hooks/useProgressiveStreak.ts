import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalActiveDays: number;
  weeklyGoal: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  type: 'streak' | 'completion' | 'score' | 'exploration';
  requirement: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🌟', unlocked: false, type: 'completion', requirement: 1 },
  { id: 'week-warrior', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false, type: 'streak', requirement: 7 },
  { id: 'perfect-score', title: 'Perfect Score', description: 'Get 100% on a lesson', icon: '💯', unlocked: false, type: 'score', requirement: 100 },
  { id: 'explorer', title: 'Explorer', description: 'Try 5 different lessons', icon: '🗺️', unlocked: false, type: 'exploration', requirement: 5 },
  { id: 'streak-master', title: 'Streak Master', description: 'Maintain a 30-day streak', icon: '👑', unlocked: false, type: 'streak', requirement: 30 },
  { id: 'lesson-collector', title: 'Lesson Collector', description: 'Complete 10 lessons', icon: '📚', unlocked: false, type: 'completion', requirement: 10 },
  { id: 'consistent-learner', title: 'Consistent Learner', description: 'Learn for 14 days', icon: '⚡', unlocked: false, type: 'streak', requirement: 14 },
  { id: 'high-achiever', title: 'High Achiever', description: 'Get 90%+ on 5 lessons', icon: '🏆', unlocked: false, type: 'score', requirement: 90 }
];

export const useProgressiveStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    totalActiveDays: 0,
    weeklyGoal: 3,
    achievements: ACHIEVEMENTS
  });

  // Load streak data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('progressiveStreak');
    if (saved) {
      const parsedData = JSON.parse(saved);
      setStreakData(prevData => ({
        ...prevData,
        ...parsedData,
        achievements: ACHIEVEMENTS.map(achievement => {
          const saved = parsedData.achievements?.find((a: Achievement) => a.id === achievement.id);
          return saved ? { ...achievement, ...saved } : achievement;
        })
      }));
    }
  }, []);

  // Save streak data to localStorage
  useEffect(() => {
    localStorage.setItem('progressiveStreak', JSON.stringify(streakData));
  }, [streakData]);

  const recordActivity = (activityType: 'lesson' | 'challenge', score?: number) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    setStreakData(prev => {
      let newStreak = prev.currentStreak;
      let newTotalDays = prev.totalActiveDays;

      // Check if we need to update streak
      if (prev.lastActivityDate !== today) {
        if (prev.lastActivityDate === yesterday) {
          // Continue streak
          newStreak += 1;
        } else if (prev.lastActivityDate === null || prev.lastActivityDate !== yesterday) {
          // Start new streak or reset
          newStreak = 1;
        }
        newTotalDays += 1;
      }

      const newData = {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActivityDate: today,
        totalActiveDays: newTotalDays
      };

      // Check for new achievements
      checkAchievements(newData, activityType, score);

      return newData;
    });
  };

  const checkAchievements = (data: StreakData, activityType: string, score?: number) => {
    const newAchievements = [...data.achievements];
    let hasNewAchievement = false;

    newAchievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let shouldUnlock = false;

        switch (achievement.type) {
          case 'streak':
            shouldUnlock = data.currentStreak >= achievement.requirement;
            break;
          case 'completion':
            // This should be passed from the lesson progress hook
            break;
          case 'score':
            shouldUnlock = score ? score >= achievement.requirement : false;
            break;
          case 'exploration':
            // This should be calculated based on different lessons tried
            break;
        }

        if (shouldUnlock) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date();
          hasNewAchievement = true;
          
          toast({
            title: `🎉 Achievement Unlocked!`,
            description: `${achievement.icon} ${achievement.title}: ${achievement.description}`
          });
        }
      }
    });

    if (hasNewAchievement) {
      setStreakData(prev => ({ ...prev, achievements: newAchievements }));
    }
  };

  const getStreakMessage = () => {
    const { currentStreak } = streakData;
    if (currentStreak === 0) return "Start your learning journey today! 🌱";
    if (currentStreak === 1) return "Great start! Keep the momentum going! 🚀";
    if (currentStreak < 7) return `${currentStreak} days strong! You're building a habit! 💪`;
    if (currentStreak < 14) return `Amazing ${currentStreak}-day streak! You're on fire! 🔥`;
    if (currentStreak < 30) return `Incredible ${currentStreak}-day streak! You're a learning machine! ⚡`;
    return `Legendary ${currentStreak}-day streak! You're a master learner! 👑`;
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    // This would need to be calculated based on actual activity data
    return Math.min(streakData.currentStreak, streakData.weeklyGoal);
  };

  const resetStreak = () => {
    setStreakData(prev => ({
      ...prev,
      currentStreak: 0,
      lastActivityDate: null
    }));
  };

  return {
    streakData,
    recordActivity,
    getStreakMessage,
    getWeeklyProgress,
    resetStreak,
    checkAchievements
  };
};