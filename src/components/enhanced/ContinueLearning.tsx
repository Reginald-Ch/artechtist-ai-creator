import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, BookOpen } from 'lucide-react';
import { Lesson, LessonProgress } from '@/types/lesson';

interface ContinueLearningProps {
  lessons: Lesson[];
  progress: Record<string, LessonProgress>;
  onStartLesson: (lessonId: string) => void;
}

export const ContinueLearning = ({ lessons, progress, onStartLesson }: ContinueLearningProps) => {
  // Find the most recently accessed incomplete lesson
  const continueLesson = React.useMemo(() => {
    const inProgressLessons = lessons.filter(lesson => {
      const lessonProgress = progress[lesson.id];
      return lessonProgress && 
             !lessonProgress.completed && 
             lessonProgress.currentPanel > 0 &&
             lessonProgress.lastVisited;
    });

    if (inProgressLessons.length === 0) return null;

    // Sort by most recent access
    return inProgressLessons.sort((a, b) => {
      const aTime = progress[a.id]?.lastVisited?.getTime() || 0;
      const bTime = progress[b.id]?.lastVisited?.getTime() || 0;
      return bTime - aTime;
    })[0];
  }, [lessons, progress]);

  if (!continueLesson) return null;

  const lessonProgress = progress[continueLesson.id];
  const progressPercentage = ((lessonProgress.currentPanel + 1) / continueLesson.panels.length) * 100;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Continue Learning
            </CardTitle>
            <CardDescription className="mt-1">
              Pick up where you left off
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            In Progress
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{continueLesson.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {continueLesson.description}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-blue-100 text-blue-800">
                  {continueLesson.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {continueLesson.duration}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {continueLesson.panels.length} panels
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Panel {lessonProgress.currentPanel + 1} of {continueLesson.panels.length}
              </span>
              <span className="font-medium">{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Button 
            onClick={() => onStartLesson(continueLesson.id)}
            className="w-full bg-gradient-to-r from-primary to-primary-glow"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Continue Lesson
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
