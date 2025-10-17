import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, X, Copy, Edit, MoreVertical, Zap, Brain } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface IntentNodeData {
  label: string;
  trainingPhrases: string[];
  responses: string[];
  isDefault?: boolean;
}

interface IntentNodeProps {
  data: IntentNodeData;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onEdit?: (nodeId: string) => void;
  id?: string;
}

const IntentNode = memo(({ data, selected, onDelete, onDuplicate, onEdit, id }: IntentNodeProps) => {
  const { label, trainingPhrases = [], responses = [], isDefault = false } = data;
  const [isHovered, setIsHovered] = useState(false);

  // Keyboard navigation handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    
    switch (e.key) {
      case 'Enter':
        // Open intent training
        if ((window as any).openIntentTraining) {
          (window as any).openIntentTraining(id || '');
        } else {
          onEdit?.(id || '');
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (!isDefault) {
          e.preventDefault();
          onDelete?.(id || '');
        }
        break;
      case 'Escape':
        (e.target as HTMLElement).blur();
        break;
    }
  };

  // Determine status
  const hasTraining = trainingPhrases.length > 0;
  const hasResponses = responses.length > 0;
  const isComplete = hasTraining && hasResponses;
  
  // PHASE 4: Kid-friendly icons and status
  const getIntentIcon = () => {
    if (label.toLowerCase().includes('greet') || label.toLowerCase().includes('hello')) return '👋';
    if (label.toLowerCase().includes('fallback') || label.toLowerCase().includes('default')) return '❓';
    if (label.toLowerCase().includes('help')) return '🆘';
    if (label.toLowerCase().includes('bye') || label.toLowerCase().includes('goodbye')) return '👋';
    return '💬';
  };

  const getExamplePhrase = () => {
    if (trainingPhrases.length > 0) return trainingPhrases[0];
    if (label.toLowerCase().includes('greet')) return 'Hello';
    return 'Add examples';
  };

  // PHASE 4: Simplified status with emojis
  const getStatusInfo = () => {
    if (isComplete) return { emoji: '✅', text: 'Ready', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', borderColor: 'border-green-300 dark:border-green-700' };
    if (!hasTraining) return { emoji: '⚠️', text: 'Add Examples', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-400', borderColor: 'border-orange-300 dark:border-orange-700' };
    if (!hasResponses) return { emoji: '⚠️', text: 'Add Responses', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-400', borderColor: 'border-orange-300 dark:border-orange-700' };
    return { emoji: '🚧', text: 'Getting Started', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400', borderColor: 'border-blue-300 dark:border-blue-700' };
  };

  const statusInfo = getStatusInfo();
  
  return (
    <div 
      className={cn(
        "relative group cursor-pointer",
        "min-w-[260px] max-w-[280px]" // PHASE 4: Increased from 200px to 260px
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Intent: ${label}. ${trainingPhrases.length} training phrases, ${responses.length} responses. Press Enter to edit${isDefault ? '' : ', Delete to remove'}`}
    >
      
      {/* PHASE 4: Enhanced Main Card with kid-friendly design */}
      <div 
        className={cn(
          "bg-card border-2 rounded-2xl shadow-lg p-6 space-y-4 transition-all duration-200",
          selected 
            ? `border-primary shadow-2xl ring-4 ring-primary/20 ${statusInfo.bgColor}` 
            : isDefault 
              ? 'border-primary/70 bg-primary/5' 
              : `${statusInfo.borderColor} bg-background`,
          "hover:shadow-2xl hover:scale-[1.02]"
        )}
      >
        {/* PHASE 4: Header with larger Icon and Title */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
            <span className="text-3xl">{getIntentIcon()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base truncate leading-tight">{label}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              {isDefault && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                  ⭐ Core
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* PHASE 4: Prominent Status Badge */}
        <div className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2",
          statusInfo.bgColor,
          statusInfo.borderColor
        )}>
          <span className="text-2xl">{statusInfo.emoji}</span>
          <span className={cn("font-bold text-base", statusInfo.textColor)}>{statusInfo.text}</span>
        </div>

        {/* PHASE 4: Simplified Stats */}
        <div className="flex items-center justify-around py-2">
          <div className="flex flex-col items-center gap-1">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-lg text-foreground">{trainingPhrases.length}</span>
            <span className="text-xs text-muted-foreground">examples</span>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div className="flex flex-col items-center gap-1">
            <Bot className="h-5 w-5 text-green-500" />
            <span className="font-bold text-lg text-foreground">{responses.length}</span>
            <span className="text-xs text-muted-foreground">replies</span>
          </div>
        </div>

        {/* Example phrase preview - only if has training */}
        {trainingPhrases.length > 0 && (
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <div className="text-xs text-muted-foreground font-medium mb-1">💭 Example:</div>
            <div className="text-sm text-foreground font-medium">"{getExamplePhrase()}"</div>
          </div>
        )}

        {/* PHASE 4: Always visible action buttons for better discoverability */}
        <div className="absolute -top-3 -right-3 flex gap-2 z-30">
          {/* Lock fallback intent */}
          {label.toLowerCase().includes('fallback') ? (
            <div className="h-10 w-10 rounded-full bg-muted border-2 border-background shadow-lg flex items-center justify-center">
              <span className="text-xl">🔒</span>
            </div>
          ) : (
            <>
              {/* PHASE 4: Edit/Train Button - Always visible */}
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0 rounded-full bg-primary border-2 border-background shadow-lg hover:bg-primary/90 hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if ((window as any).openIntentTraining) {
                    (window as any).openIntentTraining(id || '');
                  } else {
                    onEdit?.(id || '');
                  }
                }}
                title="Train this intent"
              >
                <Edit className="h-4 w-4 text-primary-foreground" />
              </Button>
              
              {/* PHASE 4: Add Follow-up Button - Larger (8x8) */}
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0 rounded-full bg-blue-500 border-2 border-background shadow-lg hover:bg-blue-600 hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if ((window as any).addFollowUpIntent) {
                    (window as any).addFollowUpIntent(id || '');
                  }
                }}
                title="Add follow-up intent"
              >
                <span className="text-white text-xl font-bold">+</span>
              </Button>
            </>
          )}
          
          {/* Delete button for non-default nodes */}
          {!isDefault && (
            <Button
              size="sm"
              variant="outline"
              className="h-10 w-10 p-0 rounded-full bg-destructive border-2 border-background shadow-lg hover:bg-destructive/90 hover:scale-110 transition-transform"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(id || '');
              }}
              title="Delete intent"
            >
              <X className="h-5 w-5 text-destructive-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* PHASE 4 & 5: Enhanced React Flow Handles with larger touch targets */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn(
          "w-4 h-4 bg-primary border-2 border-background shadow-md transition-all",
          "hover:w-5 hover:h-5 hover:bg-primary/80"
        )}
        style={{ top: -8 }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn(
          "w-4 h-4 bg-primary border-2 border-background shadow-md transition-all",
          "hover:w-5 hover:h-5 hover:bg-primary/80"
        )}
        style={{ bottom: -8 }}
      />
    </div>
  );
});

IntentNode.displayName = 'IntentNode';

export default IntentNode;