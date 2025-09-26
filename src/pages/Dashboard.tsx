import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Brain, Bot, Star, Users, Zap, Plus, Sparkles, Globe, Mic, BookOpen, LogOut, Settings, Radio, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header - Ambi Style */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              amby
            </h1>
            <div className="ml-4 px-3 py-1 bg-muted rounded-full">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                DASHBOARD
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Users className="h-4 w-4 mr-2" />
              INTEGRATIONS
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-white text-sm">
                {user?.email?.substring(0, 2).toUpperCase() || "AI"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section - Ambi Style */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-3 text-foreground">AI Intent Builder</h2>
          <p className="text-muted-foreground">Build and test your conversational AI agents with visual flow editing.</p>
        </div>

        {/* Main Flow Area - Ambi Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Intent Flow Builder */}
          <div className="lg:col-span-2">
            <Card className="min-h-[500px] border border-border/50 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      {/* Intent Nodes */}
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div className="w-24 h-1 bg-border rounded-full"></div>
                        <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                          <span className="text-sm font-medium text-primary">Default Fallback</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-24 h-1 bg-border rounded-full"></div>
                        <div className="px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-lg">
                          <span className="text-sm font-medium text-secondary-foreground">Greet</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowAgentCreation(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      ADD AN INTENT
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chatbot Test Panel - Ambi Style */}
          <div>
            <Card className="h-[500px] bg-primary/5 border border-primary/20 shadow-sm">
              <CardHeader className="pb-4 bg-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Test BreakfastGuide</CardTitle>
                    <p className="text-sm text-muted-foreground">Chat interface for testing</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-4 border">
                    <p className="text-sm text-foreground">
                      Hello, I am BreakfastGuide. You can chat with me here!
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type Something" 
                      className="flex-1 bg-background"
                    />
                    <Button size="icon" variant="outline">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer border border-border/50"
            onClick={() => setShowAgentCreation(true)}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-2 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">Create Agent</CardTitle>
            </CardHeader>
          </Card>

          <Link to="/ai-playground">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-600">AI Model Playground</CardTitle>
                <CardDescription>Build, train & play with AI models - kid-friendly!</CardDescription>
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
                <CardTitle className="text-yellow-600">Progressive Learning Hub</CardTitle>
                <CardDescription>AI lessons with streak tracking & achievements</CardDescription>
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

        {/* Saved Projects Dashboard - AMBY Style */}
        <div className="mb-8" id="saved-projects">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" />
            Your Conversational Agents
          </h3>
          <div className="text-sm text-muted-foreground mb-4">
            Continue working on your projects or create a new one
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
                <div className="text-center p-8 text-muted-foreground">
                  <p>Create a bot to enable voice integration</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
