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
  // Beginner achievements
  { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🌟', unlocked: false, type: 'completion', requirement: 1 },
  { id: 'early-bird', title: 'Early Bird', description: 'Start learning before 9 AM', icon: '🌅', unlocked: false, type: 'streak', requirement: 1 },
  { id: 'night-owl', title: 'Night Owl', description: 'Learn after 9 PM', icon: '🦉', unlocked: false, type: 'streak', requirement: 1 },
  
  // Streak achievements
  { id: 'week-warrior', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false, type: 'streak', requirement: 7 },
  { id: 'consistent-learner', title: 'Consistent Learner', description: 'Learn for 14 days', icon: '⚡', unlocked: false, type: 'streak', requirement: 14 },
  { id: 'streak-master', title: 'Streak Master', description: 'Maintain a 30-day streak', icon: '👑', unlocked: false, type: 'streak', requirement: 30 },
  { id: 'legendary-learner', title: 'Legendary Learner', description: 'Maintain a 100-day streak', icon: '🏅', unlocked: false, type: 'streak', requirement: 100 },
  
  // Performance achievements
  { id: 'perfect-score', title: 'Perfect Score', description: 'Get 100% on a lesson', icon: '💯', unlocked: false, type: 'score', requirement: 100 },
  { id: 'high-achiever', title: 'High Achiever', description: 'Get 90%+ on 5 lessons', icon: '🏆', unlocked: false, type: 'score', requirement: 90 },
  { id: 'speed-demon', title: 'Speed Demon', description: 'Complete a lesson in under 5 minutes', icon: '⚡', unlocked: false, type: 'completion', requirement: 1 },
  
  // Exploration achievements
  { id: 'explorer', title: 'Explorer', description: 'Try 5 different lessons', icon: '🗺️', unlocked: false, type: 'exploration', requirement: 5 },
  { id: 'lesson-collector', title: 'Lesson Collector', description: 'Complete 10 lessons', icon: '📚', unlocked: false, type: 'completion', requirement: 10 },
  { id: 'knowledge-seeker', title: 'Knowledge Seeker', description: 'Complete lessons in all categories', icon: '🧠', unlocked: false, type: 'exploration', requirement: 4 },
  
  // Social achievements
  { id: 'comeback-kid', title: 'Comeback Kid', description: 'Return after a 7-day break', icon: '💪', unlocked: false, type: 'streak', requirement: 1 },
  { id: 'weekend-warrior', title: 'Weekend Warrior', description: 'Learn on weekends', icon: '🏖️', unlocked: false, type: 'streak', requirement: 2 },
  { id: 'study-buddy', title: 'Study Buddy', description: 'Share your progress', icon: '👥', unlocked: false, type: 'completion', requirement: 1 }
];

export const useProgressiveStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    totalActiveDays: 0,
    weeklyGoal: 5, // Increased default goal
    achievements: ACHIEVEMENTS
  });

  const [lessonsCompleted, setLessonsCompleted] = useState<string[]>([]);
  const [categoriesExplored, setCategoriesExplored] = useState<Set<string>>(new Set());
  const [perfectScores, setPerfectScores] = useState<number>(0);
  const [highScores, setHighScores] = useState<number>(0);

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

  const recordActivity = (activityType: 'lesson' | 'challenge' | 'code_run' | 'project', score?: number, lessonId?: string, category?: string) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const currentHour = new Date().getHours();

    setStreakData(prev => {
      let newStreak = prev.currentStreak;
      let newTotalDays = prev.totalActiveDays;
      let shouldCelebrate = false;

      // Track lesson completion
      if (lessonId && !lessonsCompleted.includes(lessonId)) {
        setLessonsCompleted(prev => [...prev, lessonId]);
      }

      // Track category exploration
      if (category) {
        setCategoriesExplored(prev => new Set([...prev, category]));
      }

      // Track score achievements
      if (score === 100) {
        setPerfectScores(prev => prev + 1);
      }
      if (score && score >= 90) {
        setHighScores(prev => prev + 1);
      }

      // Check if we need to update streak
      if (prev.lastActivityDate !== today) {
        // Check for comeback achievement
        if (prev.lastActivityDate) {
          const lastDate = new Date(prev.lastActivityDate);
          const daysDiff = (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysDiff >= 7) {
            // Comeback after a week
            checkSpecialAchievement('comeback-kid');
          }
        }

        if (prev.lastActivityDate === yesterday) {
          // Continue streak
          newStreak += 1;
          shouldCelebrate = newStreak % 7 === 0; // Celebrate weekly milestones
        } else if (prev.lastActivityDate === null || prev.lastActivityDate !== yesterday) {
          // Start new streak or reset
          newStreak = 1;
        }
        newTotalDays += 1;
      }

      // Check time-based achievements
      if (currentHour < 9) {
        checkSpecialAchievement('early-bird');
      } else if (currentHour >= 21) {
        checkSpecialAchievement('night-owl');
      }

      // Check weekend achievement
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        checkSpecialAchievement('weekend-warrior');
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

      // Show celebration for milestones
      if (shouldCelebrate) {
        toast({
          title: `🎉 ${newStreak}-Day Streak!`,
          description: `You're on fire! Keep up the amazing work!`
        });
      }

      return newData;
    });
  };

  const checkSpecialAchievement = (achievementId: string) => {
    setStreakData(prev => {
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        const newAchievements = prev.achievements.map(a => 
          a.id === achievementId 
            ? { ...a, unlocked: true, unlockedAt: new Date() }
            : a
        );
        
        toast({
          title: `🎉 Achievement Unlocked!`,
          description: `${achievement.icon} ${achievement.title}: ${achievement.description}`
        });

        return { ...prev, achievements: newAchievements };
      }
      return prev;
    });
  };

  const checkAchievements = (data: StreakData, activityType: string, score?: number) => {
    const newAchievements = [...data.achievements];
    let hasNewAchievement = false;

    newAchievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let shouldUnlock = false;

        switch (achievement.id) {
          case 'first-lesson':
            shouldUnlock = lessonsCompleted.length >= 1;
            break;
          case 'lesson-collector':
            shouldUnlock = lessonsCompleted.length >= 10;
            break;
          case 'knowledge-seeker':
            shouldUnlock = categoriesExplored.size >= 4;
            break;
          case 'explorer':
            shouldUnlock = lessonsCompleted.length >= 5;
            break;
          case 'perfect-score':
            shouldUnlock = perfectScores >= 1;
            break;
          case 'high-achiever':
            shouldUnlock = highScores >= 5;
            break;
          case 'week-warrior':
          case 'consistent-learner':
          case 'streak-master':
          case 'legendary-learner':
            shouldUnlock = data.currentStreak >= achievement.requirement;
            break;
          default:
            // Handle other achievements based on type
            switch (achievement.type) {
              case 'streak':
                shouldUnlock = data.currentStreak >= achievement.requirement;
                break;
              case 'score':
                shouldUnlock = score ? score >= achievement.requirement : false;
                break;
            }
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
    
    // Calculate actual weekly progress based on activity
    const thisWeekDays = Math.min(streakData.currentStreak, 7);
    return Math.min(thisWeekDays, streakData.weeklyGoal);
  };

  const getMotivationalMessage = () => {
    const { currentStreak } = streakData;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    
    if (currentStreak === 0) return `${greeting}! Ready to start your learning journey? 🌱`;
    if (currentStreak === 1) return `${greeting}! Great start! Let's keep the momentum going! 🚀`;
    if (currentStreak < 7) return `${greeting}! ${currentStreak} days strong! You're building an amazing habit! 💪`;
    if (currentStreak < 14) return `${greeting}! Incredible ${currentStreak}-day streak! You're absolutely on fire! 🔥`;
    if (currentStreak < 30) return `${greeting}! WOW! ${currentStreak} days! You're a true learning machine! ⚡`;
    return `${greeting}, Master! Your ${currentStreak}-day streak is absolutely legendary! 👑`;
  };

  const shareProgress = () => {
    const text = `I've been learning consistently for ${streakData.currentStreak} days! 🔥 Join me on this amazing journey! #LearningStreak #AI #Education`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Learning Streak',
        text,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Progress copied to clipboard!",
        description: "Share your achievement with friends!"
      });
    }
    
    checkSpecialAchievement('study-buddy');
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
    getMotivationalMessage,
    shareProgress,
    resetStreak,
    checkAchievements,
    checkSpecialAchievement,
    lessonsCompleted,
    categoriesExplored: Array.from(categoriesExplored),
    perfectScores,
    highScores
  };
};