import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CoomWelcome } from '@/components/community/CoomWelcome';
import { ProfileSetup } from '@/components/community/ProfileSetup';
import { TribeSelection } from '@/components/community/TribeSelection';
import { CommunityDashboard } from '@/components/community/CommunityDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
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
        setShowProfileSetup(false);
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
    setShowProfileSetup(true);
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
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

  if (showProfileSetup) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  if (showTribeSelection) {
    return <TribeSelection onTribeSelected={handleTribeSelected} />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="gap-2 bg-background/95 backdrop-blur-sm hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <CommunityDashboard userTribe={userTribe} />
    </div>
  );
}
