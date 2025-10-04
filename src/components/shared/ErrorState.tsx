import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  className = ''
}) => {
  const { t } = useLanguage();
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title || t('errors.somethingWrong')}</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <span>{message}</span>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="w-fit"
          >
            {t('common.retry')}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
