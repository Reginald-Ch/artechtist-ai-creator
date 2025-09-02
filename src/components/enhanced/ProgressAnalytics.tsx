import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Star,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';

interface AnalyticsData {
  totalTimeSpent: number;
  averageScore: number;
  completionRate: number;
  streakDays: number;
  weakAreas: string[];
  strongAreas: string[];
}

interface ProgressAnalyticsProps {
  analytics: AnalyticsData;
  syncStatus: 'idle' | 'syncing' | 'error';
  isOnline: boolean;
  onExportProgress: () => void;
}

export const ProgressAnalytics = ({ 
  analytics, 
  syncStatus, 
  isOnline, 
  onExportProgress 
}: ProgressAnalyticsProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSyncStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    if (syncStatus === 'syncing') return <div className="w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />;
    if (syncStatus === 'error') return <WifiOff className="w-4 h-4 text-destructive" />;
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  const getSyncStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'error') return 'Sync failed';
    return 'Synced';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Learning Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(analytics.totalTimeSpent)}</div>
          <p className="text-xs text-muted-foreground">
            Total time invested
          </p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageScore}%</div>
          <p className="text-xs text-muted-foreground">
            Across all completed lessons
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.completionRate}%</div>
          <Progress value={analytics.completionRate} className="mt-2" />
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.streakDays}</div>
          <p className="text-xs text-muted-foreground">
            {analytics.streakDays === 1 ? 'day' : 'days'} in a row
          </p>
        </CardContent>
      </Card>

      {/* Strong Areas */}
      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Strong Areas
          </CardTitle>
          <CardDescription>Topics you're excelling in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.strongAreas.length > 0 ? (
              analytics.strongAreas.map((area, index) => (
                <Badge key={index} className="bg-green-100 text-green-800">
                  {area}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete more lessons to identify your strengths
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas */}
      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Areas for Improvement
          </CardTitle>
          <CardDescription>Topics that need more practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.weakAreas.length > 0 ? (
              analytics.weakAreas.map((area, index) => (
                <Badge key={index} variant="outline" className="border-orange-200 text-orange-700">
                  {area}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Great job! No weak areas identified yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export & Sync Status */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
          <CardDescription>Export your progress and sync status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSyncStatusIcon()}
              <span className="text-sm text-muted-foreground">
                {getSyncStatusText()}
              </span>
            </div>
            <Button onClick={onExportProgress} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};