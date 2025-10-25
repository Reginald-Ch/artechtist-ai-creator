import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  user_id: string;
  first_name: string;
  avatar_seed?: string;
  avatar_color?: string;
}

interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
}

export function DirectMessages() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      loadMessages(selectedProfile.user_id);
    }
  }, [selectedProfile]);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user?.id)
      .order('first_name');

    if (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load users');
    } else {
      setProfiles(data || []);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    // Implementation for loading direct messages
    // This would require a new table 'direct_messages' in the database
    toast.info('Direct messaging feature coming soon!');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProfile || !user) return;

    setSending(true);
    try {
      // Implementation for sending direct messages
      toast.success('Message sent!');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* User List */}
      <Card className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </div>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {filteredProfiles.map((profile) => (
              <motion.button
                key={profile.user_id}
                onClick={() => setSelectedProfile(profile)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  selectedProfile?.user_id === profile.user_id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatar_seed || profile.user_id}`} />
                  <AvatarFallback>{profile.first_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">{profile.first_name || 'Anonymous'}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2 p-4 flex flex-col">
        {selectedProfile ? (
          <>
            {/* Chat Header */}
            <div className="pb-4 border-b border-border flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProfile.avatar_seed || selectedProfile.user_id}`} />
                <AvatarFallback>{selectedProfile.first_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{selectedProfile.first_name}</h3>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 py-4">
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Direct messaging feature coming soon!</p>
                  <p className="text-sm mt-2">This feature will be implemented in Phase 6</p>
                </div>
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="pt-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
