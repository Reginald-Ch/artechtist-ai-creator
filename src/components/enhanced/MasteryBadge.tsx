import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Crown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MasteryBadgeProps {
  level: 'none' | 'bronze' | 'silver' | 'gold' | 'master';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MasteryBadge = ({ level, size = 'md', showLabel = true }: MasteryBadgeProps) => {
  const configs = {
    none: {
      icon: null,
      color: 'bg-muted text-muted-foreground',
      label: 'Not Started',
      pattern: ''
    },
    bronze: {
      icon: Award,
      color: 'bg-gradient-to-br from-amber-700 to-amber-500 text-white',
      label: 'Bronze',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
    },
    silver: {
      icon: Star,
      color: 'bg-gradient-to-br from-slate-400 to-slate-300 text-slate-900',
      label: 'Silver',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.2) 10px, rgba(255,255,255,.2) 20px)'
    },
    gold: {
      icon: Trophy,
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
      label: 'Gold',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.2) 10px, rgba(255,255,255,.2) 20px)'
    },
    master: {
      icon: Crown,
      color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white animate-pulse',
      label: 'Master',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.3) 10px, rgba(255,255,255,.3) 20px)'
    }
  };

  const config = configs[level];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (level === 'none') {
    return null;
  }

  const badge = (
    <Badge 
      className={`${config.color} ${sizeClasses[size]} border-0 font-semibold shadow-lg`}
      style={{ backgroundImage: config.pattern }}
    >
      {Icon && <Icon className={`${iconSizes[size]} ${showLabel ? 'mr-1.5' : ''}`} />}
      {showLabel && config.label}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{config.label} Mastery</p>
          <p className="text-xs text-muted-foreground">
            {level === 'bronze' && '3+ attempts at 70%+'}
            {level === 'silver' && '3+ attempts at 80%+'}
            {level === 'gold' && '3+ attempts at 90%+'}
            {level === 'master' && '3+ consecutive 95%+'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};