import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, X, Copy, Edit, MoreVertical, Zap, Brain, Plus, Volume2, Mic } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface IntentNodeData extends Record<string, unknown> {
  label: string;
  trainingPhrases: string[];
  responses: string[];
  isDefault?: boolean;
  confidence?: number;
  parentId?: string;
  children?: string[];
  position?: { x: number; y: number };
}

interface EnhancedIntentNodeProps {
  data: IntentNodeData;
  selected?: boolean;
  id?: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onEdit?: (nodeId: string) => void;
  onAddFollowUp?: (parentId: string) => void;
  onVoiceInput?: (nodeId: string) => void;
  onPlayResponse?: (nodeId: string) => void;
}

const EnhancedIntentNode = memo(({ 
  data, 
  selected, 
  onDelete, 
  onDuplicate, 
  onEdit, 
  onAddFollowUp,
  onVoiceInput,
  onPlayResponse,
  id 
}: EnhancedIntentNodeProps) => {
  const { label, trainingPhrases = [], responses = [], isDefault = false, confidence, children = [] } = data;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "bg-background border-2 rounded-xl shadow-md min-w-[240px] max-w-[320px] transition-all duration-300 relative group",
        "hover:shadow-xl hover:scale-[1.02] transform-gpu animate-fade-in",
        selected 
          ? 'border-primary shadow-xl scale-[1.02] ring-4 ring-primary/30 animate-glow-pulse' 
          : isDefault 
            ? 'border-orange-400 hover:border-orange-500 bg-gradient-to-br from-orange-50/90 to-orange-100/50 dark:from-orange-950/40 dark:to-orange-900/30' 
            : 'border-blue-400 hover:border-blue-500 bg-gradient-to-br from-blue-50/90 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/30',
        "backdrop-blur-sm glassmorphism"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Visual Delete Button */}
      {!isDefault && (isHovered || selected) && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-3 -right-3 h-8 w-8 p-0 rounded-full shadow-lg hover:shadow-xl z-20 transition-all duration-300 hover:scale-110 animate-scale-in"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id || '');
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Add Follow-up Button */}
      {!isDefault && (isHovered || selected) && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-8 w-8 p-0 rounded-full shadow-lg hover:shadow-xl z-20 transition-all duration-300 hover:scale-110 animate-scale-in bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onAddFollowUp?.(id || '');
          }}
        >
          <Plus className="h-4 w-4" />
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
                "absolute top-3 right-3 h-7 w-7 p-0 transition-all duration-300 z-20",
                "opacity-0 group-hover:opacity-100 hover:bg-accent/80 hover:scale-110 rounded-full"
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => onEdit?.(id || '')} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit Intent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onVoiceInput?.(id || '')} className="cursor-pointer">
              <Mic className="mr-2 h-4 w-4" />
              Voice Training
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPlayResponse?.(id || '')} className="cursor-pointer">
              <Volume2 className="mr-2 h-4 w-4" />
              Test Response
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(id || '')} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddFollowUp?.(id || '')} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Follow-up
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
          "w-4 h-4 border-2 bg-background transition-all duration-300",
          isDefault ? "border-orange-500" : "border-blue-500",
          "hover:scale-150 hover:shadow-lg animate-scale-in"
        )}
      />
      
      {/* Enhanced Header */}
      <div className={cn(
        "p-4 rounded-t-xl backdrop-blur-sm",
        isDefault 
          ? 'bg-gradient-to-r from-orange-100/95 to-orange-200/70 dark:from-orange-900/50 dark:to-orange-800/30' 
          : 'bg-gradient-to-r from-blue-100/95 to-blue-200/70 dark:from-blue-900/50 dark:to-blue-800/30'
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "p-2 rounded-lg transition-all duration-300",
            isDefault 
              ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30' 
              : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30'
          )}>
            {isDefault ? <Zap className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate text-foreground">{label}</h3>
            {confidence && (
              <div className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {isDefault && (
            <Badge variant="secondary" className="text-xs bg-orange-200/80 text-orange-700 dark:bg-orange-800/50 dark:text-orange-300">
              Default Intent
            </Badge>
          )}
          {children.length > 0 && (
            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
              {children.length} Follow-up{children.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Enhanced Content */}
      <div className="p-4 space-y-4">
        {/* Training Phrases Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Training</span>
            <Badge variant="outline" className="text-xs">
              {trainingPhrases.length}
            </Badge>
          </div>
          
          {trainingPhrases.length > 0 ? (
            <div className="bg-muted/50 p-3 rounded-lg border border-border/60 transition-all duration-300 hover:bg-muted/70">
              <div className="text-sm font-medium text-foreground/95 leading-relaxed">
                "{trainingPhrases[0]}"
              </div>
              {trainingPhrases.length > 1 && (
                <div className="text-xs text-muted-foreground mt-2">
                  +{trainingPhrases.length - 1} more phrase{trainingPhrases.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground/70 italic bg-muted/30 p-3 rounded border border-dashed border-muted-foreground/40 transition-all duration-300 hover:bg-muted/40">
              No training phrases added
            </div>
          )}
        </div>
        
        {/* Responses Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Responses</span>
            </div>
            <Badge 
              variant={responses.length > 0 ? "default" : "outline"} 
              className={cn(
                "text-xs transition-all duration-300",
                responses.length > 0 ? "bg-primary/10 text-primary border-primary/30" : ""
              )}
            >
              {responses.length > 0 
                ? `${responses.length} response${responses.length !== 1 ? 's' : ''}`
                : 'None'
              }
            </Badge>
          </div>
          
          {responses.length > 0 && (
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 transition-all duration-300 hover:bg-primary/10">
              <div className="text-sm text-foreground/90 italic">
                "{responses[0]}"
              </div>
              {responses.length > 1 && (
                <div className="text-xs text-muted-foreground mt-2">
                  +{responses.length - 1} more response{responses.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn(
          "w-4 h-4 border-2 bg-background transition-all duration-300",
          isDefault ? "border-orange-500" : "border-blue-500",
          "hover:scale-150 hover:shadow-lg animate-scale-in"
        )}
      />
      
      {/* Connection indicators for children */}
      {children.length > 0 && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            {children.slice(0, 3).map((_, index) => (
              <div 
                key={index}
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
              />
            ))}
            {children.length > 3 && (
              <div className="text-xs text-primary font-bold">+{children.length - 3}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

EnhancedIntentNode.displayName = 'EnhancedIntentNode';

export default EnhancedIntentNode;