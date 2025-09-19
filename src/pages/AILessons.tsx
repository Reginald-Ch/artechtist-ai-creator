import React, { useState, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { enhancedComicLessons } from '@/data/enhancedComicLessons';
import AppNavigation from '@/components/layout/AppNavigation';
import { 
  Brain, 
  BookOpen, 
  MessageCircle, 
  Database, 
  Shield, 
  Bot, 
  Play, 
  Trophy, 
  Star,
  Search,
  TrendingUp,
  BarChart3,
  Bookmark
} from 'lucide-react';
import { useEnhancedLessonProgress } from '@/hooks/useEnhancedLessonProgress';
import { useProgressiveStreak } from '@/hooks/useProgressiveStreak';
import { SearchInterface } from '@/components/enhanced/SearchInterface';
import { ImprovedSearchInterface } from '@/components/enhanced/ImprovedSearchInterface';
import { ProgressAnalytics } from '@/components/enhanced/ProgressAnalytics';
import { AccessibleLessonView } from '@/components/enhanced/AccessibleLessonView';
import { ProgressiveStreak } from '@/components/enhanced/ProgressiveStreak';
import { LessonCardSkeleton, TopicCardSkeleton } from '@/components/enhanced/LoadingStates';
import { Lesson, Topic, SearchResult } from '@/types/lesson';
import { toast } from 'sonner';

const AILessons = () => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'duration' | 'progress'>('title');
  
  const {
    lessonProgress,
    analytics,
    syncStatus,
    isOnline,
    updateProgress,
    completeLesson,
    toggleBookmark,
    exportProgress,
    isLessonCompleted,
    isLessonBookmarked,
    getLessonScore,
    getTotalProgress
  } = useEnhancedLessonProgress();

  const { recordActivity } = useProgressiveStreak();

  // Topics with icons and descriptions
  const topics = useMemo((): Topic[] => [
    {
      id: 'fundamentals',
      title: 'AI Fundamentals',
      icon: Brain,
      description: 'Learn the basics of artificial intelligence',
      lessons: ['intro-to-ai', 'intro-to-ai-ml'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'data',
      title: 'Data & Learning',
      icon: Database,
      description: 'Understanding data in AI systems',
      lessons: ['intro-to-data'],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'ethics',
      title: 'AI Ethics',
      icon: Shield,
      description: 'Building fair and responsible AI',
      lessons: ['intro-to-bias'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'applications',
      title: 'AI Applications',
      icon: Bot,
      description: 'Real-world AI implementations',
      lessons: ['intro-to-chatbots'],
      color: 'from-orange-500 to-orange-600'
    }
  ], []);

  // Enhanced lesson filtering and sorting
  const filteredLessons = useMemo(() => {
    let lessons = Object.values(enhancedComicLessons);
    
    // Filter by search query
    if (searchQuery) {
      lessons = lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.character.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      lessons = lessons.filter(lesson => 
        lesson.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }
    
    // Sort lessons
    lessons.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          return (difficultyOrder[a.difficulty.toLowerCase() as keyof typeof difficultyOrder] || 4) - 
                 (difficultyOrder[b.difficulty.toLowerCase() as keyof typeof difficultyOrder] || 4);
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration);
        case 'progress':
          const scoreA = getLessonScore(a.id);
          const scoreB = getLessonScore(b.id);
          return scoreB - scoreA;
        default:
          return a.title.localeCompare(b.title);
      }
    });
    
    return lessons;
  }, [searchQuery, selectedDifficulty, sortBy, enhancedComicLessons, getLessonScore]);

  // Get lesson details
  const getLessonById = (id: string) => 
    enhancedComicLessons[id as keyof typeof enhancedComicLessons] as any;

  // Calculate progress
  const totalLessons = Object.keys(enhancedComicLessons).length;
  const completedCount = Object.values(lessonProgress).filter(p => p.completed).length;
  const progress = getTotalProgress();
  const averageScore = analytics?.averageScore || 0;

  const handleStartLesson = (lessonId: string) => {
    setSelectedLesson(lessonId);
    updateProgress(lessonId, { currentPanel: 0 });
    toast.success(`Starting lesson: ${getLessonById(lessonId)?.title}`);
  };

  const handleCompleteLesson = (lessonId: string) => {
    const score = Math.floor(Math.random() * 20) + 80; // 80-100% random score
    const lesson = getLessonById(lessonId);
    const category = topics.find(t => t.lessons.includes(lessonId))?.id;
    
    completeLesson(lessonId, score);
    recordActivity('lesson', score, lessonId, category);
    setSelectedLesson(null);
  };

  const handleSearchResult = (result: SearchResult) => {
    if (result.type === 'lesson') {
      handleStartLesson(result.id);
    } else if (result.type === 'panel') {
      const lessonId = result.id.split('-')[0];
      handleStartLesson(lessonId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppNavigation showBackButton={true} title="AI Learning Hub" />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Learning Hub
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master artificial intelligence through interactive lessons, comics, and hands-on practice.
          </p>
          
          {/* Progress Overview */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Progress
              </span>
              <span className="font-medium">{completedCount}/{totalLessons} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Lesson Content */}
        {selectedLesson ? (
          <Suspense fallback={<div className="animate-pulse">Loading lesson...</div>}>
            <AccessibleLessonView 
              lesson={getLessonById(selectedLesson)!} 
              completedLessons={completedCount}
              isBookmarked={isLessonBookmarked(selectedLesson)}
              averageScore={analytics?.averageScore || 0}
              streakDays={analytics?.streakDays || 0}
              onComplete={() => handleCompleteLesson(selectedLesson)}
              onBack={() => setSelectedLesson(null)}
              onToggleBookmark={() => toggleBookmark(selectedLesson)}
            />
          </Suspense>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
                  <TabsTrigger value="browse">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Topics
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    <Star className="w-4 h-4 mr-2" />
                    All Lessons
                  </TabsTrigger>
                  <TabsTrigger value="search">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map(i => <TopicCardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {topics.map((topic) => {
                    const Icon = topic.icon;
                    const topicLessons = topic.lessons.map(getLessonById).filter(Boolean);
                    const topicCompletedCount = topic.lessons.filter(id => isLessonCompleted(id)).length;
                  
                    return (
                      <Card key={topic.id} className="comic-card group cursor-pointer overflow-hidden">
                        <CardHeader className="text-center space-y-4">
                          <div className={`mx-auto p-4 rounded-full bg-gradient-to-br ${topic.color} text-white group-hover:scale-110 transition-transform`}>
                            <Icon className="h-8 w-8" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{topic.title}</CardTitle>
                            <CardDescription>{topic.description}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>{topicLessons.length} lessons</span>
                            <Badge variant="outline">
                              {topicCompletedCount}/{topicLessons.length} done
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {topicLessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-2">
                                  {isLessonCompleted(lesson.id) ? (
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  ) : isLessonBookmarked(lesson.id) ? (
                                    <Bookmark className="h-4 w-4 text-primary fill-current" />
                                  ) : (
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="text-sm font-medium">{lesson.title}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStartLesson(lesson.id)}
                                  className="h-8 px-2"
                                  aria-label={`Start ${lesson.title}`}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              {/* Enhanced Filters and Search */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search lessons..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <select 
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="title">Sort by Title</option>
                    <option value="difficulty">Sort by Difficulty</option>
                    <option value="duration">Sort by Duration</option>
                    <option value="progress">Sort by Progress</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map(i => <LessonCardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLessons.map((lesson) => (
                    <Card key={lesson.id} className="comic-card group hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <CardTitle className="text-lg leading-tight">{lesson.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={getDifficultyColor(lesson.difficulty)}>
                                {lesson.difficulty}
                              </Badge>
                              <Badge variant="outline">{lesson.duration}</Badge>
                              {getLessonScore(lesson.id) > 0 && (
                                <Badge className="bg-green-100 text-green-800">
                                  {getLessonScore(lesson.id)}%
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isLessonCompleted(lesson.id) && (
                              <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            )}
                            {isLessonBookmarked(lesson.id) && (
                              <Bookmark className="h-5 w-5 text-primary fill-current" />
                            )}
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {lesson.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>{lesson.panels.length} panels</span>
                            <MessageCircle className="h-4 w-4 ml-2" />
                            <span>{lesson.flashcards.length} cards</span>
                          </div>
                          <Button 
                            onClick={() => handleStartLesson(lesson.id)}
                            size="sm"
                            className="group-hover:scale-105 transition-transform"
                            aria-label={`Start ${lesson.title}`}
                          >
                            {isLessonCompleted(lesson.id) ? 'Review' : 'Start'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <ImprovedSearchInterface 
                lessons={enhancedComicLessons as Record<string, any>}
                onSelectResult={handleSearchResult}
                isLoading={isLoading}
              />
            </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  {analytics && (
                    <ProgressAnalytics 
                      analytics={analytics}
                      syncStatus={syncStatus}
                      isOnline={isOnline}
                      onExportProgress={exportProgress}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Progressive Learning */}
            <div className="lg:col-span-1">
              <ProgressiveStreak />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILessons;