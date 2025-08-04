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

  return (
    <div 
      className={cn(
        "bg-background border-2 rounded-xl shadow-md min-w-[200px] max-w-[280px] transition-all duration-200 relative group",
        "hover:shadow-lg hover:scale-[1.02] transform-gpu",
        selected 
          ? 'border-primary shadow-lg scale-[1.02] ring-2 ring-primary/20' 
          : isDefault 
            ? 'border-orange-300 hover:border-orange-400 bg-gradient-to-br from-orange-50/80 to-orange-100/40 dark:from-orange-950/30 dark:to-orange-900/20' 
            : 'border-blue-300 hover:border-blue-400 bg-gradient-to-br from-blue-50/80 to-blue-100/40 dark:from-blue-950/30 dark:to-blue-900/20',
        "backdrop-blur-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Visual Delete Button */}
      {!isDefault && (isHovered || selected) && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full shadow-md hover:shadow-lg z-20 transition-all duration-200 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id || '');
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      
      {/* Enhanced Context Menu */}
      {!isDefault && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "absolute top-3 right-3 h-6 w-6 p-0 transition-all duration-200 z-20",
                "opacity-0 group-hover:opacity-100 hover:bg-accent/80 hover:scale-110"
              )}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit?.(id || '')} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit Intent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(id || '')} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(id || '')}
              className="text-destructive cursor-pointer focus:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Enhanced Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn(
          "w-3 h-3 border-2 bg-background transition-all duration-200",
          isDefault ? "border-orange-400" : "border-blue-400",
          "hover:scale-125 hover:shadow-md"
        )}
      />
      
      {/* Enhanced Header */}
      <div className={cn(
        "p-4 rounded-t-xl backdrop-blur-sm",
        isDefault 
          ? 'bg-gradient-to-r from-orange-100/90 to-orange-200/60 dark:from-orange-900/40 dark:to-orange-800/20' 
          : 'bg-gradient-to-r from-blue-100/90 to-blue-200/60 dark:from-blue-900/40 dark:to-blue-800/20'
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            isDefault ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
          )}>
            {isDefault ? <Zap className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-foreground">{label}</h3>
            {isDefault && (
              <Badge variant="secondary" className="text-xs mt-1 bg-orange-200/60 text-orange-700 dark:bg-orange-800/40 dark:text-orange-300">
                Default Intent
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Content */}
      <div className="p-4 space-y-4">
        {/* Training Phrases Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Training</span>
            <Badge variant="outline" className="text-xs">
              {trainingPhrases.length}
            </Badge>
          </div>
          
          {trainingPhrases.length > 0 ? (
            <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
              <div className="text-xs font-medium text-foreground/90 leading-relaxed">
                "{trainingPhrases[0]}"
              </div>
              {trainingPhrases.length > 1 && (
                <div className="text-xs text-muted-foreground mt-1">
                  +{trainingPhrases.length - 1} more phrase{trainingPhrases.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground/70 italic bg-muted/20 p-2 rounded border border-dashed border-muted-foreground/30">
              No training phrases added
            </div>
          )}
        </div>
        
        {/* Responses Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responses</span>
          </div>
          <Badge variant={responses.length > 0 ? "default" : "outline"} className="text-xs">
            {responses.length > 0 
              ? `${responses.length} response${responses.length !== 1 ? 's' : ''}`
              : 'None'
            }
          </Badge>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn(
          "w-3 h-3 border-2 bg-background transition-all duration-200",
          isDefault ? "border-orange-400" : "border-blue-400",
          "hover:scale-125 hover:shadow-md"
        )}
      />
    </div>
  );
});

IntentNode.displayName = 'IntentNode';

export default IntentNode;