// TypeScript interfaces for lesson system
export interface Panel {
  id: string;
  character: string;
  dialogue: string;
  action?: string;
  background?: string;
  animation?: string;
  interactiveElement?: InteractiveElement;
}

export interface InteractiveElement {
  type: 'question' | 'quiz' | 'poll';
  content: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
}

export interface Character {
  name: string;
  emoji: string;
  role: string;
  personality: string;
}

export interface Lesson {
  id: string;
  title: string;
  character: string;
  difficulty: string; // Changed from strict union to string for flexibility
  duration: string;
  description: string;
  prerequisites?: string[];
  tags?: string[];
  panels: Panel[];
  flashcards: Flashcard[];
  ageGroup?: 'little-explorers' | 'young-builders' | 'ai-ambassadors';
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  currentPanel: number;
  timeSpent: number;
  attempts: number;
  completedAt?: Date;
  bookmarked?: boolean;
  lastVisited?: Date;
  masteryLevel?: 'none' | 'bronze' | 'silver' | 'gold' | 'master';
  consecutiveHighScores?: number;
  quizAnswers?: Array<{ questionId: string; correct: boolean; timestamp: Date }>;
}

export interface Topic {
  id: string;
  title: string;
  icon: any;
  description: string;
  lessons: string[];
  color?: string;
}

export interface SearchResult {
  type: 'lesson' | 'panel' | 'flashcard';
  id: string;
  title: string;
  content: string;
  relevance: number;
  metadata?: {
    difficulty?: string;
    duration?: string;
    character?: string;
    panelCount?: number;
    flashcardCount?: number;
    lessonTitle?: string;
    answer?: string;
    cardIndex?: number;
    panelIndex?: number;
    category?: string;
    ageGroup?: string;
  };
}