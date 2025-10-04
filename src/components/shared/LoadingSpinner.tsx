import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mb-2`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};
