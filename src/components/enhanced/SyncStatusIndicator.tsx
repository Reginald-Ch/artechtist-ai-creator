import React from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncStatusIndicatorProps {
  syncStatus: 'idle' | 'syncing' | 'error';
  isOnline: boolean;
}

export const SyncStatusIndicator = ({ syncStatus, isOnline }: SyncStatusIndicatorProps) => {
  if (!isOnline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-2">
              <CloudOff className="h-3 w-3" />
              <span className="hidden sm:inline">Offline</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Working offline. Changes will sync when online.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <Badge variant="outline" className="gap-2">
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">Syncing...</span>
      </Badge>
    );
  }

  if (syncStatus === 'error') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="gap-2">
              <CloudOff className="h-3 w-3" />
              <span className="hidden sm:inline">Sync Error</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Failed to sync. Will retry automatically.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-2 bg-green-50 text-green-700 border-green-200">
            <Cloud className="h-3 w-3" />
            <span className="hidden sm:inline">Synced</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>All changes saved to cloud</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
