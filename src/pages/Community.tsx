import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { TribeSelection } from '@/components/community/TribeSelection';
import { DiscordChannelSidebar } from '@/components/community/DiscordChannelSidebar';
import { DiscordChatArea } from '@/components/community/DiscordChatArea';
import { DiscordRightSidebar } from '@/components/community/DiscordRightSidebar';

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [activeChannel, setActiveChannel] = useState('pythonpals');
  const [showTribeSelection, setShowTribeSelection] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setUserProfile(profileData);

      // Load tribe membership
      const { data: membershipData } = await supabase
        .from('tribe_memberships')
        .select('*, tribes(*)')
        .eq('user_id', user?.id)
        .single();

      if (membershipData) {
        setMembership(membershipData);
        setShowTribeSelection(false);
      } else {
        setShowTribeSelection(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTribeSelected = () => {
    setShowTribeSelection(false);
    loadUserData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (showTribeSelection) {
    return <TribeSelection onTribeSelected={handleTribeSelected} />;
  }

  const channelNames: Record<string, string> = {
    'pythonpals': 'PythonPals',
    'aiexplorers': 'AIExplorers',
    'techwizards': 'TechWizards',
    'roboticsridge': 'RoboticsRidge',
    'scratchstars': 'ScratchStars',
    'study-lounge': 'Study Lounge',
    'project-collab': 'Project Collab',
    'mentor-help': 'Mentor Help',
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {/* Left Sidebar - Channels */}
      <DiscordChannelSidebar
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
        userProfile={userProfile}
      />

      {/* Center - Chat Area */}
      <DiscordChatArea
        channelId={activeChannel}
        channelName={channelNames[activeChannel] || 'General'}
      />

      {/* Right Sidebar - Profile & Leaderboard */}
      <DiscordRightSidebar
        userProfile={userProfile}
        membership={membership}
      />
    </div>
  );
}
