import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Node } from '@xyflow/react';
import { ChevronDown, MessageSquare, Trash2, Plus, Brain } from "lucide-react";

interface IntentListProps {
  nodes: Node[];
  selectedNode: Node | null;
  onNodeSelect: (node: Node) => void;
  onNodeDelete: (nodeId: string) => void;
  onAddIntent: () => void;
  onOpenTraining: (nodeId: string) => void;
}

export const IntentList = ({ 
  nodes, 
  selectedNode, 
  onNodeSelect, 
  onNodeDelete,
  onAddIntent,
  onOpenTraining 
}: IntentListProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          INTENTS ({nodes.length})
        </h3>
        <Button 
          onClick={onAddIntent}
          size="sm" 
          variant="outline"
          className="h-7 gap-1"
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isDefault = node.data.isDefault;
          const phraseCount = (node.data.trainingPhrases as string[])?.length || 0;
          const responseCount = (node.data.responses as string[])?.length || 0;

          return (
            <Collapsible key={node.id}>
              <div
                className={`
                  rounded-lg border transition-all cursor-pointer
                  ${isSelected 
                    ? 'bg-primary/5 border-primary shadow-sm' 
                    : 'bg-card hover:bg-muted/50 border-border'
                  }
                `}
              >
                <div 
                  className="p-3"
                  onClick={() => onNodeSelect(node)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {node.data.label as string}
                        </span>
                        {isDefault && (
                          <Badge variant="secondary" className="text-xs h-5">
                            Default
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {phraseCount} phrases
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {responseCount} responses
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTraining(node.id);
                        }}
                        className="h-7 w-7 p-0"
                        title="Train Intent"
                      >
                        <Brain className="h-3.5 w-3.5" />
                      </Button>
                      
                      {!isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNodeDelete(node.id);
                          }}
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                          title="Delete Intent"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {nodes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No intents yet</p>
          <p className="text-xs mt-1">Click "Add" to create your first intent</p>
        </div>
      )}
    </div>
  );
};
