import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Trash2, Plus, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IntentNodeData {
  id: string;
  label: string;
  trainingPhrases: string[];
  responses: string[];
  isDefault?: boolean;
}

interface KidFriendlyIntentNodeProps {
  data: IntentNodeData;
  selected?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAddFollowUp?: (id: string) => void;
}

export const KidFriendlyIntentNode = memo(({ data, selected, onDelete, onEdit, onAddFollowUp }: KidFriendlyIntentNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine node status
  const hasTraining = data.trainingPhrases && data.trainingPhrases.length > 0;
  const hasResponses = data.responses && data.responses.length > 0;
  const isComplete = hasTraining && hasResponses;
  
  // Get emoji for intent type
  const getIntentEmoji = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('greet') || lowerLabel.includes('hello')) return '👋';
    if (lowerLabel.includes('help')) return '🆘';
    if (lowerLabel.includes('bye') || lowerLabel.includes('goodbye')) return '👋';
    if (lowerLabel.includes('thank')) return '🙏';
    if (lowerLabel.includes('fallback')) return '🤔';
    return '💬';
  };

  const emoji = getIntentEmoji(data.label);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Input Handle - Top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-primary !border-2 !border-background"
        style={{ top: -8 }}
      />
      
      {/* Main Card */}
      <Card 
        className={`
          min-w-[280px] max-w-[320px] transition-all duration-200
          ${selected ? 'ring-4 ring-primary shadow-xl scale-105' : 'shadow-lg hover:shadow-xl'}
          ${data.isDefault ? 'bg-primary/5 border-primary/30' : 'bg-background'}
          ${!isComplete && !data.isDefault ? 'border-yellow-500/50' : ''}
        `}
      >
        <div className="p-5 space-y-4">
          {/* Header with Emoji and Title */}
          <div className="flex items-start gap-3">
            <div className="text-4xl shrink-0">{emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg truncate">{data.label}</h3>
                {data.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Built-in
                  </Badge>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-1.5 mt-1.5">
                {isComplete ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Ready</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                      {!hasTraining ? 'Add examples' : 'Add responses'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{data.trainingPhrases?.length || 0}</span>
              <span className="text-muted-foreground text-xs">examples</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
              <span className="font-medium">{data.responses?.length || 0}</span>
              <span className="text-muted-foreground text-xs">replies</span>
            </div>
          </div>

          {/* Example phrase */}
          {data.trainingPhrases && data.trainingPhrases.length > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-muted">
              <span className="font-medium">Example: </span>
              <span className="italic">"{data.trainingPhrases[0]}"</span>
            </div>
          )}

          {/* Action Buttons */}
          {(isHovered || selected) && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(data.id)}
                className="flex-1 h-9"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              
              {!data.isDefault && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddFollowUp?.(data.id)}
                    className="flex-1 h-9"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Follow-up
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete?.(data.id)}
                    className="h-9 px-3 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Output Handle - Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-4 !h-4 !bg-primary !border-2 !border-background"
        style={{ bottom: -8 }}
      />
    </div>
  );
});

KidFriendlyIntentNode.displayName = 'KidFriendlyIntentNode';

export default KidFriendlyIntentNode;
