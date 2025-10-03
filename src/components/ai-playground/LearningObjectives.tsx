import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Lightbulb, Clock } from 'lucide-react';

interface LearningObjective {
  text: string;
  icon?: string;
}

interface LearningObjectivesProps {
  title: string;
  objectives: LearningObjective[];
  prerequisites?: string[];
  realWorldApplications: string[];
  estimatedTime: string;
  difficulty: string;
}

export const LearningObjectives: React.FC<LearningObjectivesProps> = ({
  title,
  objectives,
  prerequisites,
  realWorldApplications,
  estimatedTime,
  difficulty
}) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'easy': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-2 animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Learning Objectives</CardTitle>
              <CardDescription>What you'll learn from {title}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {estimatedTime}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* What You'll Learn */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" />
            What You'll Learn
          </div>
          <ul className="space-y-2 ml-6">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">{objective.icon || '✓'}</span>
                <span>{objective.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prerequisites (if any) */}
        {prerequisites && prerequisites.length > 0 && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              Recommended Prerequisites
            </div>
            <div className="flex flex-wrap gap-2 ml-6">
              {prerequisites.map((prereq, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Real-World Applications */}
        <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Lightbulb className="h-4 w-4 text-primary" />
            Where You've Seen This in Real Life
          </div>
          <ul className="space-y-2 ml-6">
            {realWorldApplications.map((app, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">🌍</span>
                <span>{app}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
