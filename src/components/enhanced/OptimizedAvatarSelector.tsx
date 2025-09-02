import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Sparkles, User } from "lucide-react";

interface OptimizedAvatarSelectorProps {
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
  category: 'friendly' | 'educational' | 'creative' | 'cultural' | 'professional';
}

const botPersonalities: BotPersonality[] = [
  // Friendly personalities
  {
    avatar: '😊',
    name: 'Happy Helper',
    personality: 'Cheerful and enthusiastic, always ready to help with a positive attitude',
    description: 'A friendly assistant that brings joy to every interaction',
    traits: ['Optimistic', 'Supportive', 'Encouraging'],
    color: 'from-yellow-400 to-orange-400',
    category: 'friendly'
  },
  {
    avatar: '🤗',
    name: 'Warm Companion',
    personality: 'Caring and empathetic, creating a welcoming environment for all users',
    description: 'Makes everyone feel valued and understood',
    traits: ['Empathetic', 'Caring', 'Inclusive'],
    color: 'from-pink-400 to-rose-400',
    category: 'friendly'
  },
  
  // Educational personalities
  {
    avatar: '🎓',
    name: 'Professor Bot',
    personality: 'Knowledgeable and patient teacher who explains concepts clearly',
    description: 'An expert educator who makes learning enjoyable',
    traits: ['Knowledgeable', 'Patient', 'Clear'],
    color: 'from-blue-400 to-indigo-400',
    category: 'educational'
  },
  {
    avatar: '📚',
    name: 'Study Buddy',
    personality: 'Encouraging learning companion who makes education fun and engaging',
    description: 'Motivates learners and celebrates their progress',
    traits: ['Motivating', 'Engaging', 'Supportive'],
    color: 'from-green-400 to-emerald-400',
    category: 'educational'
  },
  
  // Creative personalities
  {
    avatar: '🎨',
    name: 'Creative Genius',
    personality: 'Imaginative and inspiring, helps unlock creative potential',
    description: 'Sparks creativity and artistic expression',
    traits: ['Imaginative', 'Inspiring', 'Artistic'],
    color: 'from-purple-400 to-violet-400',
    category: 'creative'
  },
  {
    avatar: '✨',
    name: 'Innovation Spark',
    personality: 'Inventive and forward-thinking, always exploring new possibilities',
    description: 'Encourages innovative thinking and breakthrough ideas',
    traits: ['Innovative', 'Visionary', 'Experimental'],
    color: 'from-cyan-400 to-blue-400',
    category: 'creative'
  },
  
  // Cultural personalities
  {
    avatar: '🌍',
    name: 'Global Guide',
    personality: 'Culturally aware and respectful, celebrating diversity and inclusion',
    description: 'Bridges cultures and promotes understanding',
    traits: ['Inclusive', 'Respectful', 'Global'],
    color: 'from-emerald-400 to-teal-400',
    category: 'cultural'
  },
  {
    avatar: '🌺',
    name: 'Cultural Ambassador',
    personality: 'Celebrates traditions and heritage while embracing modern perspectives',
    description: 'Honors cultural richness and promotes cross-cultural dialogue',
    traits: ['Traditional', 'Modern', 'Diplomatic'],
    color: 'from-pink-400 to-purple-400',
    category: 'cultural'
  },
  
  // Professional personalities
  {
    avatar: '💼',
    name: 'Business Pro',
    personality: 'Professional and efficient, focused on productivity and results',
    description: 'Streamlines workflows and enhances business operations',
    traits: ['Professional', 'Efficient', 'Results-driven'],
    color: 'from-gray-600 to-slate-600',
    category: 'professional'
  },
  {
    avatar: '⚡',
    name: 'Tech Expert',
    personality: 'Tech-savvy and analytical, solves problems with precision',
    description: 'Masters technology to deliver optimal solutions',
    traits: ['Analytical', 'Precise', 'Technical'],
    color: 'from-blue-500 to-cyan-500',
    category: 'professional'
  }
];

const categories = [
  { id: 'all', name: 'All', icon: '🌟' },
  { id: 'friendly', name: 'Friendly', icon: '😊' },
  { id: 'educational', name: 'Educational', icon: '🎓' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'cultural', name: 'Cultural', icon: '🌍' },
  { id: 'professional', name: 'Professional', icon: '💼' }
];

export const OptimizedAvatarSelector = ({ selectedAvatar, onAvatarChange }: OptimizedAvatarSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customEmoji, setCustomEmoji] = useState('');

  const filteredPersonalities = useMemo(() => {
    let filtered = botPersonalities;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.traits.some(trait => trait.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleAvatarSelect = (avatar: string, personality: string) => {
    onAvatarChange(avatar, personality);
    setOpen(false);
  };

  const handleCustomEmoji = () => {
    if (customEmoji.trim()) {
      onAvatarChange(customEmoji.trim(), 'Custom personality with unique character traits');
      setCustomEmoji('');
      setOpen(false);
    }
  };

  const selectedPersonality = botPersonalities.find(p => p.avatar === selectedAvatar);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-20 w-20 text-2xl p-0 relative group hover:scale-105 transition-transform">
          <span className="text-3xl">{selectedAvatar}</span>
          <div className="absolute inset-0 bg-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose Your AI Personality
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search personalities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Tabs */}
            <TabsList className="grid grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Content */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {/* Custom Emoji Section */}
                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        ✨ Create Custom Avatar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter any emoji 🎭"
                          value={customEmoji}
                          onChange={(e) => setCustomEmoji(e.target.value)}
                          className="flex-1"
                          maxLength={2}
                        />
                        <Button 
                          onClick={handleCustomEmoji}
                          disabled={!customEmoji.trim()}
                          size="sm"
                        >
                          Use Custom
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personality Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredPersonalities.map((personality) => (
                      <Card 
                        key={`${personality.category}-${personality.name}`}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                          selectedAvatar === personality.avatar ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleAvatarSelect(personality.avatar, personality.personality)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{personality.avatar}</div>
                            <div className="flex-1">
                              <CardTitle className="text-sm">{personality.name}</CardTitle>
                              <Badge variant="outline" className="text-xs mt-1">
                                {personality.category}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-xs mb-2">
                            {personality.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-1">
                            {personality.traits.slice(0, 3).map((trait) => (
                              <Badge key={trait} variant="secondary" className="text-xs px-2 py-0">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredPersonalities.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No personalities found matching your search.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Preview */}
            {selectedPersonality && (
              <Card className="bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-2xl">{selectedPersonality.avatar}</span>
                    Currently Selected: {selectedPersonality.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {selectedPersonality.personality}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};