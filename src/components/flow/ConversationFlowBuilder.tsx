import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  BackgroundVariant,
  Position,
} from '@xyflow/react';
import EnhancedIntentNode from './EnhancedIntentNode';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const nodeTypes = {
  intent: EnhancedIntentNode,
};

interface ConversationFlowBuilderProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeSelect: (node: Node | null) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeDuplicate: (nodeId: string) => void;
  onNodeEdit: (nodeId: string) => void;
  onAddFollowUp: (parentId: string) => void;
  onVoiceInput: (nodeId: string) => void;
  onPlayResponse: (nodeId: string) => void;
  className?: string;
}

export const ConversationFlowBuilder = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  onNodeDelete,
  onNodeDuplicate,
  onNodeEdit,
  onAddFollowUp,
  onVoiceInput,
  onPlayResponse,
  className
}: ConversationFlowBuilderProps) => {
  const { toast } = useToast();

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
          width: 20,
          height: 20,
        },
      };
      onEdgesChange((eds: Edge[]) => addEdge(newEdge, eds));
      
      toast({
        title: "Connection Created",
        description: "Intents are now connected in the conversation flow",
      });
    },
    [onEdgesChange, toast]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeSelect(node);
    },
    [onNodeSelect]
  );

  // Calculate layout positions for better visualization
  const layoutedNodes = useMemo(() => {
    return nodes.map(node => {
      // If it's a default node, position it specially
      if (node.data?.isDefault) {
        return node;
      }
      
      // For follow-up nodes, position them below their parent
      if (node.data?.parentId) {
        const parent = nodes.find(n => n.id === node.data.parentId);
        if (parent) {
          const siblingIndex = nodes.filter(n => n.data?.parentId === node.data.parentId).indexOf(node);
          return {
            ...node,
            position: {
              x: parent.position.x + (siblingIndex * 280) - 140,
              y: parent.position.y + 200
            }
          };
        }
      }
      
      return node;
    });
  }, [nodes]);

  const addQuickIntent = (type: 'greeting' | 'question' | 'action') => {
    const templates = {
      greeting: {
        label: 'Greeting',
        trainingPhrases: ['hello', 'hi', 'hey', 'good morning'],
        responses: ['Hello! How can I help you?', 'Hi there! What can I do for you?'],
      },
      question: {
        label: 'FAQ',
        trainingPhrases: ['what is', 'how do', 'can you explain', 'tell me about'],
        responses: ['Let me explain that for you.', 'Here\'s what you need to know.'],
      },
      action: {
        label: 'Action',
        trainingPhrases: ['I want to', 'help me', 'I need', 'can you'],
        responses: ['I\'ll help you with that.', 'Let me assist you.'],
      },
    };

    const template = templates[type];
    const newNodeId = `${type}-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'intent',
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 200 + 300 
      },
      data: template,
    };

    onNodesChange((nds: Node[]) => [...nds, newNode]);
    
    toast({
      title: "Quick Intent Added",
      description: `${template.label} intent has been added to your bot`,
    });
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <ReactFlow
        nodes={layoutedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-background via-muted/20 to-background"
        connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 3 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 3 },
        }}
      >
        <Controls 
          className="!bottom-8 !left-8 bg-background/80 backdrop-blur-sm border border-border/60 rounded-lg shadow-lg"
          showInteractive={false}
        />
        
        <MiniMap 
          className="!bottom-8 !right-8 bg-background/80 backdrop-blur-sm border border-border/60 rounded-lg shadow-lg"
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            if (node.data?.isDefault) return 'hsl(var(--orange-500))';
            return 'hsl(var(--primary))';
          }}
          maskColor="hsl(var(--muted) / 0.6)"
        />
        
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="hsl(var(--muted-foreground) / 0.2)"
        />
        
        {/* Quick Add Buttons */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2 bg-background/80 backdrop-blur-sm border border-border/60 rounded-lg p-2 shadow-lg">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addQuickIntent('greeting')}
              className="flex items-center gap-2 hover:bg-blue-500/10 hover:border-blue-500/50"
            >
              <Brain className="h-4 w-4" />
              Quick Greeting
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addQuickIntent('question')}
              className="flex items-center gap-2 hover:bg-green-500/10 hover:border-green-500/50"
            >
              <Plus className="h-4 w-4" />
              Quick FAQ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addQuickIntent('action')}
              className="flex items-center gap-2 hover:bg-purple-500/10 hover:border-purple-500/50"
            >
              <Zap className="h-4 w-4" />
              Quick Action
            </Button>
          </div>
        </div>
      </ReactFlow>
      
      {/* Enhanced node styles are handled via CSS classes */}
    </div>
  );
};