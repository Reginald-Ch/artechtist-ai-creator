import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, BookOpen, TrendingUp, Star } from 'lucide-react';
import { Lesson, LessonProgress } from '@/types/lesson';

interface RecommendedLessonsProps {
  lessons: Lesson[];
  progress: Record<string, LessonProgress>;
  onStartLesson: (lessonId: string) => void;
}

export const RecommendedLessons = ({ lessons, progress, onStartLesson }: RecommendedLessonsProps) => {
  // Calculate recommendations based on completed lessons and scores
  const recommendations = React.useMemo(() => {
    const completedLessons = lessons.filter(lesson => 
      progress[lesson.id]?.completed
    );

    const incompleteLessons = lessons.filter(lesson => 
      !progress[lesson.id]?.completed
    );

    if (completedLessons.length === 0) {
      // New users - recommend beginner lessons
      return incompleteLessons
        .filter(lesson => lesson.difficulty.toLowerCase() === 'beginner')
        .slice(0, 3);
    }

    // Analyze completed lesson topics and difficulties
    const avgScore = completedLessons.reduce((sum, lesson) => 
      sum + (progress[lesson.id]?.score || 0), 0
    ) / completedLessons.length;

    // Recommend next difficulty level if doing well
    const shouldLevelUp = avgScore > 75 && completedLessons.length >= 3;
    
    // Get the highest difficulty completed
    const completedDifficulties = completedLessons.map(l => l.difficulty.toLowerCase());
    const hasCompleted = {
      beginner: completedDifficulties.includes('beginner'),
      intermediate: completedDifficulties.includes('intermediate'),
      advanced: completedDifficulties.includes('advanced')
    };

    let targetDifficulty = 'beginner';
    if (shouldLevelUp) {
      if (!hasCompleted.intermediate) {
        targetDifficulty = 'intermediate';
      } else if (!hasCompleted.advanced) {
        targetDifficulty = 'advanced';
      }
    }

    // Find similar incomplete lessons
    const recommended = incompleteLessons
      .filter(lesson => {
        const difficulty = lesson.difficulty.toLowerCase();
        // Recommend lessons at the target difficulty or one level below
        if (targetDifficulty === 'intermediate') {
          return difficulty === 'intermediate' || difficulty === 'beginner';
        } else if (targetDifficulty === 'advanced') {
          return difficulty === 'advanced' || difficulty === 'intermediate';
        }
        return difficulty === 'beginner';
      })
      .slice(0, 3);

    return recommended;
  }, [lessons, progress]);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended for You
          </CardTitle>
          <CardDescription>
            You've completed all available lessons! Great job! 🎉
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
        </CardTitle>
        <CardDescription>
          Based on your learning progress and interests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((lesson, index) => (
            <Card key={lesson.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="bg-primary/5">
                    #{index + 1} Pick
                  </Badge>
                  {index === 0 && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <CardTitle className="text-base leading-tight line-clamp-2">
                  {lesson.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(lesson.difficulty)}>
                    {lesson.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lesson.duration}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {lesson.description}
                </p>
                <Button 
                  onClick={() => onStartLesson(lesson.id)}
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                  variant="outline"
                >
                  Start Lesson
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
