import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Trophy, Target, User, BookOpen, Hash, Bell, Settings, Zap, Crown, Medal, LogOut, Users } from 'lucide-react';
import { TribeChatRoom } from './TribeChatRoom';
import { DirectMessages } from './DirectMessages';
import { Leaderboard } from './Leaderboard';
import { ChallengeZone } from './ChallengeZone';
import { ProfileCustomization } from './ProfileCustomization';
import { ProjectFeed } from './ProjectFeed';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommunityDashboardProps {
  userTribe: any;
}

export function CommunityDashboard({ userTribe }: CommunityDashboardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('general');
  const [leaving, setLeaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('avatar_seed, avatar_color, first_name')
      .eq('user_id', user.id)
      .single();
    
    setUserProfile(data);
  };

  const channels = [
    { id: 'general', name: 'global-chat', icon: Users, type: 'text', description: 'Everyone across all tribes!' },
    { id: 'tribe-chat', name: `${userTribe.tribe?.name.toLowerCase().replace(/\s+/g, '-')}`, icon: Hash, type: 'text', description: 'Your tribe channel' },
    { id: 'dm', name: 'direct-messages', icon: MessageSquare, type: 'text', description: 'Private conversations' },
    { id: 'projects', name: 'project-showcase', icon: BookOpen, type: 'text', description: 'Share your creations' },
    { id: 'leaderboard', name: 'hall-of-fame', icon: Trophy, type: 'text', description: 'Top innovators' },
    { id: 'challenges', name: 'quest-board', icon: Target, type: 'text', description: 'Epic quests await' },
  ];

  const handleLeaveTribe = async () => {
    setLeaving(true);
    try {
      // Delete tribe membership
      const { error: deleteError } = await supabase
        .from('tribe_memberships')
        .delete()
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      // Update tribe member count
      await supabase
        .from('tribes')
        .update({ member_count: Math.max(0, (userTribe.tribe?.member_count || 1) - 1) })
        .eq('id', userTribe.tribe_id);

      toast.success('Left tribe successfully');
      navigate('/community');
    } catch (error) {
      console.error('Error leaving tribe:', error);
      toast.error('Failed to leave tribe');
    } finally {
      setLeaving(false);
    }
  };

  const getViewTitle = () => {
    const channel = channels.find(c => c.id === activeView);
    return channel ? channel.name : 'profile';
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-card to-background">
      {/* Left Sidebar - Discord Style Enhanced */}
      <div className="w-60 bg-card border-r border-border/40 flex flex-col">
        {/* Tribe Header */}
        <div className="h-14 border-b border-border/40 px-4 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{userTribe.tribe?.emoji}</span>
            <h2 className="font-bold text-foreground truncate">
              {userTribe.tribe?.name}
            </h2>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <LogOut className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave {userTribe.tribe?.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave your tribe? You'll lose your progress, XP, and badges. You can join a different tribe afterward.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLeaveTribe}
                  disabled={leaving}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {leaving ? 'Leaving...' : 'Leave Tribe'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Channels */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            <div className="px-2 py-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Channels
              </span>
            </div>
            
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.id} className="relative group">
                  <button
                    onClick={() => setActiveView(channel.id)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all
                      ${activeView === channel.id 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:border-l-2 hover:border-primary/50'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${activeView === channel.id ? 'text-primary' : ''}`} />
                    <span className="text-sm truncate">{channel.name}</span>
                  </button>
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-popover border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    <p className="text-xs font-medium">{channel.name}</p>
                    <p className="text-xs text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
              );
            })}

            <Separator className="my-2" />

            <button
              onClick={() => setActiveView('profile')}
              className={`
                w-full flex items-center gap-2 px-2 py-1.5 rounded
                transition-colors
                ${activeView === 'profile' 
                  ? 'bg-accent text-foreground' 
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }
              `}
            >
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Profile</span>
            </button>
          </div>
        </ScrollArea>

        {/* User Footer */}
          <div className="p-2 border-t border-border/40 bg-muted/30">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.avatar_seed || user?.id}`} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {userProfile?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {userProfile?.first_name || user?.email?.split('@')[0]}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{userTribe.xp_points || 0} XP</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold text-foreground">{getViewTitle()}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Crown className="w-3 h-3 text-amber-500" />
              Level {userTribe.level || 1}
            </Badge>
            {userTribe.badges && userTribe.badges.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <Medal className="w-3 h-3" />
                {userTribe.badges.length} Badges
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'general' && <TribeChatRoom tribeId="general" isGeneral={true} />}
          {activeView === 'tribe-chat' && <TribeChatRoom tribeId={userTribe.tribe_id} />}
          {activeView === 'dm' && <DirectMessages />}
          {activeView === 'leaderboard' && <Leaderboard tribeId={userTribe.tribe_id} />}
          {activeView === 'challenges' && <ChallengeZone tribeId={userTribe.tribe_id} />}
          {activeView === 'profile' && <ProfileCustomization membership={userTribe} />}
          {activeView === 'projects' && <ProjectFeed tribeId={userTribe.tribe_id} />}
        </div>
      </div>
    </div>
  );
}
