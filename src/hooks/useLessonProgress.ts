import { useState, useEffect } from 'react';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  currentPanel: number;
  timeSpent: number;
  attempts: number;
  completedAt?: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

export const useLessonProgress = () => {
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [learningPaths, setLearningPaths] = useState<Record<string, LearningPath>>({
    fundamentals: {
      id: 'fundamentals',
      name: 'AI Fundamentals',
      description: 'Learn the basics of artificial intelligence',
      totalLessons: 3,
      completedLessons: 0,
      progress: 0,
    },
    applications: {
      id: 'applications',
      name: 'AI Applications',
      description: 'Explore real-world AI applications',
      totalLessons: 2,
      completedLessons: 0,
      progress: 0,
    },
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lessonProgress');
    if (saved) {
      setLessonProgress(JSON.parse(saved));
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lessonProgress', JSON.stringify(lessonProgress));
    updateLearningPaths();
  }, [lessonProgress]);

  const updateLearningPaths = () => {
    const paths = { ...learningPaths };
    
    Object.keys(paths).forEach(pathId => {
      const pathLessons = Object.values(lessonProgress).filter(p => {
        // You would need to map lessons to paths here
        if (pathId === 'fundamentals') {
          return ['what-is-ai', 'machine-learning', 'neural-networks'].includes(p.lessonId);
        }
        if (pathId === 'applications') {
          return ['computer-vision', 'deep-learning'].includes(p.lessonId);
        }
        return false;
      });
      
      const completed = pathLessons.filter(p => p.completed).length;
      paths[pathId].completedLessons = completed;
      paths[pathId].progress = (completed / paths[pathId].totalLessons) * 100;
    });
    
    setLearningPaths(paths);
  };

  const updateProgress = (lessonId: string, updates: Partial<LessonProgress>) => {
    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: {
        lessonId,
        completed: false,
        score: 0,
        currentPanel: 0,
        timeSpent: 0,
        attempts: 0,
        ...prev[lessonId],
        ...updates,
      },
    }));
  };

  const completeLesson = (lessonId: string, score: number) => {
    updateProgress(lessonId, {
      completed: true,
      score,
      completedAt: new Date(),
      attempts: (lessonProgress[lessonId]?.attempts || 0) + 1,
    });
  };

  const isLessonUnlocked = (lessonId: string, prerequisites?: string[]) => {
    if (!prerequisites || prerequisites.length === 0) return true;
    
    return prerequisites.every(prereqId => 
      lessonProgress[prereqId]?.completed === true
    );
  };

  const getLessonScore = (lessonId: string) => {
    return lessonProgress[lessonId]?.score || 0;
  };

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress[lessonId]?.completed || false;
  };

  const getTotalProgress = () => {
    const total = Object.keys(lessonProgress).length;
    const completed = Object.values(lessonProgress).filter(p => p.completed).length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getAverageScore = () => {
    const completedLessons = Object.values(lessonProgress).filter(p => p.completed);
    if (completedLessons.length === 0) return 0;
    
    const totalScore = completedLessons.reduce((sum, lesson) => sum + lesson.score, 0);
    return Math.round(totalScore / completedLessons.length);
  };

  return {
    lessonProgress,
    learningPaths: Object.values(learningPaths),
    updateProgress,
    completeLesson,
    isLessonUnlocked,
    getLessonScore,
    isLessonCompleted,
    getTotalProgress,
    getAverageScore,
  };
};