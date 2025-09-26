import React, { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
  isLoading?: boolean;
  showPasswordToggle?: boolean;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ 
    label, 
    icon, 
    error, 
    success, 
    isLoading, 
    showPasswordToggle, 
    type,
    className,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value);

    const inputType = showPasswordToggle && showPassword ? 'text' : type;
    const isPassword = type === 'password';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              "pl-10 pr-10 pt-6 pb-2 transition-all duration-200 ease-in-out",
              "border-2 focus:ring-0 focus:ring-offset-0",
              isFocused && "border-primary shadow-glow",
              error && "border-destructive",
              success && "border-green-500",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            {...props}
          />
          
          {/* Floating Label */}
          <Label
            className={cn(
              "absolute left-10 transition-all duration-200 ease-in-out pointer-events-none",
              "text-muted-foreground",
              (isFocused || hasValue) 
                ? "top-1 text-xs text-primary font-medium" 
                : "top-4 text-sm"
            )}
          >
            {label}
          </Label>
          
          {/* Left Icon */}
          {icon && (
            <div className={cn(
              "absolute left-3 top-4 transition-colors duration-200",
              isFocused ? "text-primary" : "text-muted-foreground"
            )}>
              {icon}
            </div>
          )}
          
          {/* Right Status Icons */}
          <div className="absolute right-3 top-4 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            
            {!isLoading && success && (
              <Check className="h-4 w-4 text-green-500 animate-scale-in" />
            )}
            
            {!isLoading && error && (
              <X className="h-4 w-4 text-destructive animate-scale-in" />
            )}
            
            {/* Password Toggle */}
            {showPasswordToggle && isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "p-1 rounded-full transition-colors duration-200",
                  "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="text-xs text-destructive animate-slide-in-left flex items-center gap-1">
            <X className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';