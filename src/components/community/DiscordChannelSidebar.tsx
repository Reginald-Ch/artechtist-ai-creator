import { useState } from 'react';
import { Hash, Volume2, Trophy, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Channel {
  id: string;
  name: string;
  icon: string;
  activeUsers: number;
  type: 'text' | 'voice';
}

interface DiscordChannelSidebarProps {
  activeChannel: string;
  onChannelChange: (channelId: string) => void;
  userProfile: any;
}

export function DiscordChannelSidebar({ activeChannel, onChannelChange, userProfile }: DiscordChannelSidebarProps) {
  const textChannels: Channel[] = [
    { id: 'pythonpals', name: 'PythonPals', icon: '🐍', activeUsers: 42, type: 'text' },
    { id: 'aiexplorers', name: 'AIExplorers', icon: '🤖', activeUsers: 38, type: 'text' },
    { id: 'techwizards', name: 'TechWizards', icon: '⚙️', activeUsers: 35, type: 'text' },
    { id: 'roboticsridge', name: 'RoboticsRidge', icon: '🤖', activeUsers: 29, type: 'text' },
    { id: 'scratchstars', name: 'ScratchStars', icon: '💻', activeUsers: 51, type: 'text' },
  ];

  const voiceChannels: Channel[] = [
    { id: 'study-lounge', name: 'Study Lounge', icon: '📚', activeUsers: 8, type: 'voice' },
    { id: 'project-collab', name: 'Project Collab', icon: '🔧', activeUsers: 5, type: 'voice' },
    { id: 'mentor-help', name: 'Mentor Help', icon: '🎓', activeUsers: 3, type: 'voice' },
  ];

  return (
    <div className="w-60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-primary/20 flex flex-col h-screen">
      {/* Server Icon & Name */}
      <div className="h-14 border-b border-primary/20 px-4 flex items-center gap-3 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
          <span className="text-xl">✨</span>
        </div>
        <h2 className="font-bold text-white">Me AI</h2>
      </div>

      {/* Live Challenge Banner */}
      <div className="m-3 p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
        <div className="flex items-start gap-2">
          <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-300">Live Challenge!</p>
            <p className="text-xs text-amber-100/80 mt-1">Mini AI Hackathon starts in 2h</p>
          </div>
        </div>
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 py-3">
          {/* Text Channels */}
          <div>
            <div className="px-2 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Find Your Tech Tribe
              </p>
            </div>
            <div className="space-y-0.5">
              {textChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelChange(channel.id)}
                  className={`
                    w-full flex items-center justify-between px-2 py-2 rounded-lg
                    transition-all duration-200 group
                    ${activeChannel === channel.id 
                      ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20 border border-primary/30' 
                      : 'hover:bg-accent/50 text-foreground/80 hover:text-foreground'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Hash className={`w-4 h-4 flex-shrink-0 ${activeChannel === channel.id ? 'text-primary' : 'text-white/50'}`} />
                    <span className={`text-sm font-medium truncate ${activeChannel === channel.id ? 'text-white' : 'text-white/80'}`}>{channel.name}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">
                    {channel.activeUsers}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Hangouts */}
          <div>
            <div className="px-2 mb-2 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Voice Hangouts
              </p>
            </div>
            <div className="space-y-0.5">
              {voiceChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelChange(channel.id)}
                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Volume2 className="w-4 h-4 flex-shrink-0 text-white/50" />
                    <span className="text-sm font-medium truncate text-white/80">{channel.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs px-1.5 py-0 border-green-500/50 text-green-400"
                  >
                    {channel.activeUsers}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Footer */}
      <div className="p-2 border-t border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-accent/30 transition-all">
          <Avatar className="w-10 h-10 border-2 border-primary/40 shadow-lg shadow-primary/20">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.avatar_seed}`} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
              {userProfile?.first_name?.charAt(0) || 'Y'}T
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {userProfile?.first_name || 'Young Techie'}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-primary font-semibold">Level 5</span>
              <span className="text-white/40">•</span>
              <span className="text-white/70">1,250 XP</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
