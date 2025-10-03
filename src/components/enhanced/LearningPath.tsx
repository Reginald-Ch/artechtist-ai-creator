import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Play,
  ArrowRight 
} from 'lucide-react';
import { Lesson, LessonProgress, Topic } from '@/types/lesson';

interface LearningPathProps {
  topics: Topic[];
  lessons: Record<string, Lesson>;
  progress: Record<string, LessonProgress>;
  onStartLesson: (lessonId: string) => void;
}

export const LearningPath = ({ topics, lessons, progress, onStartLesson }: LearningPathProps) => {
  const getTopicProgress = (topic: Topic) => {
    const completedCount = topic.lessons.filter(lessonId => 
      progress[lessonId]?.completed
    ).length;
    return {
      completed: completedCount,
      total: topic.lessons.length,
      percentage: (completedCount / topic.lessons.length) * 100
    };
  };

  const isLessonUnlocked = (lessonId: string, index: number, topicLessons: string[]) => {
    // First lesson in any topic is always unlocked
    if (index === 0) return true;
    
    // Check if previous lesson is completed
    const previousLessonId = topicLessons[index - 1];
    return progress[previousLessonId]?.completed || false;
  };

  const getLessonStatus = (lessonId: string, index: number, topicLessons: string[]) => {
    const lessonProgress = progress[lessonId];
    
    if (lessonProgress?.completed) {
      return { status: 'completed', icon: CheckCircle2, color: 'text-green-500' };
    }
    
    if (lessonProgress && lessonProgress.currentPanel > 0) {
      return { status: 'in-progress', icon: Circle, color: 'text-blue-500' };
    }
    
    const unlocked = isLessonUnlocked(lessonId, index, topicLessons);
    if (unlocked) {
      return { status: 'available', icon: Circle, color: 'text-muted-foreground' };
    }
    
    return { status: 'locked', icon: Lock, color: 'text-muted-foreground/50' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Your Learning Path
          </CardTitle>
          <CardDescription>
            Follow the suggested progression to master AI concepts
          </CardDescription>
        </CardHeader>
      </Card>

      {topics.map((topic, topicIndex) => {
        const Icon = topic.icon;
        const topicProgress = getTopicProgress(topic);
        const isTopicComplete = topicProgress.completed === topicProgress.total;
        
        return (
          <Card key={topic.id} className={isTopicComplete ? 'border-green-200 bg-green-50/50' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${topic.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={isTopicComplete ? 'default' : 'outline'}>
                        {topicProgress.completed}/{topicProgress.total} completed
                      </Badge>
                      {isTopicComplete && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topic.lessons.map((lessonId, lessonIndex) => {
                  const lesson = lessons[lessonId];
                  if (!lesson) return null;

                  const { status, icon: StatusIcon, color } = getLessonStatus(
                    lessonId, 
                    lessonIndex, 
                    topic.lessons
                  );
                  const lessonProgress = progress[lessonId];
                  const isUnlocked = status !== 'locked';

                  return (
                    <div 
                      key={lessonId}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isUnlocked 
                          ? 'hover:shadow-md hover:border-primary/50 cursor-pointer bg-background' 
                          : 'opacity-50 bg-muted/30'
                      }`}
                    >
                      {/* Status Indicator */}
                      <div className="flex items-center">
                        <StatusIcon className={`h-5 w-5 ${color}`} />
                        {lessonIndex < topic.lessons.length - 1 && (
                          <div className="h-8 w-0.5 bg-border ml-2 mt-2" />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${!isUnlocked ? 'text-muted-foreground' : ''}`}>
                            {lesson.title}
                          </h4>
                          {status === 'in-progress' && lessonProgress && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(((lessonProgress.currentPanel + 1) / lesson.panels.length) * 100)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lesson.difficulty} • {lesson.duration}
                        </p>
                      </div>

                      {/* Action Button */}
                      {isUnlocked && (
                        <Button
                          onClick={() => onStartLesson(lessonId)}
                          size="sm"
                          variant={status === 'completed' ? 'outline' : 'default'}
                        >
                          {status === 'completed' ? (
                            <>Review</>
                          ) : status === 'in-progress' ? (
                            <>Continue</>
                          ) : (
                            <>Start</>
                          )}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
