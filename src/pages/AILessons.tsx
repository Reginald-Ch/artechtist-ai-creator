import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { enhancedComicLessons } from '@/data/enhancedComicLessons';
import { Brain, BookOpen, MessageCircle, Database, Shield, Bot, Play, Trophy, Star } from 'lucide-react';
import { toast } from 'sonner';

const AILessons = () => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Topics with icons and descriptions
  const topics = useMemo(() => [
    {
      id: 'fundamentals',
      title: 'AI Fundamentals',
      icon: Brain,
      description: 'Learn the basics of artificial intelligence',
      lessons: ['intro-to-ai', 'intro-to-ai-ml']
    },
    {
      id: 'data',
      title: 'Data & Learning',
      icon: Database,
      description: 'Understanding data in AI systems',
      lessons: ['intro-to-data']
    },
    {
      id: 'ethics',
      title: 'AI Ethics',
      icon: Shield,
      description: 'Building fair and responsible AI',
      lessons: ['intro-to-bias']
    },
    {
      id: 'applications',
      title: 'AI Applications',
      icon: Bot,
      description: 'Real-world AI implementations',
      lessons: ['intro-to-chatbots']
    }
  ], []);

  // Get lesson details
  const getLessonById = (id: string) => enhancedComicLessons[id as keyof typeof enhancedComicLessons];

  // Calculate progress
  const totalLessons = Object.keys(enhancedComicLessons).length;
  const progress = (completedLessons.size / totalLessons) * 100;

  const handleStartLesson = (lessonId: string) => {
    setSelectedLesson(lessonId);
    toast.success(`Starting lesson: ${getLessonById(lessonId)?.title}`);
  };

  const handleCompleteLesson = (lessonId: string) => {
    setCompletedLessons(prev => new Set(prev).add(lessonId));
    setSelectedLesson(null);
    toast.success('Lesson completed! 🎉');
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
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
              <span className="font-medium">{completedLessons.size}/{totalLessons} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Lesson Content */}
        {selectedLesson ? (
          <LessonView 
            lesson={getLessonById(selectedLesson)!} 
            onComplete={() => handleCompleteLesson(selectedLesson)}
            onBack={() => setSelectedLesson(null)}
          />
        ) : (
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="browse">Browse Topics</TabsTrigger>
              <TabsTrigger value="all">All Lessons</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {topics.map((topic) => {
                  const Icon = topic.icon;
                  const topicLessons = topic.lessons.map(getLessonById).filter(Boolean);
                  const completedCount = topic.lessons.filter(id => completedLessons.has(id)).length;
                  
                  return (
                    <Card key={topic.id} className="comic-card group cursor-pointer">
                      <CardHeader className="text-center space-y-4">
                        <div className="mx-auto p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-8 w-8 text-primary" />
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
                            {completedCount}/{topicLessons.length} done
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {topicLessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-2 rounded border">
                              <div className="flex items-center gap-2">
                                {completedLessons.has(lesson.id) ? (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
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
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(enhancedComicLessons).map((lesson) => (
                  <Card key={lesson.id} className="comic-card group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg leading-tight">{lesson.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(lesson.difficulty)}>
                              {lesson.difficulty}
                            </Badge>
                            <Badge variant="outline">{lesson.duration}</Badge>
                          </div>
                        </div>
                        {completedLessons.has(lesson.id) && (
                          <Star className="h-5 w-5 text-yellow-500 fill-current flex-shrink-0" />
                        )}
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
                        >
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

// Simple lesson viewer component
const LessonView = ({ lesson, onComplete, onBack }: {
  lesson: any;
  onComplete: () => void;
  onBack: () => void;
}) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [showFlashcards, setShowFlashcards] = useState(false);

  if (showFlashcards) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flashcard Review</CardTitle>
            <Button variant="outline" onClick={() => setShowFlashcards(false)}>
              Back to Lesson
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {lesson.flashcards.slice(0, 6).map((card: any, index: number) => (
              <Card key={card.id} className="p-4">
                <div className="space-y-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {card.difficulty}
                  </Badge>
                  <h4 className="font-medium">{card.question}</h4>
                  <p className="text-sm text-muted-foreground">{card.answer}</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPanelData = lesson.panels[currentPanel];
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{lesson.title}</CardTitle>
            <CardDescription>Panel {currentPanel + 1} of {lesson.panels.length}</CardDescription>
          </div>
          <Button variant="outline" onClick={onBack}>
            Back to Topics
          </Button>
        </div>
        <Progress value={(currentPanel + 1) / lesson.panels.length * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Character & Dialogue */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="character-avatar">
              {currentPanelData.character[0]}
            </div>
            <div>
              <h3 className="font-semibold">{currentPanelData.character}</h3>
              <p className="text-sm text-muted-foreground">{currentPanelData.action}</p>
            </div>
          </div>
          
          <div className="speech-bubble">
            <p className="leading-relaxed">{currentPanelData.dialogue}</p>
          </div>
        </div>

        {/* Interactive Element */}
        {currentPanelData.interactiveElement?.type === 'question' && (
          <Card className="p-4 bg-primary/5">
            <h4 className="font-medium mb-3">{currentPanelData.interactiveElement.content}</h4>
            <div className="grid gap-2">
              {currentPanelData.interactiveElement.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => {
                    if (option === currentPanelData.interactiveElement.correctAnswer) {
                      toast.success('Correct! 🎉');
                    } else {
                      toast.error('Try again!');
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPanel(Math.max(0, currentPanel - 1))}
            disabled={currentPanel === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFlashcards(true)}
            >
              Review Cards
            </Button>
            
            {currentPanel === lesson.panels.length - 1 ? (
              <Button onClick={onComplete} className="bg-gradient-to-r from-primary to-primary-glow">
                Complete Lesson
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentPanel(Math.min(lesson.panels.length - 1, currentPanel + 1))}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AILessons;