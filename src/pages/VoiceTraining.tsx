import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Mic, Globe, BookOpen, Award, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import VoiceTrainingPanel from "@/components/VoiceTrainingPanel";

const VoiceTraining = () => {
  const [showTrainingPanel, setShowTrainingPanel] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  
  const africanLanguages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸', progress: 85, phrases: 127 },
    { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪', progress: 45, phrases: 67 },
    { code: 'zu-ZA', name: 'Zulu', flag: '🇿🇦', progress: 30, phrases: 42 },
    { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦', progress: 60, phrases: 89 },
    { code: 'am-ET', name: 'Amharic', flag: '🇪🇹', progress: 15, phrases: 23 },
    { code: 'ar-EG', name: 'Arabic', flag: '🇪🇬', progress: 70, phrases: 104 },
    { code: 'fr-SN', name: 'French (Senegal)', flag: '🇸🇳', progress: 55, phrases: 78 },
    { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬', progress: 25, phrases: 31 },
    { code: 'ig-NG', name: 'Igbo', flag: '🇳🇬', progress: 10, phrases: 14 },
    { code: 'yo-NG', name: 'Yoruba', flag: '🇳🇬', progress: 20, phrases: 28 },
  ];

  const trainingModules = [
    {
      id: 'basics',
      title: 'Basic Greetings',
      description: 'Learn common greetings across African languages',
      difficulty: 'Beginner',
      languages: ['Swahili', 'Zulu', 'Yoruba', 'Hausa'],
      completed: true
    },
    {
      id: 'culture',
      title: 'Cultural Expressions',
      description: 'Practice culturally specific phrases and idioms',
      difficulty: 'Intermediate',
      languages: ['Amharic', 'Arabic', 'French'],
      completed: false
    },
    {
      id: 'storytelling',
      title: 'Storytelling Voices',
      description: 'Train AI to tell traditional African stories',
      difficulty: 'Advanced',
      languages: ['Multiple'],
      completed: false
    },
    {
      id: 'education',
      title: 'Educational Content',
      description: 'Academic vocabulary and educational phrases',
      difficulty: 'Intermediate',
      languages: ['English', 'French', 'Arabic'],
      completed: false
    }
  ];

  const achievements = [
    { id: 1, title: 'First Recording', description: 'Made your first voice recording', earned: true, icon: '🎤' },
    { id: 2, title: 'Polyglot', description: 'Trained in 3+ languages', earned: true, icon: '🌍' },
    { id: 3, title: 'Cultural Ambassador', description: 'Completed cultural expressions module', earned: false, icon: '🏛️' },
    { id: 4, title: 'Story Master', description: 'Mastered storytelling voices', earned: false, icon: '📚' },
    { id: 5, title: 'Voice Maestro', description: 'Trained 1000+ phrases', earned: false, icon: '🎭' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'Intermediate': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Mic className="h-8 w-8 text-green-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                Voice Training Studio
              </h1>
            </div>
          </div>
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => setShowTrainingPanel(true)}
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Training
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Train Your AI in African Languages 🎯</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Help your AI understand diverse African accents, languages, and cultural expressions. 
            Every recording makes AI more inclusive for African learners!
          </p>
        </div>

        {/* Language Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language Training Progress
            </CardTitle>
            <CardDescription>Your contribution to multilingual AI training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {africanLanguages.map(lang => (
                <Card key={lang.code} className="border-2 hover:border-green-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <h3 className="font-medium text-sm">{lang.name}</h3>
                          <p className="text-xs text-muted-foreground">{lang.phrases} phrases</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lang.progress}%
                      </Badge>
                    </div>
                    <Progress value={lang.progress} className="h-2 mb-2" />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowTrainingPanel(true);
                      }}
                    >
                      Train Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Training Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Training Modules
            </CardTitle>
            <CardDescription>Structured voice training programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingModules.map(module => (
                <Card key={module.id} className={`border-2 transition-colors ${
                  module.completed ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'hover:border-blue-300'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium mb-1">{module.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                          {module.completed && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                              ✓ Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Languages: {module.languages.join(', ')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      variant={module.completed ? "outline" : "default"}
                      onClick={() => setShowTrainingPanel(true)}
                    >
                      {module.completed ? 'Practice Again' : 'Start Module'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Voice Training Achievements
            </CardTitle>
            <CardDescription>Your milestones in AI voice training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {achievements.map(achievement => (
                <Card key={achievement.id} className={`text-center p-4 transition-colors ${
                  achievement.earned 
                    ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10' 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-900/10 opacity-60'
                }`}>
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h3 className="font-medium text-sm mb-1">{achievement.title}</h3>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.earned && (
                    <Badge className="mt-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                      Earned!
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Guide */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              How Voice Training Helps AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mic className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Accent Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Train AI to understand diverse African accents and pronunciations
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Cultural Context</h3>
                <p className="text-sm text-muted-foreground">
                  Help AI understand cultural expressions and local phrases
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Educational Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Make AI more accessible for African students and educators
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Training Panel */}
      {showTrainingPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg shadow-lg max-w-md w-full mx-4">
            <VoiceTrainingPanel 
              onClose={() => setShowTrainingPanel(false)}
              onAddTrainingPhrase={(phrase, intent) => {
                // Handle training phrase addition
                console.log('Training phrase added:', phrase, intent);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTraining;