import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Bot, Star, Users, Zap, Plus, Sparkles, Globe, Mic, BookOpen, LogOut, Settings, Radio } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import TemplateGallery from "@/components/TemplateGallery";
import { AIMascot } from "@/components/ai-tutor/AIMascot";
import { TutorialOverlay } from "@/components/ai-tutor/TutorialOverlay";
import { AgentCreationDialog } from "@/components/AgentCreationDialog";
import { SavedProjectsSection } from "@/components/enhanced/SavedProjectsSection";

// Lazy load performance-heavy components
// Removed deprecated Google Assistant integration

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [showTutorial, setShowTutorial] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [showAgentCreation, setShowAgentCreation] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleUseTemplate = (template: any) => {
    // Navigate to bot builder with template data
    navigate('/builder', { state: { template } });
  };
  
  const myBots = [
    { id: 1, name: "Breakfast Bot", avatar: "🍳", lastEdited: t('sampleBots.hoursAgo', '2 hours ago'), status: t('common.active') },
    { id: 2, name: "Story Helper", avatar: "📚", lastEdited: t('sampleBots.dayAgo', '1 day ago'), status: t('common.draft') },
    { id: 3, name: "Math Buddy", avatar: "🔢", lastEdited: t('sampleBots.daysAgo', '3 days ago'), status: t('common.active') },
  ];

  const sampleBots = [
    { name: t('sampleBots.weatherWizard'), avatar: "🌦️", difficulty: t('common.beginner'), description: t('sampleBots.weatherWizardDesc') },
    { name: t('sampleBots.petCaretaker'), avatar: "🐕", difficulty: t('common.easy'), description: t('sampleBots.petCaretakerDesc') },
    { name: t('sampleBots.recipeHelper'), avatar: "👨‍🍳", difficulty: t('common.medium'), description: t('sampleBots.recipeHelperDesc') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              {t('dashboard.title')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {t('common.community')}
            </Button>
            <LanguageSelector />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('common.signOut')}
            </Button>
            <Avatar>
              <AvatarFallback className="bg-orange-500 text-white">
                {user?.email?.substring(0, 2).toUpperCase() || "AI"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t('dashboard.welcomeMessage')}</h2>
          <p className="text-muted-foreground text-lg">{t('dashboard.subtitle')}</p>
        </div>

        {/* AMBY-Style Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 hover:border-orange-300 group"
            onClick={() => setShowAgentCreation(true)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-orange-600 text-xl">{t('dashboard.createNewAgent')}</CardTitle>
              <CardDescription>{t('dashboard.createNewAgentDesc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-300 group"
            onClick={() => {
              // Show saved projects section
              document.getElementById('saved-projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-blue-600 text-xl">{t('dashboard.openPreviousProjects')}</CardTitle>
              <CardDescription>{t('dashboard.openPreviousProjectsDesc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-green-600 text-xl">{t('dashboard.sampleProject')}</CardTitle>
              <CardDescription>{t('dashboard.sampleProjectDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TemplateGallery onUseTemplate={handleUseTemplate} />
            </CardContent>
          </Card>

          <Link to="/ai-playground">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-600">{t('dashboard.aiModelPlayground')}</CardTitle>
                <CardDescription>{t('dashboard.aiModelPlaygroundDesc')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/cultural-hub">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-purple-600">{t('dashboard.mlPlayground')}</CardTitle>
                <CardDescription>{t('dashboard.mlPlaygroundDesc')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/ai-lessons">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 hover:border-yellow-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-yellow-600">{t('dashboard.progressiveLearningHub')}</CardTitle>
                <CardDescription>{t('dashboard.progressiveLearningHubDesc')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/python-ide">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200 hover:border-indigo-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-indigo-600">{t('dashboard.pythonIDE')}</CardTitle>
                <CardDescription>{t('dashboard.pythonIDEDesc')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>


        </div>

        {/* Saved Projects Dashboard - AMBY Style */}
        <div className="mb-8" id="saved-projects">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" />
            {t('dashboard.yourConversationalAgents')}
          </h3>
          <div className="text-sm text-muted-foreground mb-4">
            {t('dashboard.continueWorking')}
          </div>
          <SavedProjectsSection onLoadProject={(project) => {
            // Store project data for bot builder - go to playground page
            localStorage.setItem('loadedProject', JSON.stringify(project));
            navigate('/builder');
          }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Mascot */}
          <div>
            <AIMascot 
              currentTopic={selectedConcept}
              onTopicChange={setSelectedConcept}
            />
          </div>

          {/* Sample Bots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                {t('dashboard.featuredTemplates')}
              </CardTitle>
              <CardDescription>{t('dashboard.learnFromExamples')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleBots.map((bot, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border hover:bg-accent/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{bot.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{bot.name}</h3>
                        <p className="text-sm text-muted-foreground">{bot.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bot.difficulty === t('common.beginner') 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                          : bot.difficulty === t('common.easy')
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                      }`}>
                        {bot.difficulty}
                      </span>
                    </div>
                    <TemplateGallery onUseTemplate={handleUseTemplate} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutorial Overlays */}
        {showTutorial && (
          <TutorialOverlay 
            isVisible={!!showTutorial}
            onClose={() => setShowTutorial(null)}
            tutorialType={showTutorial as any}
            onStepComplete={(stepId) => {
              console.log('Completed step:', stepId);
            }}
          />
        )}

        {/* Agent Creation Dialog */}
        <AgentCreationDialog 
          open={showAgentCreation}
          onOpenChange={setShowAgentCreation}
        />
      </div>
    </div>
  );
};

export default Dashboard;
