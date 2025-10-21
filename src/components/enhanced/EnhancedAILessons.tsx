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
  Bookmark,
  Filter,
  SortAsc,
  Clock,
  Award,
  Target,
  Calendar,
  Zap
} from 'lucide-react';
import { useEnhancedLessonProgress } from '@/hooks/useEnhancedLessonProgress';
import { SearchInterface } from '@/components/enhanced/SearchInterface';
import { EnhancedProgressAnalytics } from '@/components/enhanced/EnhancedProgressAnalytics';
import { AccessibleLessonView } from '@/components/enhanced/AccessibleLessonView';
import { LessonCardSkeleton, TopicCardSkeleton } from '@/components/enhanced/LoadingStates';
import { Lesson, Topic, SearchResult } from '@/types/lesson';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedAILessons = () => {
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

  // Enhanced topics with more comprehensive data
  const topics = useMemo((): Topic[] => [
    {
      id: 'fundamentals',
      title: 'AI Fundamentals',
      icon: Brain,
      description: 'Master the core concepts of artificial intelligence',
      lessons: ['intro-to-ai', 'intro-to-ai-ml'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'data',
      title: 'Data Science',
      icon: Database,
      description: 'Understand data processing and analysis in AI',
      lessons: ['intro-to-data'],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'ethics',
      title: 'AI Ethics & Safety',
      icon: Shield,
      description: 'Learn responsible AI development practices',
      lessons: ['intro-to-bias'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'applications',
      title: 'Real-World AI',
      icon: Bot,
      description: 'Explore practical AI implementations',
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

  // Calculate enhanced progress metrics
  const totalLessons = Object.keys(enhancedComicLessons).length;
  const completedCount = Object.values(lessonProgress).filter(p => p.completed).length;
  const progress = getTotalProgress();
  const averageScore = analytics?.averageScore || 0;
  

  const handleStartLesson = (lessonId: string) => {
    setSelectedLesson(lessonId);
    updateProgress(lessonId, { currentPanel: 0, lastVisited: new Date() });
    toast.success(`Starting lesson: ${getLessonById(lessonId)?.title}`);
  };

  const handleCompleteLesson = (lessonId: string) => {
    const score = Math.floor(Math.random() * 20) + 80; // 80-100% random score
    const lesson = getLessonById(lessonId);
    const category = topics.find(t => t.lessons.includes(lessonId))?.id;
    
    completeLesson(lessonId, score);
    setSelectedLesson(null);
    
    // Show completion celebration
    toast.success('🎉 Lesson completed!', {
      description: `You scored ${score}%! Great job!`
    });
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
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppNavigation showBackButton={true} title="AI Learning Hub" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header with Metrics */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div 
              className="p-3 rounded-full bg-primary/10"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Learning Hub
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master artificial intelligence through interactive lessons, comics, and hands-on practice.
          </p>
          
          {/* Enhanced Progress Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Progress</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{completedCount}/{totalLessons}</div>
              <Progress value={progress} className="h-2 mt-2" />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Average Score</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{averageScore.toFixed(0)}%</div>
            </motion.div>
            
          </div>
        </motion.div>

        {/* Lesson Content */}
        <AnimatePresence mode="wait">
          {selectedLesson ? (
            <motion.div
              key="lesson-view"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="lesson-browser"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
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
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {[1, 2, 3, 4].map(i => <TopicCardSkeleton key={i} />)}
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2">
                        {topics.map((topic) => {
                          const Icon = topic.icon;
                          const topicLessons = topic.lessons.map(getLessonById).filter(Boolean);
                          const topicCompletedCount = topic.lessons.filter(id => isLessonCompleted(id)).length;
                          const topicProgress = (topicCompletedCount / topicLessons.length) * 100;
                        
                          return (
                            <motion.div
                              key={topic.id}
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Card className="comic-card group cursor-pointer overflow-hidden h-full">
                                <CardHeader className="text-center space-y-4">
                                  <div className={`mx-auto p-4 rounded-full bg-gradient-to-br ${topic.color} text-white group-hover:scale-110 transition-transform shadow-lg`}>
                                    <Icon className="h-8 w-8" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-xl">{topic.title}</CardTitle>
                                    <CardDescription>{topic.description}</CardDescription>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span>{topicLessons.length} lessons</span>
                                      <Badge variant="outline">
                                        {topicCompletedCount}/{topicLessons.length} done
                                      </Badge>
                                    </div>
                                    <Progress value={topicProgress} className="h-2" />
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    {topicLessons.map((lesson) => (
                                      <motion.div 
                                        key={lesson.id} 
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                      >
                                        <div className="flex items-center gap-3">
                                          {isLessonCompleted(lesson.id) ? (
                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                          ) : isLessonBookmarked(lesson.id) ? (
                                            <Bookmark className="h-4 w-4 text-primary fill-current" />
                                          ) : (
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                          )}
                                          <div>
                                            <span className="text-sm font-medium">{lesson.title}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                            <Badge className={getDifficultyColor(lesson.difficulty)}>
                                              {lesson.difficulty}
                                            </Badge>
                                            <Badge variant="outline">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {lesson.duration}
                                            </Badge>
                                            </div>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleStartLesson(lesson.id)}
                                          className="h-8 px-3"
                                          aria-label={`Start ${lesson.title}`}
                                        >
                                          <Play className="h-3 w-3" />
                                        </Button>
                                      </motion.div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="all" className="space-y-6">
                    {/* Enhanced Filters */}
                    <Card className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Search Lessons</label>
                          <Input
                            placeholder="Search by title, description, or character..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Difficulty</label>
                          <select 
                            className="w-full p-2 border rounded-md bg-background"
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                          >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sort By</label>
                          <select 
                            className="w-full p-2 border rounded-md bg-background"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                          >
                            <option value="title">Title A-Z</option>
                            <option value="difficulty">Difficulty</option>
                            <option value="duration">Duration</option>
                            <option value="progress">Your Progress</option>
                          </select>
                        </div>
                      </div>
                    </Card>

                    {isLoading ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => <LessonCardSkeleton key={i} />)}
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence>
                          {filteredLessons.map((lesson, index) => (
                            <motion.div
                              key={lesson.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <Card className="comic-card group hover:shadow-lg transition-all duration-300 h-full">
                                <CardHeader>
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                      <CardTitle className="text-lg leading-tight">{lesson.title}</CardTitle>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={getDifficultyColor(lesson.difficulty)}>
                                          {lesson.difficulty}
                                        </Badge>
                                        <Badge variant="outline">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {lesson.duration}
                                        </Badge>
                                        {getLessonScore(lesson.id) > 0 && (
                                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
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
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{lesson.panels.length} panels</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>{lesson.flashcards.length} cards</span>
                                      </div>
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
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                    
                    {filteredLessons.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="search" className="space-y-6">
                    <SearchInterface 
                      lessons={enhancedComicLessons as Record<string, any>}
                      onSelectResult={handleSearchResult}
                      isLoading={isLoading}
                    />
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6">
                    {analytics && (
                      <EnhancedProgressAnalytics 
                        analytics={analytics as any}
                        syncStatus={syncStatus}
                        isOnline={isOnline}
                        onExportProgress={exportProgress}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedAILessons;