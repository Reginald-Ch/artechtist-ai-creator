import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { UseModePanel } from './UseModePanel';
import { ModifyModePanel } from './ModifyModePanel';
import { 
  GraduationCap, 
  Edit, 
  Plus, 
  Star, 
  Target, 
  Zap, 
  Trophy,
  Brain,
  Lightbulb,
  Rocket
} from 'lucide-react';

interface LearningFlowProps {
  currentMode: 'use' | 'modify' | 'create';
  onModeChange: (mode: 'use' | 'modify' | 'create') => void;
  onApplyTemplate: (template: any) => void;
  className?: string;
}

export const EnhancedLearningFlow = ({ 
  currentMode, 
  onModeChange, 
  onApplyTemplate, 
  className 
}: LearningFlowProps) => {
  const [userProgress, setUserProgress] = useState({
    level: 1,
    experience: 45,
    maxExperience: 100,
    achievements: ['first_bot', 'voice_trainer'],
    completedChallenges: 3,
    totalChallenges: 10
  });

  const handleModeSwitch = useCallback((mode: 'use' | 'modify' | 'create') => {
    onModeChange(mode);
    
    // Update progress when switching modes
    setUserProgress(prev => ({
      ...prev,
      experience: Math.min(prev.maxExperience, prev.experience + 10)
    }));
  }, [onModeChange]);

  const achievements = [
    { id: 'first_bot', name: 'First Bot Creator', icon: '🤖', description: 'Created your first bot' },
    { id: 'voice_trainer', name: 'Voice Trainer', icon: '🎤', description: 'Used voice training features' },
    { id: 'conversation_master', name: 'Conversation Master', icon: '💬', description: 'Built complex conversation flows' },
    { id: 'template_expert', name: 'Template Expert', icon: '📋', description: 'Modified 5 templates' },
  ];

  const learningPaths = [
    {
      id: 'beginner',
      title: 'Beginner Path',
      description: 'Start with simple bots and learn the basics',
      icon: <Lightbulb className="h-5 w-5" />,
      steps: ['Use sample bots', 'Modify templates', 'Create first bot'],
      progress: 66
    },
    {
      id: 'intermediate',
      title: 'Intermediate Path',
      description: 'Build more complex conversation flows',
      icon: <Target className="h-5 w-5" />,
      steps: ['Advanced intents', 'Voice training', 'Analytics'],
      progress: 33
    },
    {
      id: 'expert',
      title: 'Expert Path',
      description: 'Master AI bot creation and deployment',
      icon: <Rocket className="h-5 w-5" />,
      steps: ['Custom integrations', 'Smart speaker deployment', 'Advanced analytics'],
      progress: 10
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card className="glassmorphism">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Learning Journey</CardTitle>
                <p className="text-sm text-muted-foreground">Level {userProgress.level} Bot Builder</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{userProgress.experience}/{userProgress.maxExperience} XP</span>
              </div>
              <Progress value={(userProgress.experience / userProgress.maxExperience) * 100} className="w-32" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Mode Selection */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                mode: 'use' as const,
                title: 'Use',
                description: 'Try sample bots',
                icon: <Brain className="h-5 w-5" />,
                color: 'bg-blue-500/10 text-blue-600 border-blue-200'
              },
              {
                mode: 'modify' as const,
                title: 'Modify',
                description: 'Customize templates',
                icon: <Edit className="h-5 w-5" />,
                color: 'bg-orange-500/10 text-orange-600 border-orange-200'
              },
              {
                mode: 'create' as const,
                title: 'Create',
                description: 'Build from scratch',
                icon: <Plus className="h-5 w-5" />,
                color: 'bg-green-500/10 text-green-600 border-green-200'
              }
            ].map(({ mode, title, description, icon, color }) => (
              <Card
                key={mode}
                className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 ${
                  currentMode === mode 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleModeSwitch(mode)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mx-auto mb-3`}>
                    {icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Achievements */}
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Recent Achievements</span>
          </div>
          <div className="flex gap-2 flex-wrap mb-6">
            {achievements
              .filter(achievement => userProgress.achievements.includes(achievement.id))
              .map(achievement => (
                <Badge key={achievement.id} variant="secondary" className="gap-1">
                  <span>{achievement.icon}</span>
                  {achievement.name}
                </Badge>
              ))}
          </div>

          {/* Learning Paths */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Recommended Learning Paths</h4>
            {learningPaths.map(path => (
              <Card key={path.id} className="p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {path.icon}
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{path.title}</h5>
                      <p className="text-xs text-muted-foreground">{path.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">{path.progress}%</div>
                    <Progress value={path.progress} className="w-16 h-2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mode Content */}
      <div className="min-h-[600px]">
        {currentMode === 'use' && (
          <div className="animate-fade-in">
            <UseModePanel
              onSwitchToModify={() => handleModeSwitch('modify')}
              onSwitchToCreate={() => handleModeSwitch('create')}
            />
          </div>
        )}
        
        {currentMode === 'modify' && (
          <div className="animate-fade-in">
            <ModifyModePanel
              onSwitchToCreate={() => handleModeSwitch('create')}
              onApplyChanges={onApplyTemplate}
            />
          </div>
        )}
        
        {currentMode === 'create' && (
          <div className="animate-fade-in">
            <Card className="glassmorphism">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                    <Zap className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Create Mode Active</h3>
                  <p className="text-muted-foreground max-w-md">
                    You're now in create mode! Use the main canvas to build your bot from scratch. 
                    Start by adding intents and connecting them to create conversation flows.
                  </p>
                  <div className="flex gap-2 justify-center pt-4">
                    <Button onClick={() => handleModeSwitch('use')} variant="outline">
                      Back to Use Mode
                    </Button>
                    <Button onClick={() => handleModeSwitch('modify')} variant="outline">
                      Try Modify Mode
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};