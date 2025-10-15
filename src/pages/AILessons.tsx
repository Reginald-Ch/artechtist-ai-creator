import React, { useState, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { enhancedComicLessons } from '@/data/enhancedComicLessons';
import { ageLevelLessons } from '@/data/ageLevelLessons';
import { ai4k12Lessons } from '@/data/ai4k12Lessons';
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
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { AccessibleLessonView } from '@/components/enhanced/AccessibleLessonView';
import { EnhancedFlashcardStudy } from '@/components/enhanced/EnhancedFlashcardStudy';
import { EnhancedProgressAnalytics } from '@/components/enhanced/EnhancedProgressAnalytics';
import { AdvancedSearch } from '@/components/enhanced/AdvancedSearch';
import { SimpleStreak } from '@/components/enhanced/SimpleStreak';
import { SyncStatusIndicator } from '@/components/enhanced/SyncStatusIndicator';
import { ContinueLearning } from '@/components/enhanced/ContinueLearning';
import { RecommendedLessons } from '@/components/enhanced/RecommendedLessons';
import { LearningPath } from '@/components/enhanced/LearningPath';
import { LessonCardSkeleton, TopicCardSkeleton } from '@/components/enhanced/LoadingStates';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { MasteryBadge } from '@/components/enhanced/MasteryBadge';
import { DailyGoals } from '@/components/enhanced/DailyGoals';
import { AchievementSystem } from '@/components/enhanced/AchievementSystem';
import { MobileNavigation } from '@/components/enhanced/MobileNavigation';
import { ErrorBoundary } from '@/components/enhanced/ErrorBoundary';
import { Lesson, Topic, SearchResult } from '@/types/lesson';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const AILessons = () => {
  const { t } = useLanguage();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'duration' | 'progress'>('title');
  const [showFlashcardStudy, setShowFlashcardStudy] = useState(false);
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  
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
    getLessonMastery,
    recordQuizAnswer,
    getTotalProgress
  } = useEnhancedLessonProgress();

  const { recordActivity } = useProgressiveStreak();

  // Topics with icons and descriptions
  const topics = useMemo((): Topic[] => [
    {
      id: 'ai4k12-perception',
      title: 'AI4K12: Perception',
      icon: Brain,
      description: 'How computers sense and understand the world',
      lessons: ['perception-sensors'],
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'ai4k12-reasoning',
      title: 'AI4K12: How Machines Think',
      icon: Brain,
      description: 'Representation, reasoning & decision making',
      lessons: ['how-machines-think'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'ai4k12-learning',
      title: 'AI4K12: Machine Learning',
      icon: TrendingUp,
      description: 'How AI learns patterns from data',
      lessons: ['machine-learning-intro', 'neural-networks-explained'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'ai4k12-interaction',
      title: 'AI4K12: Natural Interaction',
      icon: MessageCircle,
      description: 'Human-AI communication with NLP',
      lessons: ['natural-interaction'],
      color: 'from-orange-500 to-yellow-600'
    },
    {
      id: 'ai4k12-ethics',
      title: 'AI4K12: Ethics & Society',
      icon: Shield,
      description: 'Responsible AI and societal impact',
      lessons: ['ai-ethics-bias'],
      color: 'from-red-500 to-pink-600'
    },
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

  // Enhanced lesson filtering and sorting with age groups
  const filteredLessons = useMemo(() => {
    let lessons = [
      ...Object.values(ai4k12Lessons),
      ...Object.values(enhancedComicLessons)
    ];
    
    // Add age-based lessons
    Object.entries(ageLevelLessons).forEach(([ageGroup, data]) => {
      Object.values(data.lessons).forEach(lesson => {
        lessons.push(lesson as any);
      });
    });
    
    // Filter by age group
    if (selectedAgeGroup !== 'all') {
      lessons = lessons.filter(lesson => 
        (lesson as any).ageGroup === selectedAgeGroup || !(lesson as any).ageGroup
      );
    }
    
    // Filter by search query with debounced value
    if (debouncedSearchQuery) {
      lessons = lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        lesson.character.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
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
  }, [debouncedSearchQuery, selectedDifficulty, selectedAgeGroup, sortBy, enhancedComicLessons, getLessonScore]);

  // Get lesson details from both sources
  const getLessonById = (id: string) => {
    // First check enhanced lessons
    const enhancedLesson = enhancedComicLessons[id as keyof typeof enhancedComicLessons];
    if (enhancedLesson) return enhancedLesson;
    
    // Then check age-based lessons
    for (const ageGroup of Object.values(ageLevelLessons)) {
      const lesson = ageGroup.lessons[id as keyof typeof ageGroup.lessons];
      if (lesson) return lesson;
    }
    
    return null;
  };

  // Calculate progress
  const totalLessons = Object.keys(enhancedComicLessons).length;
  const completedCount = Object.values(lessonProgress).filter(p => p.completed).length;
  const progress = getTotalProgress();
  const averageScore = analytics?.averageScore || 0;

  const handleStartLesson = (lessonId: string) => {
    setSelectedLesson(lessonId);
    updateProgress(lessonId, { currentPanel: 0 });
    toast.success(t('toast.lessonStarted'), {
      description: getLessonById(lessonId)?.title
    });
  };

  const handleCompleteLesson = (lessonId: string, score: number) => {
    const lesson = getLessonById(lessonId);
    const category = topics.find(t => t.lessons.includes(lessonId))?.id;
    
    completeLesson(lessonId, score);
    recordActivity('lesson', score, lessonId, category);
    setSelectedLesson(null);
  };

  // Calculate daily stats for goals
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = Object.values(lessonProgress).filter(p => {
    if (!p.completedAt) return false;
    const completedDate = new Date(p.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  }).length;

  const timeSpentToday = Object.values(lessonProgress)
    .filter(p => {
      if (!p.lastVisited) return false;
      const visitDate = new Date(p.lastVisited);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate.getTime() === today.getTime();
    })
    .reduce((sum, p) => sum + p.timeSpent, 0);

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
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20 md:pb-6">
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
            <SyncStatusIndicator syncStatus={syncStatus} isOnline={isOnline} />
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
        {showFlashcardStudy && selectedLesson ? (
          <EnhancedFlashcardStudy
            lessonId={selectedLesson}
            flashcards={getLessonById(selectedLesson)?.flashcards || []}
            onComplete={() => {
              setShowFlashcardStudy(false);
              setSelectedLesson(null);
            }}
            onBack={() => setShowFlashcardStudy(false)}
          />
        ) : selectedLesson ? (
              <Suspense fallback={<div className="animate-pulse">Loading lesson...</div>}>
                 <AccessibleLessonView 
                   lesson={getLessonById(selectedLesson) as any} 
                   completedLessons={completedCount}
                   isBookmarked={isLessonBookmarked(selectedLesson)}
                   averageScore={analytics?.averageScore || 0}
                   streakDays={analytics?.streakDays || 0}
                   onComplete={(score) => handleCompleteLesson(selectedLesson, score)}
                   onBack={() => setSelectedLesson(null)}
                   onToggleBookmark={() => toggleBookmark(selectedLesson)}
                   onStartFlashcards={() => setShowFlashcardStudy(true)}
                   onQuizAnswer={(questionId, correct) => recordQuizAnswer(selectedLesson, questionId, correct)}
                 />
              </Suspense>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
                {/* Mobile Navigation */}
                <MobileNavigation 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab}
                  completedCount={completedCount}
                />
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* Desktop Tabs - Hidden on mobile */}
                  <TabsList className="hidden md:grid w-full grid-cols-5 max-w-5xl mx-auto">
                    <TabsTrigger value="browse" className="text-xs sm:text-sm">
                      <BookOpen className="w-4 h-4 mr-0 sm:mr-2" />
                      <span className="hidden sm:inline">Topics</span>
                    </TabsTrigger>
                    <TabsTrigger value="all" className="text-xs sm:text-sm">
                      <Star className="w-4 h-4 mr-0 sm:mr-2" />
                      <span className="hidden sm:inline">All</span>
                    </TabsTrigger>
                    <TabsTrigger value="learning-path" className="text-xs sm:text-sm">
                      <TrendingUp className="w-4 h-4 mr-0 sm:mr-2" />
                      <span className="hidden sm:inline">Path</span>
                    </TabsTrigger>
                    <TabsTrigger value="search" className="text-xs sm:text-sm">
                      <Search className="w-4 h-4 mr-0 sm:mr-2" />
                      <span className="hidden sm:inline">Search</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                      <BarChart3 className="w-4 h-4 mr-0 sm:mr-2" />
                      <span className="hidden sm:inline">Analytics</span>
                    </TabsTrigger>
                  </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {/* Continue Learning Section */}
              <ContinueLearning 
                lessons={filteredLessons}
                progress={lessonProgress}
                onStartLesson={handleStartLesson}
              />
              
              {/* Recommended Lessons */}
              <RecommendedLessons 
                lessons={filteredLessons}
                progress={lessonProgress}
                onStartLesson={handleStartLesson}
              />
              
              {/* Topics Grid */}
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
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {topicCompletedCount}/{topicLessons.length} done
                                </Badge>
                              </div>
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
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">{lesson.title}</span>
                                    <MasteryBadge level={getLessonMastery(lesson.id)} size="sm" />
                                  </div>
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
                    value={selectedAgeGroup}
                    onChange={(e) => setSelectedAgeGroup(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Age Groups</option>
                    <option value="little-explorers">🌟 Little Explorers (6-8)</option>
                    <option value="young-builders">🔨 Young Builders (9-11)</option>
                    <option value="ai-ambassadors">🚀 AI Ambassadors (12-14)</option>
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
                              <MasteryBadge level={getLessonMastery(lesson.id)} size="sm" />
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
              <AdvancedSearch 
                lessons={filteredLessons}
                onSelectResult={handleSearchResult}
                userAgeGroup={selectedAgeGroup !== 'all' ? selectedAgeGroup : undefined}
              />
            </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  {analytics && (
                    <EnhancedProgressAnalytics 
                      analytics={analytics}
                      syncStatus={syncStatus}
                      isOnline={isOnline}
                      onExportProgress={exportProgress}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="learning-path" className="space-y-6">
                  <LearningPath 
                    topics={topics}
                    lessons={Object.fromEntries(
                      filteredLessons.map(lesson => [lesson.id, lesson])
                    )}
                    progress={lessonProgress}
                    onStartLesson={handleStartLesson}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Simplified Learning Progress */}
            <div className="lg:col-span-1 space-y-4">
              <DailyGoals 
                completedToday={completedToday}
                timeSpentToday={timeSpentToday}
              />
              
              <SimpleStreak />
              
              <AchievementSystem
                completedLessons={completedCount}
                streakDays={analytics?.streakDays || 0}
                averageScore={analytics?.averageScore || 0}
                totalTimeSpent={analytics?.totalTimeSpent || 0}
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default AILessons;