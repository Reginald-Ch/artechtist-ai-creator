import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, BookOpen, Mic, Gamepad2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

interface AppNavigationProps {
  showBackButton?: boolean;
  title?: string;
}

const AppNavigation: React.FC<AppNavigationProps> = ({ showBackButton = false, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('common.back')}
              </Button>
            )}
            {title && (
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            )}
          </div>


          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
            >
              {t('common.signOut')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavigation;