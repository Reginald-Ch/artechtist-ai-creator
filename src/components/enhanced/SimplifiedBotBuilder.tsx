import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Bot, MessageSquare, Play, Save, Mic, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import IntentNode from "@/components/flow/IntentNode";
import TestPanel from "@/components/TestPanel";
import AvatarSelector from "@/components/AvatarSelector";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { toast } from "@/hooks/use-toast";

const nodeTypes = {
  intent: IntentNode,
};

const initialNodes: Node[] = [
  {
    id: 'greet',
    type: 'intent',
    position: { x: 250, y: 50 },
    data: {
      label: 'Greet',
      trainingPhrases: ['hello', 'hi', 'hey there', 'good morning'],
      responses: ['Hello! How can I help you today?', 'Hi there! What can I do for you?'],
      isDefault: true,
    },
  },
  {
    id: 'fallback',
    type: 'intent',
    position: { x: 250, y: 300 },
    data: {
      label: 'Fallback',
      trainingPhrases: [],
      responses: ["I didn't understand that. Can you try asking differently?", "Sorry, I'm not sure about that. What else can I help with?"],
      isDefault: true,
    },
  },
];

const initialEdges: Edge[] = [];

interface SimplifiedBotBuilderProps {
  template?: any;
}

const SimplifiedBotBuilder = ({ template }: SimplifiedBotBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [botName, setBotName] = useState("My AI Assistant");
  const [botAvatar, setBotAvatar] = useState("🤖");
  const [botPersonality, setBotPersonality] = useState("helpful and friendly");
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [beginnerMode, setBeginnerMode] = useState(true);

  // Undo/Redo functionality
  const undoRedo = useUndoRedo();

  // Save initial state
  useEffect(() => {
    undoRedo.saveState(nodes, edges);
  }, []);

  // Apply template data when component mounts
  useEffect(() => {
    if (template) {
      setBotName(template.name);
      setBotAvatar(template.avatar);
      setBotPersonality(template.description);
      
      const templateNodes = template.intents.map((intent: any, index: number) => ({
        id: intent.name.toLowerCase().replace(/\s+/g, '-'),
        type: 'intent',
        position: { 
          x: 100 + (index % 3) * 300, 
          y: 50 + Math.floor(index / 3) * 200 
        },
        data: {
          label: intent.name,
          trainingPhrases: intent.trainingPhrases,
          responses: intent.responses,
          isDefault: intent.name === 'Greet' || intent.name === 'Fallback',
        },
      }));
      
      setNodes(templateNodes);
      setEdges([]);
    }
  }, [template, setNodes]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { 
        stroke: 'hsl(var(--primary))',
        strokeWidth: 3,
        filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.3))'
      }
    }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(node);
  }, []);

  const addNewIntent = () => {
    const newId = `intent-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'intent',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: 'New Intent',
        trainingPhrases: [],
        responses: [],
        isDefault: false,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    undoRedo.saveState([...nodes, newNode], edges);
  };

  const deleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete || nodeToDelete.data.isDefault) return;

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
    toast({ title: "Intent deleted", description: `"${nodeToDelete.data.label}" has been removed` });
  };

  const duplicateNode = (nodeId: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newId = `${nodeId}-copy-${Date.now()}`;
    const newNode: Node = {
      ...nodeToDuplicate,
      id: newId,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      data: {
        ...nodeToDuplicate.data,
        label: `${nodeToDuplicate.data.label} (Copy)`,
        isDefault: false,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    toast({ title: "Intent duplicated", description: `Created copy of "${nodeToDuplicate.data.label}"` });
  };

  const editNode = (nodeId: string) => {
    const nodeToEdit = nodes.find(n => n.id === nodeId);
    if (nodeToEdit) {
      setSelectedNode(nodeToEdit);
    }
  };

  const memoizedNodeTypes = useMemo(() => ({
    intent: (props: any) => (
      <IntentNode 
        {...props} 
        onDelete={deleteNode}
        onDuplicate={duplicateNode}
        onEdit={editNode}
      />
    ),
  }), []);

  const updateSelectedNode = useCallback((field: string, value: any) => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            }
          : node
      )
    );
    
    setSelectedNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value,
      },
    });
  }, [selectedNode, setNodes]);

  const handleSave = () => {
    toast({ title: "Bot saved", description: "Your bot has been saved successfully" });
  };

  const completionPercentage = Math.round((nodes.filter(n => 
    (n.data.trainingPhrases as string[])?.length > 0 && (n.data.responses as string[])?.length > 0
  ).length / nodes.length) * 100);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Simplified Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <AvatarSelector 
            selectedAvatar={botAvatar} 
            onAvatarChange={(avatar, personality) => {
              setBotAvatar(avatar);
              setBotPersonality(personality);
            }} 
          />
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <Input 
              value={botName} 
              onChange={(e) => setBotName(e.target.value)}
              className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0 max-w-xs"
            />
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-sm font-medium">Progress</div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
            </div>
          </div>
          <Button 
            onClick={() => setShowTestPanel(!showTestPanel)}
            variant={showTestPanel ? "default" : "outline"}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Test Bot
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Simplified Flow Builder */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={memoizedNodeTypes}
            fitView
            nodesDraggable
            nodesConnectable
            elementsSelectable
            selectNodesOnDrag={false}
            panOnDrag={[1, 2]}
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
            className="bg-gradient-to-br from-primary/5 via-background to-primary-glow/5"
          >
            <Controls className="glassmorphism shadow-lg rounded-lg" />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              className="opacity-30"
            />
          </ReactFlow>
          
          {/* Single Add Intent Button */}
          <div className="absolute top-4 left-4">
            <Button 
              onClick={addNewIntent} 
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Intent
            </Button>
          </div>

          {/* Beginner Mode Toggle */}
          <div className="absolute top-4 right-4">
            <Button 
              variant="outline"
              onClick={() => setBeginnerMode(!beginnerMode)}
              className="gap-2"
            >
              {beginnerMode ? '🎓 Beginner' : '⚡ Advanced'}
            </Button>
          </div>
        </div>

        {/* Simplified Properties Panel */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <Tabs defaultValue="build" className="h-full">
            <div className="border-b p-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="build">Build</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="build" className="p-0 mt-0 h-full">
              <div className="p-4 space-y-4">
                {selectedNode ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        {selectedNode.data.label as string}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="label">Intent Name</Label>
                        <Input
                          id="label"
                          value={selectedNode.data.label as string}
                          onChange={(e) => updateSelectedNode('label', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="training">Training Phrases</Label>
                        <Textarea
                          id="training"
                          placeholder="Enter training phrases (one per line)"
                          value={(selectedNode.data.trainingPhrases as string[])?.join('\n') || ''}
                          onChange={(e) => updateSelectedNode('trainingPhrases', e.target.value.split('\n').filter(p => p.trim()))}
                          className="mt-1"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="responses">Bot Responses</Label>
                        <Textarea
                          id="responses"
                          placeholder="Enter responses (one per line)"
                          value={(selectedNode.data.responses as string[])?.join('\n') || ''}
                          onChange={(e) => updateSelectedNode('responses', e.target.value.split('\n').filter(r => r.trim()))}
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select an Intent</h3>
                    <p className="text-muted-foreground text-sm">
                      Click on an intent node to edit its properties
                    </p>
                  </div>
                )}

                {/* Bot Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Bot Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Intents:</span>
                      <Badge variant="outline">{nodes.length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Connections:</span>
                      <Badge variant="outline">{edges.length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completion:</span>
                      <Badge variant={completionPercentage > 80 ? "default" : "secondary"}>
                        {completionPercentage}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="test" className="p-0 mt-0 h-full">
              <div className="p-4">
                <TestPanel
                  nodes={nodes}
                  botName={botName}
                  onClose={() => setShowTestPanel(false)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedBotBuilder;