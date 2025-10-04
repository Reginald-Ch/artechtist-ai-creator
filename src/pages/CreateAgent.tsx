import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, Bot, Star, Users, Zap, Plus, Globe, BookOpen, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import TemplateGallery from "@/components/TemplateGallery";
import { AIMascot } from "@/components/ai-tutor/AIMascot";
import { TutorialOverlay } from "@/components/ai-tutor/TutorialOverlay";
import { SavedProjectsSection } from "@/components/enhanced/SavedProjectsSection";
import { AssistantButton } from "@/components/assistant/AssistantButton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [showTutorial, setShowTutorial] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleUseTemplate = (template: any) => {
    navigate('/builder', { state: { template } });
  };

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
            onClick={() => navigate("/create-agent")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-orange-600 text-xl">{t('dashboard.createNewAgent')}</CardTitle>
              <CardDescription>{t('dashboard.createNewAgentDesc')}</CardDescription>
            </CardHeader>
          </Card>

          {/* other cards remain unchanged ... */}
        </div>

        {/* Saved Projects Section */}
        <div className="mb-8" id="saved-projects">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" />
            {t('dashboard.yourConversationalAgents')}
          </h3>
          <div className="text-sm text-muted-foreground mb-4">
            {t('dashboard.continueWorking')}
          </div>
          <SavedProjectsSection onLoadProject={(project) => {
            localStorage.setItem('loadedProject', JSON.stringify(project));
            navigate('/builder');
          }} />
        </div>

        {/* AI Mascot + Featured Templates */}
        {/* ... keep as-is ... */}

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

        {/* Phone Assistant Button */}
        <AssistantButton />
      </div>
    </div>
  );
};

export default Dashboard;
