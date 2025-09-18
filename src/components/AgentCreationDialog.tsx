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
      <div className="space-y-3">
        <Label className="text-base font-medium">Select an Avatar</Label>
        <div className="grid grid-cols-3 gap-3">
          {botPersonalities.map((personality, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all border-2 ${
                agentData.avatar === personality.avatar 
                  ? 'border-primary shadow-md bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => handleAvatarSelect(personality)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">{personality.avatar}</div>
                <p className="text-xs font-medium">{personality.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Choose an avatar to represent your agent</p>
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
      <DialogContent className="sm:max-w-[500px]">
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
        <div className="flex justify-end pt-6 border-t">
          <Button 
            onClick={handleCreate}
            disabled={!agentData.name.trim()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-2"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create the AI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

