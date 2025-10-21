import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Trophy, Target, User, BookOpen, Hash, Bell, Settings, Zap, Crown, Medal } from 'lucide-react';
import { TribeChatRoom } from './TribeChatRoom';
import { Leaderboard } from './Leaderboard';
import { ChallengeZone } from './ChallengeZone';
import { ProfileCustomization } from './ProfileCustomization';
import { ProjectFeed } from './ProjectFeed';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityDashboardProps {
  userTribe: any;
}

export function CommunityDashboard({ userTribe }: CommunityDashboardProps) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('chat');

  const channels = [
    { id: 'chat', name: 'general-chat', icon: MessageSquare, type: 'text' },
    { id: 'projects', name: 'project-feed', icon: BookOpen, type: 'text' },
    { id: 'leaderboard', name: 'leaderboard', icon: Trophy, type: 'text' },
    { id: 'challenges', name: 'challenges', icon: Target, type: 'text' },
  ];

  const getViewTitle = () => {
    const channel = channels.find(c => c.id === activeView);
    return channel ? channel.name : 'profile';
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left Sidebar - Discord Style */}
      <div className="w-60 bg-card border-r border-border/40 flex flex-col">
        {/* Tribe Header */}
        <div className="h-14 border-b border-border/40 px-4 flex items-center justify-between hover:bg-accent/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{userTribe.tribe?.emoji}</span>
            <h2 className="font-bold text-foreground truncate">
              {userTribe.tribe?.name}
            </h2>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Channels */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            <div className="px-2 py-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Channels
              </span>
            </div>
            
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveView(channel.id)}
                className={`
                  w-full flex items-center gap-2 px-2 py-1.5 rounded
                  transition-colors group
                  ${activeView === channel.id 
                    ? 'bg-accent text-foreground' 
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }
                `}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{channel.name}</span>
              </button>
            ))}

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
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.email?.split('@')[0]}
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
          {activeView === 'chat' && <TribeChatRoom tribeId={userTribe.tribe_id} />}
          {activeView === 'leaderboard' && <Leaderboard tribeId={userTribe.tribe_id} />}
          {activeView === 'challenges' && <ChallengeZone tribeId={userTribe.tribe_id} />}
          {activeView === 'profile' && <ProfileCustomization membership={userTribe} />}
          {activeView === 'projects' && <ProjectFeed tribeId={userTribe.tribe_id} />}
        </div>
      </div>
    </div>
  );
}
