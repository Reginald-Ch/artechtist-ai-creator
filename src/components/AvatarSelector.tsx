import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Palette, Sparkles, Star } from "lucide-react";
import { communityAvatars, avatarCategories, CommunityAvatar } from "@/data/communityAvatars";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarChange: (avatar: string, personality: string) => void;
}

const AvatarSelector = ({ selectedAvatar, onAvatarChange }: AvatarSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');

  const handleAvatarSelect = (avatar: CommunityAvatar) => {
    onAvatarChange(avatar.emoji, avatar.personality);
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
        <Button variant="outline" className="h-16 w-16 text-2xl p-0 relative z-10 bg-white/90 hover:bg-white border-2">
          <span className="text-2xl drop-shadow-sm">{selectedAvatar || '🤖'}</span>
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

          {/* Community Impact Categories */}
          {avatarCategories.map(category => {
            const categoryAvatars = communityAvatars.filter(a => a.category === category.key);
            
            return (
              <div key={category.key}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {categoryAvatars.map((avatar) => (
                    <Card 
                      key={avatar.id}
                      className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
                        selectedAvatar === avatar.emoji 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAvatarSelect(avatar)}
                    >
                      <CardHeader className="pb-2 text-center">
                        <div className="text-4xl mb-2">{avatar.emoji}</div>
                        <CardTitle className="text-sm">{avatar.name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">{avatar.title}</p>
                      </CardHeader>
                      <CardContent className="pt-0 text-center space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {avatar.description}
                        </p>
                        <div className="text-xs font-medium text-primary">
                          💫 {avatar.impact}
                        </div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {avatar.traits.slice(0, 2).map((trait, traitIndex) => (
                            <Badge 
                              key={traitIndex} 
                              variant="secondary" 
                              className={`text-xs ${avatar.color}`}
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
                    Your AI will be {communityAvatars.find(a => a.emoji === selectedAvatar)?.personality || 'unique'}
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