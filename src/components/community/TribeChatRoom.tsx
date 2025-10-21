import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Smile, Hash, Users, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TribeChatRoomProps {
  tribeId: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  reactions: any;
  profiles?: {
    first_name: string;
  };
}

export function TribeChatRoom({ tribeId }: TribeChatRoomProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [tribeId]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('tribe_chat_messages')
      .select('*')
      .eq('tribe_id', tribeId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    // Fetch profiles for each message
    const messagesWithProfiles = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', msg.user_id)
          .single();
        
        return { ...msg, profiles: profile };
      })
    );

    setMessages(messagesWithProfiles as Message[]);
    scrollToBottom();
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('tribe-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tribe_chat_messages',
          filter: `tribe_id=eq.${tribeId}`
        },
        async (payload) => {
          const { data } = await supabase
            .from('tribe_chat_messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name')
              .eq('user_id', data.user_id)
              .single();
            
            setMessages(prev => [...prev, { ...data, profiles: profile } as Message]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('tribe_chat_messages')
        .insert({
          tribe_id: tribeId,
          user_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Channel Header */}
      <div className="h-12 border-b border-border/40 flex items-center px-4 shadow-sm">
        <Hash className="w-5 h-5 text-muted-foreground mr-2" />
        <h2 className="font-semibold text-foreground">general-chat</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Users className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1]?.user_id !== message.user_id;
              const isCurrentUser = message.user_id === user?.id;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group ${showAvatar ? 'mt-4' : 'mt-0.5'} hover:bg-accent/50 -mx-4 px-4 py-0.5 rounded`}
                >
                  <div className="flex gap-3">
                    {showAvatar ? (
                      <Avatar className="w-10 h-10 mt-0.5">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user_id}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {message.profiles?.first_name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 flex-shrink-0 flex items-start justify-end pr-2">
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {format(new Date(message.created_at), 'HH:mm')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className={`font-semibold text-sm ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                            {message.profiles?.first_name || 'Anonymous'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(message.created_at), 'HH:mm')}
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-foreground break-words">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border/40">
        <form onSubmit={sendMessage}>
          <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message #general-chat"
              disabled={sending}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Smile className="w-5 h-5" />
            </Button>
            <Button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              size="icon"
              className="h-8 w-8"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
