import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, ArrowRight, Save, Volume2 } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('createAgent.title')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('createAgent.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t('createAgent.agentName')}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Voice & Settings
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
                <div className="text-center space-y-2">
                  <VoiceChatbotSettings />
                  
                  <p className="text-xs text-muted-foreground">
                    ✨ Set up how your AI agent will speak and sound to users
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Voice ready for testing</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button
                  onClick={handleCreateAgent}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create & Start Building
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Your agent will be saved and you'll be taken to the conversation builder
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Preview */}
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Live Preview
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