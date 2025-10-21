import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Trophy, Gamepad2, User, Share2, Flame } from 'lucide-react';
import { TribeChatRoom } from './TribeChatRoom';
import { Leaderboard } from './Leaderboard';
import { ChallengeZone } from './ChallengeZone';
import { ProfileCustomization } from './ProfileCustomization';
import { ProjectFeed } from './ProjectFeed';

interface CommunityDashboardProps {
  userTribe: any;
}

export function CommunityDashboard({ userTribe }: CommunityDashboardProps) {
  const [activeTab, setActiveTab] = useState('chat');

  const xpToNextLevel = 1000;
  const xpProgress = (userTribe.xp_points % xpToNextLevel) / xpToNextLevel * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Tribe Info */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <Card className={`p-6 bg-gradient-to-r ${userTribe.tribes.color} text-white border-0 shadow-xl`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className="text-6xl">{userTribe.tribes.emoji}</span>
                <div>
                  <h1 className="text-3xl font-bold">{userTribe.tribes.name}</h1>
                  <p className="text-white/90">{userTribe.tribes.description}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">Lv. {userTribe.level}</div>
                  <div className="text-sm text-white/80">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{userTribe.xp_points}</div>
                  <div className="text-sm text-white/80">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold flex items-center gap-1">
                    <Flame className="w-6 h-6 text-orange-400" />7
                  </div>
                  <div className="text-sm text-white/80">Streak</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {userTribe.level}</span>
                <span>{userTribe.xp_points % xpToNextLevel}/{xpToNextLevel} XP</span>
              </div>
              <Progress value={xpProgress} className="h-3 bg-white/20" />
            </div>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full bg-card/50 backdrop-blur p-1 h-auto">
            <TabsTrigger value="chat" className="flex flex-col items-center gap-2 py-3">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex flex-col items-center gap-2 py-3">
              <Trophy className="w-5 h-5" />
              <span className="text-xs">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex flex-col items-center gap-2 py-3">
              <Gamepad2 className="w-5 h-5" />
              <span className="text-xs">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col items-center gap-2 py-3">
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex flex-col items-center gap-2 py-3">
              <Share2 className="w-5 h-5" />
              <span className="text-xs">Projects</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <TribeChatRoom tribeId={userTribe.tribes.id} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <Leaderboard tribeId={userTribe.tribes.id} />
          </TabsContent>

          <TabsContent value="challenges" className="mt-0">
            <ChallengeZone tribeId={userTribe.tribes.id} />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileCustomization membership={userTribe} />
          </TabsContent>

          <TabsContent value="projects" className="mt-0">
            <ProjectFeed tribeId={userTribe.tribes.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
