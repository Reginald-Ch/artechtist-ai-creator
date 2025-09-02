import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Sparkles, Users, Heart, Brain, Zap, Music, Star } from "lucide-react";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarChange: (avatar: string, personality: string) => void;
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

const AvatarSelector = ({ selectedAvatar, onAvatarChange }: AvatarSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');

  const botPersonalities: BotPersonality[] = [
    // Professional Characters
    { 
      avatar: '👨‍⚕️', 
      name: 'Dr. Smith', 
      personality: 'caring and professional medical assistant',
      description: 'Helpful medical knowledge companion',
      traits: ['Caring', 'Professional', 'Knowledgeable'],
      color: 'bg-blue-100 text-blue-700',
      category: 'educational'
    },
    { 
      avatar: '👩‍🏫', 
      name: 'Teacher Jane', 
      personality: 'patient and educational mentor',
      description: 'Loves teaching and explaining concepts',
      traits: ['Patient', 'Educational', 'Supportive'],
      color: 'bg-green-100 text-green-700',
      category: 'educational'
    },
    { 
      avatar: '👨‍🍳', 
      name: 'Chef Marco', 
      personality: 'creative culinary expert',
      description: 'Passionate about cooking and recipes',
      traits: ['Creative', 'Passionate', 'Expert'],
      color: 'bg-orange-100 text-orange-700',
      category: 'creative'
    },
    { 
      avatar: '🤖', 
      name: 'AI Bot', 
      personality: 'intelligent and logical assistant',
      description: 'Advanced AI with logical thinking',
      traits: ['Intelligent', 'Logical', 'Helpful'],
      color: 'bg-purple-100 text-purple-700',
      category: 'friendly'
    },
    { 
      avatar: '👨‍🔧', 
      name: 'Engineer Mike', 
      personality: 'technical problem-solving expert',
      description: 'Loves building and fixing things',
      traits: ['Technical', 'Problem-solver', 'Innovative'],
      color: 'bg-gray-100 text-gray-700',
      category: 'educational'
    },
    { 
      avatar: '👩‍🔬', 
      name: 'Dr. Science', 
      personality: 'curious scientific researcher',
      description: 'Explores the wonders of science',
      traits: ['Curious', 'Analytical', 'Explorer'],
      color: 'bg-cyan-100 text-cyan-700',
      category: 'educational'
    },
    { 
      avatar: '👨‍🚀', 
      name: 'Captain Space', 
      personality: 'adventurous space explorer',
      description: 'Dreams of stars and space travel',
      traits: ['Adventurous', 'Brave', 'Dreamer'],
      color: 'bg-indigo-100 text-indigo-700',
      category: 'creative'
    },
    { 
      avatar: '👩‍🎓', 
      name: 'Student Sarah', 
      personality: 'eager learner and study buddy',
      description: 'Always excited to learn new things',
      traits: ['Eager', 'Studious', 'Friendly'],
      color: 'bg-pink-100 text-pink-700',
      category: 'friendly'
    },
    { 
      avatar: '👩‍⚕️', 
      name: 'Nurse Clara', 
      personality: 'compassionate healthcare helper',
      description: 'Caring and supportive medical assistant',
      traits: ['Compassionate', 'Caring', 'Helpful'],
      color: 'bg-red-100 text-red-700',
      category: 'friendly'
    },
    { 
      avatar: '👨‍💻', 
      name: 'Coder Alex', 
      personality: 'tech-savvy programming mentor',
      description: 'Loves coding and technology',
      traits: ['Tech-savvy', 'Logical', 'Patient'],
      color: 'bg-emerald-100 text-emerald-700',
      category: 'educational'
    },
    { 
      avatar: '👨‍👩‍👧‍👦', 
      name: 'Father Frank', 
      personality: 'wise and caring family man',
      description: 'Supportive and understanding dad',
      traits: ['Wise', 'Caring', 'Supportive'],
      color: 'bg-amber-100 text-amber-700',
      category: 'friendly'
    },
    { 
      avatar: '👩‍👧‍👦', 
      name: 'Mother Mary', 
      personality: 'nurturing and loving parent',
      description: 'Warm and caring mother figure',
      traits: ['Nurturing', 'Loving', 'Patient'],
      color: 'bg-rose-100 text-rose-700',
      category: 'friendly'
    },
    { 
      avatar: '🦸‍♂️', 
      name: 'Hero Max', 
      personality: 'brave and inspiring superhero',
      description: 'Always ready to help and inspire',
      traits: ['Brave', 'Inspiring', 'Strong'],
      color: 'bg-blue-100 text-blue-700',
      category: 'creative'
    },
    { 
      avatar: '⚽', 
      name: 'Coach Sam', 
      personality: 'motivational sports trainer',
      description: 'Energetic and encouraging coach',
      traits: ['Motivational', 'Energetic', 'Team-player'],
      color: 'bg-green-100 text-green-700',
      category: 'friendly'
    },
    { 
      avatar: '🏴‍☠️', 
      name: 'Captain Pirate', 
      personality: 'adventurous and bold explorer',
      description: 'Seeks treasure and adventure',
      traits: ['Adventurous', 'Bold', 'Free-spirited'],
      color: 'bg-yellow-100 text-yellow-700',
      category: 'creative'
    },
    { 
      avatar: '🕷️', 
      name: 'Ananse', 
      personality: 'wise African storyteller',
      description: 'Keeper of ancient wisdom and stories',
      traits: ['Wise', 'Storyteller', 'Cultural'],
      color: 'bg-orange-100 text-orange-700',
      category: 'cultural'
    },
    { 
      avatar: '🎭', 
      name: 'Actor Ace', 
      personality: 'dramatic and expressive performer',
      description: 'Brings stories to life with passion',
      traits: ['Dramatic', 'Expressive', 'Creative'],
      color: 'bg-purple-100 text-purple-700',
      category: 'creative'
    },
    { 
      avatar: '⚖️', 
      name: 'Lawyer Lisa', 
      personality: 'logical and fair legal advisor',
      description: 'Seeks justice and fairness',
      traits: ['Logical', 'Fair', 'Knowledgeable'],
      color: 'bg-gray-100 text-gray-700',
      category: 'educational'
    },
    { 
      avatar: '🎨', 
      name: 'Artist Amy', 
      personality: 'creative and imaginative designer',
      description: 'Sees beauty in everything',
      traits: ['Creative', 'Imaginative', 'Artistic'],
      color: 'bg-pink-100 text-pink-700',
      category: 'creative'
    },
    { 
      avatar: '🚑', 
      name: 'First Aid Felix', 
      personality: 'calm emergency responder',
      description: 'Quick thinking in emergencies',
      traits: ['Calm', 'Quick-thinking', 'Helpful'],
      color: 'bg-red-100 text-red-700',
      category: 'educational'
    },
    { 
      avatar: '🚒', 
      name: 'Firefighter Fred', 
      personality: 'brave and heroic rescuer',
      description: 'Always ready to help in danger',
      traits: ['Brave', 'Heroic', 'Strong'],
      color: 'bg-red-100 text-red-700',
      category: 'friendly'
    },
    { 
      avatar: '🖌️', 
      name: 'Painter Paul', 
      personality: 'artistic and detail-oriented creator',
      description: 'Creates beautiful works of art',
      traits: ['Artistic', 'Detail-oriented', 'Patient'],
      color: 'bg-violet-100 text-violet-700',
      category: 'creative'
    },
  ];

  const categories = [
    { key: 'friendly', name: 'Friendly', icon: Heart, color: 'text-red-500' },
    { key: 'educational', name: 'Educational', icon: Brain, color: 'text-blue-500' },
    { key: 'creative', name: 'Creative', icon: Palette, color: 'text-purple-500' },
    { key: 'cultural', name: 'African Culture', icon: Users, color: 'text-orange-500' },
  ];

  const handleAvatarSelect = (personality: BotPersonality) => {
    onAvatarChange(personality.avatar, personality.personality);
    setIsOpen(false);
  };

  const handleCustomEmoji = () => {
    if (customEmoji.trim()) {
      onAvatarChange(customEmoji, 'custom personality');
      setCustomEmoji('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-16 w-16 text-2xl p-0">
          {selectedAvatar || '🤖'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Choose Your AI's Personality
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Custom Emoji Input */}
          <Card className="border-dashed border-2 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Create Custom Character
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter any emoji 🦄"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleCustomEmoji} disabled={!customEmoji.trim()}>
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category Tabs */}
          {categories.map(category => {
            const Icon = category.icon;
            const categoryPersonalities = botPersonalities.filter(p => p.category === category.key);
            
            return (
              <div key={category.key}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${category.color}`} />
                  {category.name}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categoryPersonalities.map((personality, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
                        selectedAvatar === personality.avatar 
                          ? 'border-orange-500 ring-2 ring-orange-200' 
                          : 'border-border hover:border-orange-300'
                      }`}
                      onClick={() => handleAvatarSelect(personality)}
                    >
                      <CardHeader className="pb-2 text-center">
                        <div className="text-4xl mb-2">{personality.avatar}</div>
                        <CardTitle className="text-sm">{personality.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 text-center">
                        <p className="text-xs text-muted-foreground mb-2">
                          {personality.description}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {personality.traits.slice(0, 2).map((trait, traitIndex) => (
                            <Badge 
                              key={traitIndex} 
                              variant="secondary" 
                              className={`text-xs ${personality.color}`}
                            >
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Preview */}
        {selectedAvatar && (
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 text-2xl">
                  <AvatarFallback className="bg-transparent text-2xl">
                    {selectedAvatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">Selected Character</h4>
                  <p className="text-sm text-muted-foreground">
                    Your AI will be {botPersonalities.find(p => p.avatar === selectedAvatar)?.personality || 'unique'}
                  </p>
                </div>
                <div className="ml-auto">
                  <Star className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AvatarSelector;