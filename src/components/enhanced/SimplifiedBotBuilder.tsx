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
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Brain, Bot, MessageSquare, Play, Save, Mic, ArrowLeft, Plus, Undo, Redo, ChevronDown, Menu, Info, Zap, Layout } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
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
    position: { x: 300, y: 100 },
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
    position: { x: 300, y: 400 },
    data: {
      label: 'Fallback',
      trainingPhrases: [],
      responses: ["I didn't understand that. Can you try asking differently?", "Sorry, I'm not sure about that. What else can I help with?"],
      isDefault: true,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'greet-fallback',
    source: 'greet',
    target: 'fallback',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { 
      stroke: 'hsl(var(--foreground))',
      strokeWidth: 2,
    }
  }
];

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
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  
  const isMobile = useIsMobile();

  // Undo/Redo functionality
  const undoRedo = useUndoRedo();

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(() => {
        setLastSaved(new Date());
        // Here you would typically save to a backend
      }, 30000); // Auto-save every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoSave, nodes, edges]);

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
        stroke: 'hsl(var(--foreground))',
        strokeWidth: 2,
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
    setLastSaved(new Date());
    toast({ title: "Bot saved", description: "Your bot has been saved successfully" });
  };

  const handleUndo = () => {
    const previousState = undoRedo.undo();
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      toast({ title: "Undone", description: "Previous action undone" });
    }
  };

  const handleRedo = () => {
    const nextState = undoRedo.redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      toast({ title: "Redone", description: "Action redone" });
    }
  };

  const autoLayoutNodes = () => {
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: 150 + (index % 3) * 250,
        y: 100 + Math.floor(index / 3) * 200,
      },
    }));
    setNodes(layoutedNodes);
    toast({ title: "Layout updated", description: "Nodes have been automatically arranged" });
  };

  const completionPercentage = Math.round((nodes.filter(n => 
    (n.data.trainingPhrases as string[])?.length > 0 && (n.data.responses as string[])?.length > 0
  ).length / nodes.length) * 100);

  // Properties Panel Component
  const PropertiesPanel = () => (
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
              <Collapsible defaultOpen>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-primary" />
                          {selectedNode.data.label as string}
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="label" className="flex items-center gap-2">
                          Intent Name
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>The name that identifies this intent</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="label"
                          value={selectedNode.data.label as string}
                          onChange={(e) => updateSelectedNode('label', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted/50 rounded">
                            <Label className="flex items-center gap-2">
                              Training Phrases
                              <Badge variant="outline" className="text-xs">
                                {(selectedNode.data.trainingPhrases as string[])?.length || 0}
                              </Badge>
                            </Label>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Textarea
                            placeholder="Enter training phrases (one per line)"
                            value={(selectedNode.data.trainingPhrases as string[])?.join('\n') || ''}
                            onChange={(e) => updateSelectedNode('trainingPhrases', e.target.value.split('\n').filter(p => p.trim()))}
                            className="mt-1"
                            rows={4}
                          />
                        </CollapsibleContent>
                      </Collapsible>

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted/50 rounded">
                            <Label className="flex items-center gap-2">
                              Bot Responses
                              <Badge variant="outline" className="text-xs">
                                {(selectedNode.data.responses as string[])?.length || 0}
                              </Badge>
                            </Label>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Textarea
                            placeholder="Enter responses (one per line)"
                            value={(selectedNode.data.responses as string[])?.join('\n') || ''}
                            onChange={(e) => updateSelectedNode('responses', e.target.value.split('\n').filter(r => r.trim()))}
                            className="mt-1"
                            rows={4}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
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
                <CardTitle className="text-sm flex items-center gap-2">
                  Bot Status
                  <Badge variant={completionPercentage > 80 ? "default" : "secondary"}>
                    {completionPercentage}%
                  </Badge>
                </CardTitle>
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
                  <span>Last Saved:</span>
                  <span className="text-xs text-muted-foreground">
                    {lastSaved.toLocaleTimeString()}
                  </span>
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
  );

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        {/* Enhanced Header */}
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

          {/* Enhanced Actions */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo Controls */}
            <div className="flex items-center gap-1 mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleUndo}
                    disabled={!undoRedo.canUndo}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRedo}
                    disabled={!undoRedo.canRedo}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex flex-col items-end mr-4">
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

            {!isMobile && (
              <Button 
                onClick={() => setShowTestPanel(!showTestPanel)}
                variant={showTestPanel ? "default" : "outline"}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Test Bot
              </Button>
            )}
            
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>

            {/* Mobile Menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <PropertiesPanel />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Enhanced Flow Builder */}
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
              className="bg-muted/20"
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    handleUndo();
                  } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                    e.preventDefault();
                    handleRedo();
                  } else if (e.key === 's') {
                    e.preventDefault();
                    handleSave();
                  }
                }
                if (e.key === 'Delete' && selectedNode && !selectedNode.data.isDefault) {
                  deleteNode(selectedNode.id);
                }
              }}
              tabIndex={0}
            >
              <Controls className="shadow-sm" />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={24} 
                size={1}
                className="opacity-20"
              />
              <MiniMap 
                nodeColor="hsl(var(--primary))"
                className="bg-background border border-border rounded-lg shadow-sm"
                pannable
                zoomable
              />
            </ReactFlow>
            
            {/* Enhanced Floating Actions */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={autoLayoutNodes} 
                    size="lg"
                    variant="outline"
                    className="rounded-full shadow-lg hover:shadow-xl h-12 w-12 p-0"
                  >
                    <Layout className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Auto Layout</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={addNewIntent} 
                    size="lg"
                    className="rounded-full shadow-lg hover:shadow-xl h-12 w-12 p-0"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Intent</TooltipContent>
              </Tooltip>
            </div>

            {/* Mobile Test Panel Toggle */}
            {isMobile && (
              <div className="absolute top-4 right-4">
                <Button 
                  onClick={() => setShowTestPanel(!showTestPanel)}
                  variant={showTestPanel ? "default" : "outline"}
                  size="sm"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Desktop Properties Panel */}
          {!isMobile && <PropertiesPanel />}
        </div>

        {/* Mobile Test Panel Overlay */}
        {isMobile && showTestPanel && (
          <div className="absolute inset-0 bg-background z-50 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Test Your Bot</h2>
              <Button variant="ghost" onClick={() => setShowTestPanel(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <TestPanel
                nodes={nodes}
                botName={botName}
                onClose={() => setShowTestPanel(false)}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SimplifiedBotBuilder;