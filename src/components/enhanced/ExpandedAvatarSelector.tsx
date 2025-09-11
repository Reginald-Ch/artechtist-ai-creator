import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExpandedAvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (avatar: string) => void;
}

export const ExpandedAvatarSelector: React.FC<ExpandedAvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarSelect
}) => {
  const avatarCategories = {
    characters: {
      title: "Characters",
      avatars: ["🤖", "👨‍💻", "👩‍💻", "🧙‍♂️", "🧙‍♀️", "👨‍🏫", "👩‍🏫", "👨‍🔬", "👩‍🔬", "🦸‍♂️", "🦸‍♀️"]
    },
    animals: {
      title: "Animals",
      avatars: ["🐱", "🐶", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐷", "🐒"]
    },
    objects: {
      title: "Objects",
      avatars: ["💎", "⭐", "🌟", "💡", "🔮", "🎯", "🎪", "🎨", "🎭", "🎪", "🏆", "🔥", "⚡", "🌈"]
    },
    african: {
      title: "African Heritage",
      avatars: ["👨🏾‍💻", "👩🏾‍💻", "👨🏿‍🏫", "👩🏿‍🏫", "🦁", "🐘", "🦓", "🌍", "🏺", "🥁", "🎭", "🌅"]
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Choose Your AI Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="characters">People</TabsTrigger>
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="objects">Objects</TabsTrigger>
            <TabsTrigger value="african">Heritage</TabsTrigger>
          </TabsList>
          
          {Object.entries(avatarCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {category.avatars.map((avatar) => (
                  <Button
                    key={avatar}
                    variant={selectedAvatar === avatar ? "default" : "outline"}
                    size="sm"
                    onClick={() => onAvatarSelect(avatar)}
                    className="h-12 w-12 text-xl p-0 relative"
                  >
                    {avatar}
                    {selectedAvatar === avatar && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                        ✓
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExpandedAvatarSelector;