import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Bot, Star, Users, Zap, Plus, Sparkles, Globe, Mic } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import TemplateGallery from "@/components/TemplateGallery";

const Dashboard = () => {
  const navigate = useNavigate();
  
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
            <Avatar>
              <AvatarFallback className="bg-orange-500 text-white">LN</AvatarFallback>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/builder">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 hover:border-orange-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-orange-600">Create New Bot</CardTitle>
                <CardDescription>Start building your AI agent from scratch</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-blue-600">Browse Templates</CardTitle>
              <CardDescription>Get inspired by sample bots and templates</CardDescription>
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-purple-600">Cultural Hub</CardTitle>
              <CardDescription>Explore African stories, languages & traditions</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 hover:border-yellow-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-yellow-600">AI Playground</CardTitle>
              <CardDescription>Experiment with AI concepts and models</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Bots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                My AI Agents
              </CardTitle>
              <CardDescription>Your created bots and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myBots.map((bot) => (
                  <div key={bot.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{bot.avatar}</div>
                      <div>
                        <h3 className="font-medium">{bot.name}</h3>
                        <p className="text-sm text-muted-foreground">Last edited: {bot.lastEdited}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bot.status === 'Active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {bot.status}
                      </span>
                      <Link to={`/builder/${bot.id}`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                    </div>
                  </div>
                ))}
                <Link to="/builder">
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Bot
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

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
      </div>
    </div>
  );
};

export default Dashboard;