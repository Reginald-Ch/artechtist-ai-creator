import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Brain, Save, Sparkles, Zap } from "lucide-react";
import { OptimizedAvatarSelector } from "@/components/enhanced/OptimizedAvatarSelector";
import { VoiceChatbotSettings } from "@/components/enhanced/VoiceChatbotSettings";
import { toast } from "@/hooks/use-toast";
import { useAvatarPersistence } from "@/hooks/useAvatarPersistence";
import { useLanguage } from "@/contexts/LanguageContext";

const SimpleAgentCreator = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const { avatar: botAvatar, personality: botPersonality, updateAvatarAndPersonality } = useAvatarPersistence();
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for smoother UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateAgent = () => {
    if (!agentName.trim()) {
      toast({
        title: t('createAgent.agentName'),
        description: "Please enter a name for your AI agent",
        variant: "destructive"
      });
      return;
    }

    const agentData = {
      id: Date.now().toString(),
      name: agentName,
      description: agentDescription,
      avatar: botAvatar,
      personality: botPersonality,
      createdAt: new Date().toISOString()
    };

    const existingAgents = JSON.parse(localStorage.getItem('aiAgents') || '[]');
    existingAgents.push(agentData);
    localStorage.setItem('aiAgents', JSON.stringify(existingAgents));

    toast({
      title: t('createAgent.title'),
      description: `${agentName} has been created successfully`,
    });

    navigate('/builder', { state: { agent: agentData } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[500px]" />
            <Skeleton className="h-[500px]" />
          </div>
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Bot className="h-10 w-10 text-primary animate-bounce" />
              <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {t('createAgent.title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {t('createAgent.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Build your AI agent in 3 simple steps</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <span>Step 1: Basic Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">{t('createAgent.agentName')} *</Label>
                <Input
                  id="agentName"
                  placeholder="e.g., Learning Assistant, Customer Helper..."
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agentDescription">{t('createAgent.agentDescription')}</Label>
                <Textarea
                  id="agentDescription"
                  placeholder="Describe what your AI agent will do..."
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  className="w-full min-h-[100px]"
                />
              </div>

              <Separator />
              
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Avatar & Personality
                </Label>
                <OptimizedAvatarSelector
                  selectedAvatar={botAvatar}
                  onAvatarChange={(avatar, personality) => {
                    updateAvatarAndPersonality(avatar, personality);
                    toast({
                      title: "Avatar updated!",
                      description: `Now using ${avatar} with ${personality} personality`
                    });
                  }}
                />
                <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Current personality:</span> {botPersonality}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice & Settings */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <span>Step 2: Voice & Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <div className="text-6xl mx-auto w-fit p-4 rounded-full bg-primary/10">
                  {botAvatar}
                </div>
                <div>
                  <h3 className="font-medium">{agentName || "Unnamed Agent"}</h3>
                  <p className="text-sm text-muted-foreground">{botPersonality}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Text-to-Speech Settings</span>
                    </div>
                    <VoiceChatbotSettings />
                    <p className="text-xs text-muted-foreground">
                      🎤 Configure voice, language, and speech settings
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">Text-to-Speech Ready</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button
                  onClick={handleCreateAgent}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                >
                  <Save className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Create & Start Building</span>
                </Button>
                
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  ✅ Your agent will be saved and you'll be taken to the conversation builder
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Preview */}
        <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span>Step 3: Live Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border shadow-sm">
              <div className="text-4xl animate-bounce">{botAvatar}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{agentName || "Your AI Agent"}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agentDescription || "Ready to help users with conversational AI"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {botPersonality}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Ready to chat</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Settings Dialog - using VoiceChatbotSettings component */}
      {showVoiceSettings && <VoiceChatbotSettings />}
    </div>
  );
};

export default SimpleAgentCreator;
