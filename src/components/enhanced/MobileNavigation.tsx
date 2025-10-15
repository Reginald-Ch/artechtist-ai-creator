import React from 'react';
import { BookOpen, Star, TrendingUp, Search, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  completedCount?: number;
}

export const MobileNavigation = ({ 
  activeTab, 
  onTabChange,
  completedCount 
}: MobileNavigationProps) => {
  const tabs = [
    { id: 'browse', icon: BookOpen, label: 'Topics' },
    { id: 'all', icon: Star, label: 'All' },
    { id: 'learning-path', icon: TrendingUp, label: 'Path' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'analytics', icon: BarChart3, label: 'Stats' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t shadow-lg md:hidden safe-area-pb">
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[60px] ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {tab.id === 'all' && completedCount && completedCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {completedCount > 9 ? '9+' : completedCount}
                  </Badge>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'scale-105' : ''} transition-transform`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};