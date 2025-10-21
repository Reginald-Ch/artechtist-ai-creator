import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth' 
}) => {
  const { user, session, loading, signOut } = useAuth();

  // Session validation and auto-refresh
  useEffect(() => {
    if (!user || !session) return;

    const expiresAt = session.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 0) {
        // Session already expired
        toast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "destructive",
        });
        signOut();
      } else if (timeUntilExpiry < 300) {
        // Less than 5 minutes until expiry, try refresh
        supabase.auth.refreshSession().then(({ error }) => {
          if (error) {
            console.error('Failed to refresh session:', error);
            toast({
              title: "Session expired",
              description: "Please sign in again.",
              variant: "destructive",
            });
            signOut();
          }
        });
      }
    }
  }, [user, session, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Artechtist AI
          </h2>
          <p className="text-muted-foreground">Loading your AI workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};