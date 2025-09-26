import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  className = '' 
}) => {
  const strength = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password strength</span>
        <span 
          className="text-sm font-medium"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>
      
      <Progress 
        value={(strength.score / 5) * 100} 
        className="h-2"
        style={{ 
          background: 'hsl(var(--muted))',
        }}
      />
      
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <X className="h-3 w-3 text-destructive" />
              <span>{feedback}</span>
            </div>
          ))}
        </div>
      )}
      
      {strength.score >= 4 && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <Check className="h-3 w-3" />
          <span>Strong password! 🎉</span>
        </div>
      )}
    </div>
  );
};