import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, Play, CheckCircle, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { ComicLesson } from "@/components/ai-tutor/ComicLesson";
import { comicLessons } from "@/data/comicLessons";

const AILessons = () => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});

  const handleLessonComplete = (lessonId: string, score: number) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    setSelectedLesson(null);
    console.log(`Lesson ${lessonId} completed with score: ${score}`);
  };

  const handleLessonProgress = (lessonId: string, panelIndex: number) => {
    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: panelIndex
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (selectedLesson && comicLessons[selectedLesson as keyof typeof comicLessons]) {
    const lesson = comicLessons[selectedLesson as keyof typeof comicLessons];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedLesson(null)}
              className="mb-4"
            >
              ← Back to Lessons
            </Button>
          </div>
          
          <ComicLesson
            topic="ai-learning"
            onInteraction={(action) => {
              console.log('Lesson interaction:', action);
              handleLessonProgress(lesson.id, 75);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              AI Comic Lessons
            </h1>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <Brain className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Learn AI Through African Stories 🌍
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our African characters on an exciting journey through the world of Artificial Intelligence! 
            Learn AI concepts through interactive comic stories featuring diverse African cultures and perspectives.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-8 bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/20">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-purple-500" />
            Your Learning Progress
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{completedLessons.size}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{Object.keys(comicLessons).length}</div>
              <div className="text-sm text-muted-foreground">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((completedLessons.size / Object.keys(comicLessons).length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Object.values(lessonProgress).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Panels Read</div>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(comicLessons).map(([lessonId, lesson]) => {
            const isCompleted = completedLessons.has(lessonId);
            const progress = lessonProgress[lessonId] || 0;
            const totalPanels = lesson.panels.length;
            
            return (
              <Card 
                key={lessonId} 
                className={`hover:shadow-xl transition-all cursor-pointer border-2 ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
                    : 'border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700'
                }`}
                onClick={() => setSelectedLesson(lessonId)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl mb-2">
                      {lesson.character === 'AI-ko' ? '🤖' : 
                       lesson.character === 'Student Amara' ? '👩🏾‍🎓' :
                       lesson.character === 'Teacher Kwame' ? '👨🏿‍🏫' :
                       lesson.character === 'Elder Fatima' ? '👵🏾' :
                       lesson.character === 'Inventor Zuberi' ? '👨🏾‍💻' :
                       lesson.character === 'Market Vendor Asha' ? '👩🏾‍💼' : '👴🏿'}
                    </div>
                    {isCompleted && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{lesson.title}</CardTitle>
                  <CardDescription className="mb-3">{lesson.description}</CardDescription>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </Badge>
                    <Badge variant="outline">
                      {lesson.panels.length} panels
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {progress > 0 && !isCompleted && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{progress}/{totalPanels}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${(progress / totalPanels) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant={isCompleted ? "outline" : "default"}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review Lesson
                      </>
                    ) : progress > 0 ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Lesson
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Achievement Section */}
        {completedLessons.size > 0 && (
          <div className="mt-12 text-center bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-8 text-white">
            <Star className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Great Progress! 🎉</h3>
            <p className="text-lg opacity-90 mb-4">
              You've completed {completedLessons.size} out of {Object.keys(comicLessons).length} AI lessons
            </p>
            {completedLessons.size === Object.keys(comicLessons).length && (
              <div>
                <p className="text-xl font-bold mb-4">🏆 Congratulations! You're now an AI Expert! 🏆</p>
                <Link to="/builder">
                  <Button size="lg" variant="secondary" className="px-8 py-4">
                    Build Your First AI Bot
                    <Brain className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AILessons;