import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Bot, Star, Users, Zap, Plus, Sparkles, Globe, Mic, BookOpen, LogOut, Settings, Radio } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TemplateGallery from "@/components/TemplateGallery";
import { AIMascot } from "@/components/ai-tutor/AIMascot";
import { TutorialOverlay } from "@/components/ai-tutor/TutorialOverlay";
import { AgentCreationDialog } from "@/components/AgentCreationDialog";
import { SavedProjectsSection } from "@/components/enhanced/SavedProjectsSection";

// Lazy load performance-heavy components
const GoogleAssistantIntegration = lazy(() => import("@/components/enhanced/GoogleAssistantIntegration").then(module => ({ default: module.GoogleAssistantIntegration })));

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showTutorial, setShowTutorial] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [showAgentCreation, setShowAgentCreation] = useState(false);
  const [showGoogleAssistant, setShowGoogleAssistant] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleUseTemplate = (template: any) => {
    // Navigate to bot builder with template data
    navigate('/builder', { state: { template } });
  };
  
  const myBots = [
    { id: 1, name: "Breakfast Bot", avatar: "🍳", lastEdited: "2 hours ago", status: "Active" },
    { id: 2, name: "Story Helper", avatar: "📚", lastEdited: "1 day ago", status: "Draft" },
    { id: 3, name: "Math Buddy", avatar: "🔢", lastEdited: "3 days ago", status: "Active" },
  ];

  const sampleBots = [
    { name: "Weather Wizard", avatar: "🌦️", difficulty: "Beginner", description: "Learn to build a weather chatbot" },
    { name: "Pet Caretaker", avatar: "🐕", difficulty: "Easy", description: "Virtual pet care assistant" },
    { name: "Recipe Helper", avatar: "👨‍🍳", difficulty: "Medium", description: "Cooking guidance bot" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Artechtist AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Community
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
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
          <h2 className="text-3xl font-bold mb-2">Welcome back, Young AI Builder! 🚀</h2>
          <p className="text-muted-foreground text-lg">Ready to create amazing AI agents? Let's build something incredible together!</p>
        </div>

        {/* Quick Actions - AMBY Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 hover:border-orange-300"
            onClick={() => setShowAgentCreation(true)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-orange-600">Create New Project</CardTitle>
              <CardDescription>Build a brand-new conversational agent</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-blue-600">Sample Project</CardTitle>
              <CardDescription>Explore or tinker with pre-built chatbots to learn</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TemplateGallery onUseTemplate={handleUseTemplate} />
            </CardContent>
          </Card>

          <Link to="/voice-training">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-600">Voice Training</CardTitle>
                <CardDescription>Train your AI with voice in African languages</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/cultural-hub">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-purple-600">ML Playground</CardTitle>
                <CardDescription>Gamified ML Learning experince</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/ai-lessons">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 hover:border-yellow-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-yellow-600">AI Comic Lessons</CardTitle>
                <CardDescription>Learn AI through interactive and animative lessons</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/python-ide">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200 hover:border-indigo-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-indigo-600">Python IDE for Kids</CardTitle>
                <CardDescription>Learn Python programming with AI assistance</CardDescription>
              </CardHeader>
            </Card>
          </Link>


        </div>

        {/* Saved Projects Dashboard */}
        <SavedProjectsSection />

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
                Featured Templates
              </CardTitle>
              <CardDescription>Learn from these example bots</CardDescription>
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
                        bot.difficulty === 'Beginner' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                          : bot.difficulty === 'Easy'
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

        {/* Google Assistant Integration Modal */}
        {showGoogleAssistant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Google Assistant Integration</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowGoogleAssistant(false)}>
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading Google Assistant...</span>
                  </div>
                }>
                  <GoogleAssistantIntegration 
                    nodes={[]}
                    edges={[]}
                    onIntentMatch={(intent, confidence) => {
                      console.log('Intent matched:', intent, confidence);
                    }}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
