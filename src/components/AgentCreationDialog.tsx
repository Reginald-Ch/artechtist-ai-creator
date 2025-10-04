import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Bot, Sparkles, X, Save, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { communityAvatars, avatarCategories } from "@/data/communityAvatars";
import { VoiceChatbotSettings } from "@/components/enhanced/VoiceChatbotSettings";
import { useAvatarPersistence } from "@/hooks/useAvatarPersistence";

interface AgentCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgentCreationDialog = ({ open, onOpenChange }: AgentCreationDialogProps) => {
  const { t } = useLanguage();
  const { avatar: savedAvatar, personality: savedPersonality, updateAvatarAndPersonality } = useAvatarPersistence();
  const [agentData, setAgentData] = useState({
    name: "",
    description: "",
    avatar: savedAvatar || "🤖",
    personality: savedPersonality || "helpful and friendly",
    type: "assistant" as const,
    voiceEnabled: false
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('education');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize with saved avatar
  useEffect(() => {
    if (savedAvatar && savedPersonality) {
      setAgentData(prev => ({
        ...prev,
        avatar: savedAvatar,
        personality: savedPersonality
      }));
    }
  }, [savedAvatar, savedPersonality]);

  const handleAvatarSelect = (emoji: string, personality: string) => {
    setAgentData(prev => ({
      ...prev,
      avatar: emoji,
      personality: personality
    }));
    updateAvatarAndPersonality(emoji, personality);
    toast({
      title: "Avatar updated!",
      description: Now using ${emoji} with ${personality} personality
    });
  };

  const handleCreate = async () => {
    if (!agentData.name.trim()) {
      toast({ title: t('createAgent.pleaseEnterAgentName'), variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Save to localStorage
    const projectData = {
      name: agentData.name,
      botName: agentData.name,
      botAvatar: agentData.avatar,
      botPersonality: agentData.personality,
      description: agentData.description,
      type: agentData.type,
      voiceEnabled: agentData.voiceEnabled,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(agent-${Date.now()}, JSON.stringify(projectData));
    
    toast({ 
      title: t('createAgent.agentCreatedSuccess'), 
      description: ${agentData.name} ${t('createAgent.agentCreatedReady')} 
    });

    // Navigate to bot builder with agent data
    navigate('/builder', { state: { template: projectData } });
    setIsLoading(false);
    onOpenChange(false);
  };

  const renderCreationForm = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Agent Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          {t('createAgent.agentName')}
        </Label>
        <Input
          id="name"
          value={agentData.name}
          onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t('createAgent.namePlaceholder')}
          className="text-lg h-12 border-2 focus:border-primary"
        />
        <p className="text-xs text-muted-foreground">✨ {t('botBuilder.giveMemorableName')}</p>
      </div>

      <Separator />

      {/* Avatar Selection - Using Community Avatars */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          {t('botBuilder.selectAvatar')} & {t('botBuilder.selectPersonality')}
        </Label>
        
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            {avatarCategories.slice(0, 4).map((category) => (
              <TabsTrigger 
                key={category.key} 
                value={category.key}
                className="text-xs py-2"
              >
                <span className="mr-1">{category.icon}</span>
                <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {avatarCategories.map((category) => (
            <TabsContent key={category.key} value={category.key} className="mt-4">
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {communityAvatars
                  .filter((avatar) => avatar.category === category.key)
                  .map((avatar) => (
                    <Card 
                      key={avatar.id}
                      className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
                        agentData.avatar === avatar.emoji 
                          ? 'border-primary shadow-lg bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAvatarSelect(avatar.emoji, avatar.personality)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl flex-shrink-0">{avatar.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">{avatar.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {avatar.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {avatar.traits.slice(0, 2).map((trait, i) => (
                                <Badge key={i} variant="secondary" className="text-xs px-2 py-0">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {agentData.avatar === avatar.emoji && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Selected Avatar Preview */}
        {agentData.avatar && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{agentData.avatar}</span>
              <div>
                <h5 className="font-semibold text-sm">{t('botBuilder.selectedPersonality')}</h5>
                <p className="text-xs text-muted-foreground">{agentData.personality}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold">
          {t('botBuilder.whatWillAgentHelp')}
        </Label>
        <Textarea
          id="description"
          value={agentData.description}
          onChange={(e) => setAgentData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="e.g., Helps students with breakfast recipes, answers cooking questions..."
          className="min-h-20 border-2 focus:border-primary"
          rows={3}
        />
      </div>

      <Separator />

      {/* Voice Settings */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Text-to-Speech Settings</span>
          </div>
          <VoiceChatbotSettings />
          <p className="text-xs text-muted-foreground text-center">
            🎤 Configure voice, language, and speech settings
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2 pr-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <span>{t('createAgent.createNewAIAgent')}</span>
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-0 top-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {/* Simple Creation Form */}
        <div className="py-4">
          {renderCreationForm()}
        </div>

        {/* Create Button */}
        <div className="flex flex-col gap-3 pt-6 border-t">
          <Button 
            onClick={handleCreate}
            disabled={!agentData.name.trim() || isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {t('createAgent.createAgentStartBuilding')}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            ✅ {t('createAgent.agentWillBeCreated')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
