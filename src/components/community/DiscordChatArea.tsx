import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Mic, Paperclip, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  reactions: any[];
  profiles?: {
    first_name: string;
    avatar_seed: string;
  };
}

interface DiscordChatAreaProps {
  channelId: string;
  channelName: string;
}

const REACTIONS = ['👍', '❤️', '🎉', '🔥', '✨', '🚀'];

export function DiscordChatArea({ channelId, channelName }: DiscordChatAreaProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [channelId]);

  const loadMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('global_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, first_name, avatar_seed')
        .in('user_id', userIds);

      // Merge messages with profiles
      const messagesWithProfiles = messagesData?.map(msg => ({
        ...msg,
        profiles: profilesData?.find(p => p.user_id === msg.user_id)
      }));

      setMessages(messagesWithProfiles as any || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'global_chat_messages'
        },
        async (payload) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, avatar_seed')
            .eq('user_id', payload.new.user_id)
            .single();

          setMessages(prev => [...prev, { ...payload.new, profiles: profileData } as any]);
          scrollToBottom();
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

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('global_chat_messages')
        .insert({
          content: newMessage,
          user_id: user?.id
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const reactions = message.reactions || [];
      const existingReaction = reactions.find((r: any) => r.emoji === emoji);

      let newReactions;
      if (existingReaction) {
        if (existingReaction.users?.includes(user?.id)) {
          newReactions = reactions.map((r: any) => 
            r.emoji === emoji 
              ? { ...r, count: r.count - 1, users: r.users.filter((id: string) => id !== user?.id) }
              : r
          ).filter((r: any) => r.count > 0);
        } else {
          newReactions = reactions.map((r: any) => 
            r.emoji === emoji 
              ? { ...r, count: r.count + 1, users: [...(r.users || []), user?.id] }
              : r
          );
        }
      } else {
        newReactions = [...reactions, { emoji, count: 1, users: [user?.id] }];
      }

      const { error } = await supabase
        .from('global_chat_messages')
        .update({ reactions: newReactions })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-screen">
      {/* Channel Header */}
      <div className="h-14 border-b border-border/40 px-6 flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
        <Hash className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-lg font-bold text-white">{channelName}</h1>
          <p className="text-xs text-white/70">Join the conversation!</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl">
          <AnimatePresence>
            {messages.map((message, idx) => {
              const showAvatar = idx === 0 || messages[idx - 1].user_id !== message.user_id;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${!showAvatar ? 'ml-12' : ''} group hover:bg-accent/5 px-3 py-1 rounded transition-colors`}
                >
                  {showAvatar && (
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.profiles?.avatar_seed}`} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-bold">
                        {message.profiles?.first_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {message.profiles?.first_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-white/50">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-sm text-white/90 break-words">{message.content}</p>
                    
                    {/* Reactions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.reactions?.map((reaction: any, rIdx: number) => (
                        <button
                          key={rIdx}
                          onClick={() => addReaction(message.id, reaction.emoji)}
                          className={`
                            px-2 py-0.5 rounded-full text-xs flex items-center gap-1
                            transition-all hover:scale-105
                            ${reaction.users?.includes(user?.id)
                              ? 'bg-primary/20 border border-primary/40'
                              : 'bg-accent/30 border border-accent hover:border-primary/40'
                            }
                          `}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="font-semibold">{reaction.count}</span>
                        </button>
                      ))}
                      
                      {/* Quick Reactions (on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {REACTIONS.slice(0, 3).map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message.id, emoji)}
                            className="px-1.5 py-0.5 rounded hover:bg-accent/50 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
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
      <div className="p-4 border-t border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-primary/20 px-3 py-2 focus-within:border-primary/40 transition-all">
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message #${channelName} - Earn XP for every message! ✨`}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
            />
            
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <Smile className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <Mic className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading}
              size="icon" 
              className="h-8 w-8 flex-shrink-0 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-white/60 mt-2 px-1">
            💡 Tip: Earn XP by chatting, helping others, and completing challenges!
          </p>
        </div>
      </div>
    </div>
  );
}
