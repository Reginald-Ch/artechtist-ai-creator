import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Star,
  Download,
  BarChart3,
  Calendar,
  Brain
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { LessonProgress } from '@/types/lesson';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface EnhancedAnalyticsData {
  totalTimeSpent: number;
  averageScore: number;
  completionRate: number;
  streakDays: number;
  weakAreas: Array<{ topic: string; avgScore: number; count: number }>;
  strongAreas: Array<{ topic: string; avgScore: number; count: number }>;
  progressOverTime: Array<{ date: string; lessonsCompleted: number; avgScore: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  timeByTopic: Array<{ topic: string; minutes: number }>;
  peakLearningHours: Array<{ hour: number; sessions: number }>;
}

interface EnhancedProgressAnalyticsProps {
  analytics: EnhancedAnalyticsData;
  syncStatus: 'idle' | 'syncing' | 'error';
  isOnline: boolean;
  onExportProgress: () => void;
}

export const EnhancedProgressAnalytics = ({ 
  analytics, 
  syncStatus, 
  isOnline, 
  onExportProgress 
}: EnhancedProgressAnalyticsProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary-glow))', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Learning Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analytics.totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
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
            <Progress value={analytics.averageScore} className="mt-2" />
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
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.streakDays === 1 ? 'day' : 'days'} in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="topics">
            <Brain className="h-4 w-4 mr-2" />
            Topics
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Star className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Progress Over Time */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="lessonsCompleted" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Lessons Completed"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="hsl(var(--primary-glow))" 
                    strokeWidth={2}
                    name="Average Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Learning Hours</CardTitle>
              <CardDescription>When you're most productive</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.peakLearningHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Learning Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>How your scores are distributed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.scoreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Analysis */}
        <TabsContent value="topics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Strong Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Strong Areas
                </CardTitle>
                <CardDescription>Topics you're excelling in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.strongAreas.length > 0 ? (
                    analytics.strongAreas.map((area, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{area.topic}</span>
                          <Badge className="bg-green-100 text-green-800">
                            {area.avgScore}%
                          </Badge>
                        </div>
                        <Progress value={area.avgScore} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {area.count} {area.count === 1 ? 'lesson' : 'lessons'} completed
                        </p>
                      </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Growth Opportunities
                </CardTitle>
                <CardDescription>Topics that need more practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.weakAreas.length > 0 ? (
                    analytics.weakAreas.map((area, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{area.topic}</span>
                          <Badge variant="outline" className="border-orange-200 text-orange-700">
                            {area.avgScore}%
                          </Badge>
                        </div>
                        <Progress value={area.avgScore} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {area.count} {area.count === 1 ? 'lesson' : 'lessons'} completed
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Great job! No weak areas identified yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Time Spent by Topic</CardTitle>
              <CardDescription>Where you're investing your learning time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.timeByTopic} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="topic" type="category" width={150} />
                  <Tooltip formatter={(value) => formatTime(value as number)} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" name="Time Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Insights</CardTitle>
              <CardDescription>Personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.averageScore >= 85 && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Excellent Performance!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your average score of {analytics.averageScore}% shows strong understanding. 
                        Consider tackling more advanced topics.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analytics.streakDays >= 7 && (
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900">Consistency Champion!</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        You've maintained a {analytics.streakDays}-day learning streak. 
                        Consistent practice is the key to mastery!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analytics.weakAreas.length > 0 && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Focus Areas</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Consider reviewing {analytics.weakAreas[0].topic} - 
                        spending more time here could boost your overall understanding.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analytics.completionRate >= 80 && (
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900">Almost There!</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        You're {analytics.completionRate}% through the curriculum. 
                        Just a few more lessons to complete!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export & Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
          <CardDescription>Export your progress and check sync status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <SyncStatusIndicator syncStatus={syncStatus} isOnline={isOnline} />
            <Button onClick={onExportProgress} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
