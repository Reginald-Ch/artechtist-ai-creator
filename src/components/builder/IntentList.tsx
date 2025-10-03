import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Node } from '@xyflow/react';
import { Plus, MessageSquare } from "lucide-react";
import { IntentListItem } from './IntentListItem';

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
        <AnimatePresence mode="popLayout">
          {nodes.map((node, index) => (
            <IntentListItem
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              index={index}
              onSelect={(id) => {
                const selectedNode = nodes.find(n => n.id === id);
                if (selectedNode) onNodeSelect(selectedNode);
              }}
              onDelete={onNodeDelete}
              onOpenTraining={onOpenTraining}
            />
          ))}
        </AnimatePresence>
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
