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
        "relative group transition-all duration-200 cursor-pointer",
        "min-w-[200px] max-w-[240px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection Handles - Match reference design exactly */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-blue-400 bg-white z-10" />
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-blue-400 bg-white z-10" />
      
      {/* Main Card - Exact match to reference */}
      <div 
        className={cn(
          "bg-white border-2 rounded-xl shadow-sm p-4 space-y-3",
          selected 
            ? 'border-blue-500 shadow-lg' 
            : isDefault 
              ? 'border-blue-400' 
              : 'border-orange-400',
          "hover:shadow-md"
        )}
      >
        {/* Header with Icon and Title */}
        <div className="flex items-center gap-3">
          <span className="text-xl">{getIntentIcon()}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{label} Intent</h3>
            {isDefault && (
              <Badge className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 font-medium">
                Default
              </Badge>
            )}
          </div>
          {/* Edit Button - only show on hover/selection */}
          {(isHovered || selected) && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(id || '');
              }}
            >
              Editing
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{trainingPhrases.length} phrases</span>
          </div>
          <div className="flex items-center gap-1">
            <Bot className="h-4 w-4" />
            <span>{responses.length} responses</span>
          </div>
        </div>

        {/* Example */}
        <div className="text-xs text-gray-500">
          <span className="font-medium">Example: </span>
          <span className="italic">{getExamplePhrase()}</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-1 text-sm font-medium", statusInfo.color)}>
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.text}</span>
          </div>
        </div>

        {/* Delete button for non-default nodes */}
        {!isDefault && (isHovered || selected) && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-red-50 hover:border-red-200 z-20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(id || '');
            }}
          >
            <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
          </Button>
        )}
      </div>

      {/* React Flow Handles - Hidden but functional */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="opacity-0 w-1 h-1"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="opacity-0 w-1 h-1"
      />
    </div>
  );
});

IntentNode.displayName = 'IntentNode';

export default IntentNode;