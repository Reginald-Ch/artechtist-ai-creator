import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, HelpCircle, Settings, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ErrorRecoveryStep {
  title: string;
  description: string;
  icon?: string;
}

interface ErrorRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorType: 'microphone' | 'camera' | 'file' | 'training' | 'general';
  errorMessage: string;
  recoverySteps: ErrorRecoveryStep[];
  onRetry?: () => void;
  alternativePath?: {
    label: string;
    action: () => void;
  };
}

export const ErrorRecoveryDialog: React.FC<ErrorRecoveryDialogProps> = ({
  open,
  onOpenChange,
  errorType,
  errorMessage,
  recoverySteps,
  onRetry,
  alternativePath
}) => {
  const getErrorIcon = () => {
    switch (errorType) {
      case 'microphone':
        return '🎤';
      case 'camera':
        return '📷';
      case 'file':
        return '📁';
      case 'training':
        return '🧠';
      default:
        return '⚠️';
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case 'microphone':
        return 'Microphone Access Needed';
      case 'camera':
        return 'Camera Access Needed';
      case 'file':
        return 'File Upload Issue';
      case 'training':
        return 'Training Error';
      default:
        return 'Something Went Wrong';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-2xl">
              {getErrorIcon()}
            </div>
            <div>
              <AlertDialogTitle className="text-xl">{getErrorTitle()}</AlertDialogTitle>
              <AlertDialogDescription className="text-base mt-1">
                {errorMessage}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <HelpCircle className="h-4 w-4 text-primary" />
            How to Fix This
          </div>

          <div className="space-y-3">
            {recoverySteps.map((step, index) => (
              <Card key={index} className="p-4 bg-muted/50 border-primary/20">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {step.icon && <span>{step.icon}</span>}
                      {step.title}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {errorType === 'microphone' && (
            <Card className="p-4 bg-blue-500/5 border-blue-200">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900">Quick Browser Settings Guide:</p>
                  <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                    <li>Look for a 🔒 lock or ⓘ info icon in your browser's address bar</li>
                    <li>Click it and look for "Microphone" or "Permissions"</li>
                    <li>Change setting to "Allow" for this website</li>
                    <li>Refresh the page and try again</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {errorType === 'camera' && (
            <Card className="p-4 bg-blue-500/5 border-blue-200">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900">Quick Browser Settings Guide:</p>
                  <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                    <li>Look for a 🔒 lock or ⓘ info icon in your browser's address bar</li>
                    <li>Click it and look for "Camera" or "Permissions"</li>
                    <li>Change setting to "Allow" for this website</li>
                    <li>Refresh the page and try again</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {alternativePath && (
            <Card className="p-4 bg-green-500/5 border-green-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-2">
                    Try This Instead:
                  </p>
                  <Button
                    onClick={() => {
                      alternativePath.action();
                      onOpenChange(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    {alternativePath.label}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          {onRetry && (
            <AlertDialogAction asChild>
              <Button
                onClick={onRetry}
                className="w-full sm:w-auto gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
