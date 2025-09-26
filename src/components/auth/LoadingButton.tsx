import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  success?: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  success,
  children,
  className,
  disabled,
  variant = 'default',
  ...props
}) => {
  return (
    <Button
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        "transform active:scale-95",
        isLoading && "pointer-events-none",
        success && "bg-green-500 hover:bg-green-600 border-green-500",
        className
      )}
      disabled={disabled || isLoading}
      variant={success ? 'default' : variant}
      {...props}
    >
      <span
        className={cn(
          "flex items-center justify-center gap-2 transition-opacity duration-200",
          (isLoading || success) && "opacity-0"
        )}
      >
        {children}
      </span>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      
      {success && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Check className="h-5 w-5 animate-scale-in" />
        </div>
      )}
    </Button>
  );
};