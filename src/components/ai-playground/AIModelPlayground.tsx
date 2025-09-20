import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Camera, MessageSquare, Mic, Volume2, TrendingUp, Star, Trophy, Upload, Play, Settings } from 'lucide-react';
import { toast } from 'sonner';
import ImageClassifier from './ImageClassifier';
import TextClassifier from './TextClassifier';
import SpeechToText from './SpeechToText';
import TextToSpeech from './TextToSpeech';
import NumberPredictor from './NumberPredictor';

// AI Model definitions for the playground
const AI_MODELS = [
  {
    id: 'image-classifier',
    name: 'Image Classifier',
    description: 'Train AI to recognize objects, animals, or anything in pictures!',
    icon: Camera,
    difficulty: 'beginner',
    category: 'vision',
    points: 100,
    estimatedTime: '5-10 min',
    component: ImageClassifier
  },
  {
    id: 'text-classifier',
    name: 'Text Classifier',
    description: 'Teach AI to understand emotions in text: happy, sad, angry!',
    icon: MessageSquare,
    difficulty: 'easy',
    category: 'text',
    points: 150,
    estimatedTime: '10-15 min',
    component: TextClassifier
  },
  {
    id: 'speech-to-text',
    name: 'Speech-to-Text',
    description: 'Convert your voice into text with AI magic!',
    icon: Mic,
    difficulty: 'easy',
    category: 'audio',
    points: 120,
    estimatedTime: '5-8 min',
    component: SpeechToText
  },
  {
    id: 'text-to-speech',
    name: 'Text-to-Speech',
    description: 'Make AI speak your words with different voices!',
    icon: Volume2,
    difficulty: 'easy',
    category: 'audio',
    points: 120,
    estimatedTime: '5-8 min',
    component: TextToSpeech
  },
  {
    id: 'number-predictor',
    name: 'Number Predictor',
    description: 'Train AI to predict numbers from simple data patterns!',
    icon: TrendingUp,
    difficulty: 'medium',
    category: 'data',
    points: 200,
    estimatedTime: '15-20 min',
    component: NumberPredictor
  }
];

interface UserProgress {
  modelId: string;
  completed: boolean;
  score: number;
  points: number;
  lastTrainedAt?: string;
}

const AIModelPlayground = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500 text-white';
      case 'easy': return 'bg-blue-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vision': return '👁️';
      case 'text': return '💬';
      case 'audio': return '🔊';
      case 'data': return '📊';
      default: return '🤖';
    }
  };

  const handleModelComplete = (modelId: string, score: number) => {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (!model) return;

    const newProgress: UserProgress = {
      modelId,
      completed: true,
      score,
      points: model.points,
      lastTrainedAt: new Date().toISOString()
    };

    setUserProgress(prev => {
      const existing = prev.find(p => p.modelId === modelId);
      if (existing) {
        return prev.map(p => p.modelId === modelId ? newProgress : p);
      }
      return [...prev, newProgress];
    });

    setTotalPoints(prev => prev + model.points);

    // Check for achievements
    checkAchievements(modelId, score);

    toast.success(`🎉 Model completed! You earned ${model.points} points!`);
  };

  const checkAchievements = (modelId: string, score: number) => {
    const newAchievements: string[] = [];

    if (score >= 95 && !achievements.includes('Perfectionist')) {
      newAchievements.push('Perfectionist');
    }

    if (userProgress.length === 0 && !achievements.includes('First Steps')) {
      newAchievements.push('First Steps');
    }

    if (userProgress.length + 1 >= 3 && !achievements.includes('AI Explorer')) {
      newAchievements.push('AI Explorer');
    }

    if (userProgress.length + 1 >= AI_MODELS.length && !achievements.includes('AI Master')) {
      newAchievements.push('AI Master');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      newAchievements.forEach(achievement => {
        toast.success(`🏆 Achievement Unlocked: ${achievement}!`);
      });
    }
  };

  const getModelProgress = (modelId: string) => {
    return userProgress.find(p => p.modelId === modelId);
  };

  const SelectedModelComponent = selectedModel 
    ? AI_MODELS.find(m => m.id === selectedModel)?.component 
    : null;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">🏠 Overview</TabsTrigger>
          <TabsTrigger value="models">🤖 AI Models</TabsTrigger>
          <TabsTrigger value="playground">🎮 Playground</TabsTrigger>
          <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Welcome Section */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to AI Model Playground! 🚀
              </CardTitle>
              <CardDescription className="text-lg">
                Build, train, and play with your own AI models in a fun, kid-friendly way!
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-green-600">{totalPoints}</CardTitle>
                <CardDescription>Total Points Earned</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-blue-600">
                  {userProgress.filter(p => p.completed).length}/{AI_MODELS.length}
                </CardTitle>
                <CardDescription>Models Completed</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-yellow-600">{achievements.length}</CardTitle>
                <CardDescription>Achievements Unlocked</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Quick Start Models */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Quick Start - Recommended Models
              </CardTitle>
              <CardDescription>Perfect models to begin your AI journey!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_MODELS.filter(model => model.difficulty === 'beginner' || model.difficulty === 'easy').map((model) => {
                  const progress = getModelProgress(model.id);
                  const IconComponent = model.icon;
                  
                  return (
                    <Card key={model.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{model.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getDifficultyColor(model.difficulty)}>
                                  {model.difficulty}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {getCategoryIcon(model.category)} {model.estimatedTime}
                                </span>
                              </div>
                            </div>
                          </div>
                          {progress?.completed && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              ✓ Done
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                        <Button 
                          onClick={() => {
                            setSelectedModel(model.id);
                            setActiveTab('playground');
                          }}
                          className="w-full"
                          variant={progress?.completed ? "outline" : "default"}
                        >
                          {progress?.completed ? 'Play Again' : 'Start Building'} →
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_MODELS.map((model) => {
              const progress = getModelProgress(model.id);
              const IconComponent = model.icon;
              
              return (
                <Card key={model.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getDifficultyColor(model.difficulty)}>
                              {model.difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {getCategoryIcon(model.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {progress?.completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          ✓ {progress.score}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Time: {model.estimatedTime}</span>
                        <span>Points: {model.points}</span>
                      </div>
                      {progress?.completed && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{progress.score}%</span>
                          </div>
                          <Progress value={progress.score} className="h-2" />
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => {
                        setSelectedModel(model.id);
                        setActiveTab('playground');
                      }}
                      className="w-full"
                      variant={progress?.completed ? "outline" : "default"}
                    >
                      {progress?.completed ? 'Retrain Model' : 'Start Training'} →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="playground" className="space-y-4">
          {selectedModel && SelectedModelComponent ? (
            <SelectedModelComponent onComplete={(score: number) => handleModelComplete(selectedModel, score)} />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mb-4">
                  <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Choose an AI Model to Start</h3>
                  <p className="text-muted-foreground">
                    Select a model from the "AI Models" tab to begin training and playing!
                  </p>
                </div>
                <Button onClick={() => setActiveTab('models')}>
                  Browse AI Models →
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Your Achievements
              </CardTitle>
              <CardDescription>Unlock badges as you master different AI models!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'first-steps', name: 'First Steps', description: 'Complete your first AI model', icon: '🌟' },
                  { id: 'perfectionist', name: 'Perfectionist', description: 'Achieve 95% or higher score', icon: '💯' },
                  { id: 'ai-explorer', name: 'AI Explorer', description: 'Complete 3 different models', icon: '🔍' },
                  { id: 'ai-master', name: 'AI Master', description: 'Complete all AI models', icon: '🏆' }
                ].map((achievement) => {
                  const unlocked = achievements.includes(achievement.name);
                  
                  return (
                    <Card key={achievement.id} className={`${unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${unlocked ? 'text-yellow-700' : 'text-gray-500'}`}>
                              {achievement.name}
                            </h3>
                            <p className={`text-sm ${unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
                              {achievement.description}
                            </p>
                          </div>
                          {unlocked && (
                            <Badge className="ml-auto bg-yellow-500 text-white">
                              Unlocked!
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIModelPlayground;