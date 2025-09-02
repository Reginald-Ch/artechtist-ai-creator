import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, Star } from 'lucide-react';

interface VoiceTrainingStatsProps {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalPracticeTime: number;
  streakDays: number;
  achievements: string[];
}

const VoiceTrainingStats: React.FC<VoiceTrainingStatsProps> = ({
  totalExercises,
  completedExercises,
  averageScore,
  totalPracticeTime,
  streakDays,
  achievements
}) => {
  const completionPercentage = (completedExercises / totalExercises) * 100;
  const hours = Math.floor(totalPracticeTime / 3600);
  const minutes = Math.floor((totalPracticeTime % 3600) / 60);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedExercises}/{totalExercises}</div>
          <Progress value={completionPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {completionPercentage.toFixed(1)}% complete
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageScore}%</div>
          <Badge 
            variant={averageScore >= 80 ? "default" : averageScore >= 60 ? "secondary" : "destructive"}
            className="mt-2"
          >
            {averageScore >= 80 ? "Excellent" : averageScore >= 60 ? "Good" : "Needs Practice"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {hours}h {minutes}m
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {streakDays} day streak
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Achievements</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{achievements.length}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {achievements.slice(0, 3).map((achievement, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {achievement}
              </Badge>
            ))}
            {achievements.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{achievements.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceTrainingStats;