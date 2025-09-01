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

  // Determine status
  const hasTraining = trainingPhrases.length > 0;
  const hasResponses = responses.length > 0;
  const isComplete = hasTraining && hasResponses;
  
  return (
    <div 
      className={cn(
        "bg-background border rounded-lg shadow-sm min-w-[180px] max-w-[220px] transition-all duration-200 relative group",
        "hover:shadow-md",
        selected 
          ? 'border-primary ring-1 ring-primary/20' 
          : isDefault 
            ? 'border-muted-foreground/20' 
            : 'border-border',
        "cursor-pointer"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Simple Delete Button */}
      {!isDefault && (isHovered || selected) && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-background border border-border shadow-sm hover:shadow-md z-20"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id || '');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      {/* Context Menu */}
      {!isDefault && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "absolute top-2 right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 z-20"
              )}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit?.(id || '')} className="cursor-pointer">
              <Edit className="mr-2 h-3 w-3" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(id || '')} className="cursor-pointer">
              <Copy className="mr-2 h-3 w-3" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(id || '')}
              className="text-destructive cursor-pointer focus:text-destructive"
            >
              <X className="mr-2 h-3 w-3" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Clean Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2 border border-border bg-background"
      />
      
      {/* Simplified Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isComplete ? "bg-green-500" : hasTraining || hasResponses ? "bg-yellow-500" : "bg-muted-foreground/30"
          )} />
          <h3 className="font-medium text-sm truncate flex-1">{label}</h3>
          {isDefault && (
            <Badge variant="secondary" className="text-xs py-0 px-1">
              Default
            </Badge>
          )}
        </div>
      </div>
      
      {/* Minimal Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Training</span>
          <Badge variant="outline" className="text-xs h-4">
            {trainingPhrases.length}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Responses</span>
          <Badge variant="outline" className="text-xs h-4">
            {responses.length}
          </Badge>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 border border-border bg-background"
      />
    </div>
  );
});

IntentNode.displayName = 'IntentNode';

export default IntentNode;