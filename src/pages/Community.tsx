import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CoomWelcome } from '@/components/community/CoomWelcome';
import { TribeSelection } from '@/components/community/TribeSelection';
import { CommunityDashboard } from '@/components/community/CommunityDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTribeSelection, setShowTribeSelection] = useState(false);
  const [userTribe, setUserTribe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkUserTribe();
  }, [user]);

  const checkUserTribe = async () => {
    try {
      const { data, error } = await supabase
        .from('tribe_memberships')
        .select('*, tribes(*)')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking tribe:', error);
      }

      if (data) {
        setUserTribe(data);
        setShowWelcome(false);
        setShowTribeSelection(false);
      } else {
        // New user - show welcome flow
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setShowTribeSelection(true);
  };

  const handleTribeSelected = async (tribe: any) => {
    await checkUserTribe();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
        <LoadingSpinner />
      </div>
    );
  }

  if (showWelcome) {
    return <CoomWelcome onComplete={handleWelcomeComplete} />;
  }

  if (showTribeSelection) {
    return <TribeSelection onTribeSelected={handleTribeSelected} />;
  }

  return <CommunityDashboard userTribe={userTribe} />;
}
