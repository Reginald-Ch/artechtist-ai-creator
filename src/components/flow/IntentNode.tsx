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
  
  // Get icon and example based on intent
  const getIntentIcon = () => {
    if (label.toLowerCase().includes('greet') || label.toLowerCase().includes('hello')) return '👋';
    if (label.toLowerCase().includes('fallback') || label.toLowerCase().includes('default')) return '❓';
    return '💬';
  };

  const getExamplePhrase = () => {
    if (trainingPhrases.length > 0) return trainingPhrases[0];
    if (label.toLowerCase().includes('greet')) return '"Hello"';
    return 'No training';
  };

  const getStatusInfo = () => {
    if (isComplete) return { color: 'text-green-600', text: 'Ready', icon: '✓' };
    if (!hasTraining) return { color: 'text-orange-500', text: 'No training', icon: '⚠' };
    if (!hasResponses) return { color: 'text-orange-500', text: 'No responses', icon: '⚠' };
    return { color: 'text-muted-foreground', text: 'Incomplete', icon: '○' };
  };

  const statusInfo = getStatusInfo();
  
  return (
    <div 
      className={cn(
        "relative group cursor-pointer",
        "min-w-[200px] max-w-[240px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Intent: ${label}. ${trainingPhrases.length} training phrases, ${responses.length} responses. Press Enter to edit${isDefault ? '' : ', Delete to remove'}`}
    >
      
      {/* Main Card - Enhanced with better spacing and colors */}
      <div 
        className={cn(
          "bg-card border-2 rounded-xl shadow-md p-5 space-y-4 transition-all duration-200",
          selected 
            ? 'border-primary shadow-xl ring-2 ring-primary/30 bg-primary/5' 
            : isDefault 
              ? 'border-primary/70 bg-primary/5' 
              : 'border-border bg-background',
          "hover:shadow-xl hover:border-primary/80 hover:bg-card"
        )}
      >
        {/* Header with Icon and Title */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">{getIntentIcon()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{label}</h3>
            <div className="flex items-center gap-2 mt-1">
              {isDefault && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                  Core Intent
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">Intent Node</span>
            </div>
          </div>
          {/* Edit Button - improved UX */}
          <div className="flex items-center gap-1">
            {selected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
            {/* Lock fallback intent - only allow training for greet intent */}
            {label.toLowerCase().includes('fallback') ? (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                🔒 Locked
              </Badge>
            ) : (
              <Button
                size="sm"
                variant={selected ? "default" : "outline"}
                className={cn(
                  "px-3 py-1 text-xs font-medium",
                  selected ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  // Open training dialog instead of inline editing
                  if ((window as any).openIntentTraining) {
                    (window as any).openIntentTraining(id || '');
                  } else {
                    onEdit?.(id || '');
                  }
                }}
              >
                <Brain className="h-3 w-3 mr-1" />
                Train
              </Button>
            )}
          </div>
        </div>

        {/* Stats with improved visual hierarchy */}
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{trainingPhrases.length}</span>
              <span className="text-xs">phrases</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bot className="h-4 w-4 text-green-500" />
              <span className="font-medium">{responses.length}</span>
              <span className="text-xs">responses</span>
            </div>
          </div>
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusInfo.color)}>
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.text}</span>
          </div>
        </div>

        {/* Example phrase preview */}
        <div className="bg-background border border-border rounded-md p-2">
          <div className="text-xs text-muted-foreground font-medium mb-1">Example trigger:</div>
          <div className="text-sm text-foreground italic">"{getExamplePhrase()}"</div>
        </div>

        {/* Action buttons for node management */}
        {(isHovered || selected) && (
          <div className="absolute -top-2 -right-2 flex gap-1 z-30">
            {/* Add Follow-up Intent Button (Blue Plus) - Ambi style */}
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0 rounded-full bg-blue-500 border-2 border-background shadow-lg hover:bg-blue-600 z-30"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Trigger add follow-up intent
                if ((window as any).addFollowUpIntent) {
                  (window as any).addFollowUpIntent(id || '');
                }
              }}
              title="Add follow-up intent"
            >
              <span className="text-white text-sm font-bold">+</span>
            </Button>
            
            {/* Delete button for non-default nodes */}
            {!isDefault && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 rounded-full bg-destructive border-2 border-background shadow-lg hover:bg-destructive/90 z-30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(id || '');
                }}
                title="Delete intent"
              >
                <X className="h-3 w-3 text-destructive-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* React Flow Handles - Clean styling without conflicts */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-primary border-2 border-background shadow-sm"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-primary border-2 border-background shadow-sm"
      />
    </div>
  );
});

IntentNode.displayName = 'IntentNode';

export default IntentNode;