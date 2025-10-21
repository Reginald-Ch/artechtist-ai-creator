import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Smile } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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
    <Card className="h-[600px] flex flex-col shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          Tribe Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.user_id === user?.id
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'bg-card border'
                  }`}
                >
                  {message.user_id !== user?.id && (
                    <div className="text-xs font-semibold mb-1 text-primary">
                      {message.profiles?.first_name || 'Anonymous'}
                    </div>
                  )}
                  <div className="break-words">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.user_id === user?.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={scrollRef} />
        </ScrollArea>

        <form onSubmit={sendMessage} className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
