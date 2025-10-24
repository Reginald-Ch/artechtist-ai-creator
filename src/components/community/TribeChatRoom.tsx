import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Smile, Hash, Users, Settings, ThumbsUp, Heart, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TribeChatRoomProps {
  tribeId: string;
  isGeneral?: boolean;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  tribe_id?: string;
  reactions?: any;
  profiles?: {
    first_name: string;
    avatar_seed?: string;
    avatar_color?: string;
  };
}

export function TribeChatRoom({ tribeId, isGeneral = false }: TribeChatRoomProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [channelName] = useState(isGeneral ? 'global-chat' : `tribe-${tribeId}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    const cleanup = subscribeToMessages();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      cleanup?.();
    };
  }, [tribeId, isGeneral]);

  const loadMessages = async () => {
    if (isGeneral) {
      const { data, error } = await supabase
        .from('global_chat_messages')
        .select('*, profiles(first_name, avatar_seed, avatar_color)')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }
      setMessages((data || []) as any);
    } else {
      const { data, error } = await supabase
        .from('tribe_chat_messages')
        .select('*, profiles(first_name, avatar_seed, avatar_color)')
        .eq('tribe_id', tribeId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }
      setMessages((data || []) as any);
    }
    scrollToBottom();
  };

  const subscribeToMessages = () => {
    const channelId = isGeneral ? 'general' : tribeId;
    const tableName = isGeneral ? 'global_chat_messages' : 'tribe_chat_messages';
    const channel = supabase
      .channel(`chat-messages-${channelName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName
        },
        async (payload) => {
          const { data } = await supabase
            .from(tableName)
            .select('*, profiles(first_name, avatar_seed, avatar_color)')
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            setMessages(prev => [...prev, data as any]);
            scrollToBottom();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: tableName
        },
        (payload) => {
          // Update message in state (for reactions)
          setMessages(prev => prev.map(m => 
            m.id === payload.new.id ? { ...m, ...payload.new } : m
          ));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing = Object.values(state)
          .flat()
          .filter((p: any) => p.typing && p.user_id !== user?.id)
          .map((p: any) => p.username);
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            username: user?.email?.split('@')[0],
            typing: false
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  };

  const handleTyping = () => {
    if (!channelRef.current) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    channelRef.current.track({
      user_id: user?.id,
      username: user?.email?.split('@')[0],
      typing: true
    });

    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.track({
        user_id: user?.id,
        username: user?.email?.split('@')[0],
        typing: false
      });
    }, 1000);
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
      const tableName = isGeneral ? 'global_chat_messages' : 'tribe_chat_messages';
      const messageData: any = {
        user_id: user.id,
        content: newMessage.trim(),
      };

      // Only add tribe_id for tribe chat
      if (!isGeneral) {
        messageData.tribe_id = tribeId;
      }

      const { error } = await supabase
        .from(tableName)
        .insert(messageData);

      if (error) throw error;
      setNewMessage('');
      
      // Stop typing indicator via existing channel
      if (channelRef.current) {
        channelRef.current.track({
          user_id: user?.id,
          username: user?.email?.split('@')[0],
          typing: false
        });
      }
      /*const channel = supabase.channel(`chat-messages-${channelName}`);
      channel.track({
        user_id: user?.id,
        username: user?.email?.split('@')[0],
        typing: false
      });*/
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const reactions = message.reactions || {};
      const userReactions = reactions[emoji] || [];
      
      const newReactions = userReactions.includes(user?.id)
        ? { ...reactions, [emoji]: userReactions.filter((id: string) => id !== user?.id) }
        : { ...reactions, [emoji]: [...userReactions, user?.id] };

      const tableName = isGeneral ? 'global_chat_messages' : 'tribe_chat_messages';
      const { error } = await supabase
        .from(tableName)
        .update({ reactions: newReactions })
        .eq('id', messageId);

      if (error) throw error;

      // Don't update local state - let realtime handle it
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Channel Header */}
      <div className="h-12 border-b border-border/40 flex items-center px-4 shadow-sm">
        <Hash className="w-5 h-5 text-muted-foreground mr-2" />
        <h2 className="font-semibold text-foreground">{channelName}</h2>
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
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.profiles?.avatar_seed || message.user_id}`} />
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
                      
                      {/* Reactions */}
                      {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {Object.entries(message.reactions).map(([emoji, users]: [string, any]) => {
                            if (!users || users.length === 0) return null;
                            const reacted = users.includes(user?.id);
                            return (
                              <Badge
                                key={emoji}
                                variant={reacted ? "default" : "secondary"}
                                className="cursor-pointer px-2 py-0.5 text-xs gap-1 hover:scale-110 transition-transform"
                                onClick={() => addReaction(message.id, emoji)}
                              >
                                <span>{emoji}</span>
                                <span>{users.length}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Quick Reactions - Show on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => addReaction(message.id, '👍')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => addReaction(message.id, '❤️')}
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => addReaction(message.id, '⚡')}
                        >
                          <Zap className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground italic px-4"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{typingUsers[0]} is typing...</span>
            </motion.div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border/40">
        <form onSubmit={sendMessage}>
          <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder={`Message #${channelName}`}
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
