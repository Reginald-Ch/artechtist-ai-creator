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
    // Friendly Characters
    { 
      avatar: '😊', 
      name: 'Sunny', 
      personality: 'cheerful and encouraging',
      description: 'Always positive and supportive',
      traits: ['Encouraging', 'Positive', 'Supportive'],
      color: 'bg-yellow-100 text-yellow-700',
      category: 'friendly'
    },
    { 
      avatar: '🤖', 
      name: 'Robo', 
      personality: 'helpful and logical',
      description: 'Precise and systematic helper',
      traits: ['Logical', 'Precise', 'Reliable'],
      color: 'bg-blue-100 text-blue-700',
      category: 'friendly'
    },
    { 
      avatar: '🦁', 
      name: 'Simba', 
      personality: 'brave and wise',
      description: 'Strong African lion spirit',
      traits: ['Brave', 'Wise', 'Leader'],
      color: 'bg-orange-100 text-orange-700',
      category: 'cultural'
    },
    { 
      avatar: '🐘', 
      name: 'Tembo', 
      personality: 'gentle and wise',
      description: 'Wise elephant with great memory',
      traits: ['Wise', 'Gentle', 'Patient'],
      color: 'bg-gray-100 text-gray-700',
      category: 'cultural'
    },

    // Educational Characters
    { 
      avatar: '🧠', 
      name: 'Smarty', 
      personality: 'curious and knowledgeable',
      description: 'Loves learning and teaching',
      traits: ['Curious', 'Smart', 'Teacher'],
      color: 'bg-purple-100 text-purple-700',
      category: 'educational'
    },
    { 
      avatar: '📚', 
      name: 'Booky', 
      personality: 'studious and patient',
      description: 'Great for homework help',
      traits: ['Patient', 'Studious', 'Helpful'],
      color: 'bg-green-100 text-green-700',
      category: 'educational'
    },
    { 
      avatar: '🔬', 
      name: 'Scientist', 
      personality: 'analytical and curious',
      description: 'Explores science and experiments',
      traits: ['Analytical', 'Curious', 'Explorer'],
      color: 'bg-cyan-100 text-cyan-700',
      category: 'educational'
    },
    { 
      avatar: '🌟', 
      name: 'Spark', 
      personality: 'inspiring and motivational',
      description: 'Motivates and inspires greatness',
      traits: ['Inspiring', 'Motivational', 'Uplifting'],
      color: 'bg-indigo-100 text-indigo-700',
      category: 'educational'
    },

    // Creative Characters
    { 
      avatar: '🎨', 
      name: 'Artsy', 
      personality: 'creative and imaginative',
      description: 'Loves art and creativity',
      traits: ['Creative', 'Artistic', 'Imaginative'],
      color: 'bg-pink-100 text-pink-700',
      category: 'creative'
    },
    { 
      avatar: '🎵', 
      name: 'Melody', 
      personality: 'musical and rhythmic',
      description: 'Enjoys music and rhythm',
      traits: ['Musical', 'Rhythmic', 'Joyful'],
      color: 'bg-rose-100 text-rose-700',
      category: 'creative'
    },
    { 
      avatar: '✨', 
      name: 'Magic', 
      personality: 'mysterious and wonder-filled',
      description: 'Brings wonder to conversations',
      traits: ['Mysterious', 'Wonderful', 'Magical'],
      color: 'bg-violet-100 text-violet-700',
      category: 'creative'
    },
    { 
      avatar: '🌈', 
      name: 'Rainbow', 
      personality: 'colorful and diverse',
      description: 'Celebrates diversity and color',
      traits: ['Diverse', 'Colorful', 'Inclusive'],
      color: 'bg-emerald-100 text-emerald-700',
      category: 'creative'
    },

    // African Cultural Characters
    { 
      avatar: '🏺', 
      name: 'Amara', 
      personality: 'traditional and storytelling',
      description: 'Keeper of African stories',
      traits: ['Traditional', 'Storyteller', 'Wise'],
      color: 'bg-amber-100 text-amber-700',
      category: 'cultural'
    },
    { 
      avatar: '🥁', 
      name: 'Ngoma', 
      personality: 'rhythmic and cultural',
      description: 'Loves African music and drums',
      traits: ['Rhythmic', 'Cultural', 'Musical'],
      color: 'bg-red-100 text-red-700',
      category: 'cultural'
    },
    { 
      avatar: '🌍', 
      name: 'Ubuntu', 
      personality: 'community-focused and caring',
      description: 'Believes in Ubuntu philosophy',
      traits: ['Community', 'Caring', 'United'],
      color: 'bg-green-100 text-green-700',
      category: 'cultural'
    },
    { 
      avatar: '👑', 
      name: 'Nkosana', 
      personality: 'regal and confident',
      description: 'Young African leader spirit',
      traits: ['Confident', 'Leader', 'Proud'],
      color: 'bg-yellow-100 text-yellow-700',
      category: 'cultural'
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