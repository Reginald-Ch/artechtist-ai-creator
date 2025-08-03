import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, X, Copy, Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      className={`bg-white border-2 rounded-lg shadow-lg min-w-48 transition-all relative group ${
        selected 
          ? 'border-orange-500 shadow-xl' 
          : isDefault 
            ? 'border-orange-300 hover:border-orange-400' 
            : 'border-blue-300 hover:border-blue-400'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Delete Button - appears on hover for non-default nodes */}
      {!isDefault && (isHovered || selected) && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-90 hover:opacity-100 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id || '');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      {/* Right-click Context Menu */}
      {!isDefault && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(id || '')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(id || '')}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(id || '')}
              className="text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 border-2 border-orange-500 bg-white"
      />
      
      <div className={`p-4 rounded-t-lg ${isDefault ? 'bg-orange-50' : 'bg-blue-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Bot className={`h-4 w-4 ${isDefault ? 'text-orange-500' : 'text-blue-500'}`} />
          <h3 className="font-semibold text-sm truncate">{label}</h3>
          {isDefault && (
            <Badge variant="secondary" className="text-xs">
              Default
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <MessageSquare className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Training</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {trainingPhrases.length > 0 
              ? `${trainingPhrases.length} phrase${trainingPhrases.length !== 1 ? 's' : ''}`
              : 'No training phrases'
            }
          </div>
          {trainingPhrases.length > 0 && (
            <div className="text-xs bg-muted/50 p-2 rounded mt-1 max-h-16 overflow-hidden">
              "{trainingPhrases[0]}"
              {trainingPhrases.length > 1 && (
                <span className="text-muted-foreground"> +{trainingPhrases.length - 1} more</span>
              )}
            </div>
          )}
        </div>
        
        <div>
          <span className="text-xs text-muted-foreground font-medium">Responses: </span>
          <span className="text-xs text-muted-foreground">
            {responses.length > 0 
              ? `${responses.length} response${responses.length !== 1 ? 's' : ''}`
              : 'No responses'
            }
          </span>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-orange-500 bg-white"
      />
    </div>
  );
});

IntentNode.displayName = 'IntentNode';

export default IntentNode;