import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Sparkles, User } from "lucide-react";
import { communityAvatars, avatarCategories, type CommunityAvatar } from "@/data/communityAvatars";

interface OptimizedAvatarSelectorProps {
  selectedAvatar: string;
  onAvatarChange: (avatar: string, personality: string) => void;
}

const OptimizedAvatarSelector = ({ selectedAvatar, onAvatarChange }: OptimizedAvatarSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customEmoji, setCustomEmoji] = useState('');

  const filteredPersonalities = useMemo(() => {
    let filtered = communityAvatars;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.traits.some(trait => trait.toLowerCase().includes(query)) ||
        p.title.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleAvatarSelect = (personality: CommunityAvatar) => {
    onAvatarChange(personality.emoji, personality.personality);
    setOpen(false);
  };

  const handleCustomEmoji = () => {
    if (customEmoji.trim()) {
      onAvatarChange(customEmoji.trim(), 'custom personality');
      setOpen(false);
      setCustomEmoji('');
    }
  };

  const selectedPersonality = communityAvatars.find(p => p.emoji === selectedAvatar);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={() => setOpen(true)}
          className="w-full justify-start gap-2 h-auto p-3"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{selectedAvatar || '🤖'}</div>
            <div className="text-left">
              <div className="font-medium">
                {selectedPersonality ? selectedPersonality.name : 'Choose Avatar'}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedPersonality ? `${selectedPersonality.title} - ${selectedPersonality.description}` : 'Select a community hero for your bot'}
              </div>
            </div>
          </div>
          <Sparkles className="h-4 w-4 ml-auto" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose Your Bot's Personality
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search personalities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="all" className="text-xs">
                <span className="mr-1">✨</span>
                All
              </TabsTrigger>
              {avatarCategories.slice(0, 7).map(category => (
                <TabsTrigger key={category.key} value={category.key} className="text-xs">
                  <span className="mr-1">{category.icon}</span>
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-4 mt-4">
              <ScrollArea className="h-[50vh] pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredPersonalities.map((personality) => (
                    <Card 
                      key={personality.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:scale-105 border-2 hover:border-primary"
                      onClick={() => handleAvatarSelect(personality)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-3xl mb-2">{personality.emoji}</div>
                        <h3 className="font-medium text-sm mb-1">{personality.name}</h3>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">{personality.title}</p>
                        <Badge variant="outline" className={`text-xs mb-2 ${avatarCategories.find(c => c.key === personality.category)?.color || 'text-muted-foreground'}`}>
                          {avatarCategories.find(c => c.key === personality.category)?.name || personality.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {personality.description}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {personality.traits.slice(0, 2).map((trait, traitIndex) => (
                            <Badge key={traitIndex} variant="secondary" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 italic">
                          "{personality.impact}"
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredPersonalities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No personalities found</p>
                    <p className="text-sm mt-2">Try adjusting your search or category filter</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Custom Emoji Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Or Create Custom Avatar
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter any emoji..."
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                className="flex-1"
                maxLength={2}
              />
              <Button 
                onClick={handleCustomEmoji}
                disabled={!customEmoji.trim()}
                variant="outline"
              >
                Use Custom
              </Button>
            </div>
          </div>

          {selectedPersonality && (
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <span className="text-2xl">{selectedPersonality.emoji}</span>
                Currently Selected: {selectedPersonality.name}
              </h3>
              <p className="text-sm font-semibold text-primary mb-1">{selectedPersonality.title}</p>
              <p className="text-sm text-muted-foreground mb-2">{selectedPersonality.description}</p>
              <p className="text-xs italic text-muted-foreground mb-2">"{selectedPersonality.impact}"</p>
              <div className="flex flex-wrap gap-1">
                {selectedPersonality.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { OptimizedAvatarSelector };