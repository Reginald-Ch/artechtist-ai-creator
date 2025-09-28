import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, Heart, Zap, Brain, Star, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AgentCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BotPersonality {
  avatar: string;
  name: string;
  personality: string;
  description: string;
  traits: string[];
  color: string;
  category: 'friendly' | 'educational' | 'creative' | 'cultural';
}

const botPersonalities: BotPersonality[] = [
  {
    avatar: "🤖",
    name: "Tech Helper",
    personality: "helpful, technical, and precise",
    description: "A knowledgeable assistant that loves solving technical problems",
    traits: ["Problem-solver", "Technical", "Reliable"],
    color: "from-blue-400 to-blue-600",
    category: "friendly"
  },
  {
    avatar: "👨‍🏫",
    name: "Professor Bot",
    personality: "patient, educational, and encouraging",
    description: "A wise teacher who makes learning fun and accessible",
    traits: ["Patient", "Educational", "Encouraging"],
    color: "from-green-400 to-green-600",
    category: "educational"
  },
  {
    avatar: "🎨",
    name: "Creative Muse",
    personality: "imaginative, inspiring, and artistic",
    description: "An artistic soul that sparks creativity and innovation",
    traits: ["Creative", "Inspiring", "Artistic"],
    color: "from-purple-400 to-purple-600",
    category: "creative"
  },
  {
    avatar: "🌍",
    name: "Cultural Guide",
    personality: "wise, respectful, and culturally aware",
    description: "A knowledgeable guide celebrating African heritage and wisdom",
    traits: ["Cultural", "Wise", "Respectful"],
    color: "from-orange-400 to-orange-600",
    category: "cultural"
  },
  {
    avatar: "🚀",
    name: "Adventure Bot",
    personality: "energetic, curious, and adventurous",
    description: "An enthusiastic explorer ready for any challenge",
    traits: ["Energetic", "Curious", "Bold"],
    color: "from-red-400 to-red-600",
    category: "friendly"
  },
  {
    avatar: "💝",
    name: "Caring Assistant",
    personality: "empathetic, supportive, and kind",
    description: "A compassionate helper who truly cares about users",
    traits: ["Empathetic", "Supportive", "Kind"],
    color: "from-pink-400 to-pink-600",
    category: "friendly"
  }
];

export const AgentCreationDialog = ({ open, onOpenChange }: AgentCreationDialogProps) => {
  const [agentData, setAgentData] = useState({
    name: "",
    description: "",
    avatar: "🤖",
    personality: "helpful and friendly",
    type: "assistant" as const,
    voiceEnabled: false
  });
  const navigate = useNavigate();

  const handleAvatarSelect = (personality: BotPersonality) => {
    setAgentData(prev => ({
      ...prev,
      avatar: personality.avatar,
      personality: personality.personality,
      description: prev.description || personality.description
    }));
  };

  const handleCreate = () => {
    if (!agentData.name.trim()) {
      toast({ title: "Please enter an agent name", variant: "destructive" });
      return;
    }

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

    localStorage.setItem(`agent-${Date.now()}`, JSON.stringify(projectData));
    
    toast({ 
      title: "Agent created successfully!", 
      description: `${agentData.name} is ready to start learning` 
    });

    // Navigate to bot builder with agent data
    navigate('/builder', { state: { template: projectData } });
    onOpenChange(false);
  };

  const renderCreationForm = () => (
    <div className="space-y-6">
      {/* Agent Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-medium">Agent Name</Label>
        <Input
          id="name"
          value={agentData.name}
          onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Breakfast Guide, Story Helper, Math Buddy..."
          className="text-lg h-12"
        />
        <p className="text-sm text-muted-foreground">Give your agent a memorable name</p>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Select an Avatar & Personality</Label>
        <div className="grid grid-cols-2 gap-4">
          {botPersonalities.map((personality, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
                agentData.avatar === personality.avatar 
                  ? 'border-orange-500 shadow-lg bg-orange-50 dark:bg-orange-950/20' 
                  : 'border-border hover:border-orange-300'
              }`}
              onClick={() => handleAvatarSelect(personality)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl flex-shrink-0">{personality.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{personality.name}</h4>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {personality.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {personality.traits.slice(0, 2).map((trait, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {agentData.avatar === personality.avatar && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Selected Personality Preview */}
        {agentData.avatar && (
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{agentData.avatar}</span>
              <div>
                <h5 className="font-medium text-sm">Selected Personality</h5>
                <p className="text-xs text-muted-foreground">{agentData.personality}</p>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">Choose an avatar and personality that fits your agent's role</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">What will your agent help with? (Optional)</Label>
        <Textarea
          id="description"
          value={agentData.description}
          onChange={(e) => setAgentData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="e.g., Helps students with breakfast recipes, answers cooking questions..."
          className="min-h-20"
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Create New AI Agent
          </DialogTitle>
        </DialogHeader>

        {/* Simple Creation Form */}
        <div className="py-4">
          {renderCreationForm()}
        </div>

        {/* Create Button */}
        <div className="flex flex-col gap-3 pt-6 border-t">
          <Button 
            onClick={handleCreate}
            disabled={!agentData.name.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create AI Agent & Start Building
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Your agent will be created and you'll be taken to the conversation builder
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

