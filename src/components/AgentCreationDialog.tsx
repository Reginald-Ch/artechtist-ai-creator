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
    name: "Tech Heler",
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
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: "",
    description: "",
    avatar: "🤖",
    personality: "helpful and friendly",
    type: "assistant" as const,
    voiceEnabled: false
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePersonalitySelect = (personality: BotPersonality) => {
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={agentData.name}
                onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Breakfast Guide, Study Buddy..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={agentData.description}
                onChange={(e) => setAgentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What will your agent help with?"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold mb-2">Choose Your Agent's Personality</h4>
              <p className="text-sm text-muted-foreground">This will determine how your agent communicates</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {botPersonalities.map((personality, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all border-2 ${
                    agentData.avatar === personality.avatar 
                      ? 'border-primary shadow-lg' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handlePersonalitySelect(personality)}
                >
                  <CardContent className="p-3">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{personality.avatar}</div>
                      <h5 className="font-medium text-sm">{personality.name}</h5>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {personality.traits.slice(0, 2).map((trait, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold mb-2">Agent Type</h4>
              <p className="text-sm text-muted-foreground">What role will your agent play?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { type: 'assistant', icon: Bot, title: 'Personal Assistant', desc: 'Helps with tasks and questions' },
                { type: 'guide', icon: Star, title: 'Guide', desc: 'Provides guidance and directions' },
                { type: 'tutor', icon: Brain, title: 'Tutor', desc: 'Teaches and explains concepts' },
                { type: 'custom', icon: Sparkles, title: 'Custom', desc: 'Unique role you define' }
              ].map(({ type, icon: Icon, title, desc }) => (
                <Card 
                  key={type}
                  className={`cursor-pointer transition-all border-2 ${
                    agentData.type === type 
                      ? 'border-primary shadow-lg' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => setAgentData(prev => ({ ...prev, type: type as any }))}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className="h-8 w-8 text-primary" />
                    <div>
                      <h5 className="font-medium">{title}</h5>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold mb-2">Review Your Agent</h4>
              <p className="text-sm text-muted-foreground">Everything looks good? Let's create your AI!</p>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{agentData.avatar}</div>
                  <div>
                    <h5 className="text-xl font-semibold">{agentData.name}</h5>
                    <p className="text-sm text-muted-foreground capitalize">{agentData.type}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Personality:</p>
                  <p className="text-sm text-muted-foreground">{agentData.personality}</p>
                </div>
                {agentData.description && (
                  <div>
                    <p className="text-sm font-medium">Description:</p>
                    <p className="text-sm text-muted-foreground">{agentData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Create New AI Agent
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  stepNum <= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div 
                  className={`w-12 h-0.5 transition-colors ${
                    stepNum < step ? 'bg-primary' : 'bg-muted'
                  }`} 
                />
              )}
            </div>
          ))}
        </div>

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleCreate}
              className="bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create AI Agent
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

