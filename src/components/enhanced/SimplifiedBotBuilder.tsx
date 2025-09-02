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
import { Brain, Bot, MessageSquare, Play, Save, Mic, ArrowLeft, Plus, Undo, Redo, ChevronDown, Menu, Info, Zap, Layout, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import IntentNode from "@/components/flow/IntentNode";
import TestPanel from "@/components/TestPanel";
import AvatarSelector from "@/components/AvatarSelector";
import VoiceSettings from "@/components/VoiceSettings";
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
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
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
      <div className="h-screen flex flex-col bg-background">
        {/* Header - Match AMBY exactly */}
        <div className="flex items-center justify-between gap-4 p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-muted">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Chatbot Playground</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground"
              onClick={() => setShowVoiceSettings(true)}
            >
              <Mic className="h-4 w-4" />
              Voice Settings
            </Button>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Test Chatbot
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Panel - Conversation Flow - More Space */}
          <div className="w-96 border-r bg-background p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Conversation Flow</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Visual</span>
                </div>
                <span className="text-sm text-muted-foreground">List</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop nodes to design your flow
              </p>
              
              <div className="flex gap-2 mb-6">
                <Button onClick={addNewIntent} className="flex-1 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Intent
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Layout
                </Button>
              </div>
            </div>

            {/* Node Cards - Match AMBY style exactly */}
            <div className="space-y-4">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedNode?.id === node.id 
                      ? 'border-primary bg-primary/5' 
                      : node.data.isDefault && node.data.label === 'Fallback'
                        ? 'border-orange-200 bg-orange-50/50'
                        : 'border-blue-200 bg-blue-50/50 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg">
                      {node.data.label === 'Fallback' ? '⚠️' : '👋'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{String(node.data.label)}</h3>
                      {node.data.isDefault && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span>📝 {(node.data.trainingPhrases as string[])?.length || 0} phrases</span>
                    <span>💬 {(node.data.responses as string[])?.length || 0} responses</span>
                  </div>
                  
                  {(node.data.trainingPhrases as string[])?.[0] && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Example:</span> {(node.data.trainingPhrases as string[])[0]}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <Badge 
                      variant={
                        (node.data.trainingPhrases as string[])?.length > 0 && 
                        (node.data.responses as string[])?.length > 0 
                          ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {(node.data.trainingPhrases as string[])?.length > 0 && 
                       (node.data.responses as string[])?.length > 0 
                        ? "Ready" : node.data.label === 'Fallback' && !(node.data.trainingPhrases as string[])?.length
                        ? "No training" : "Editing"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Flow Builder Tips */}
            <div className="mt-8 p-3 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Flow Builder Tips</span>
              </div>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Drag nodes to rearrange your conversation flow</li>
                <li>• Click nodes to edit intents and responses</li>
                <li>• Connect nodes by dragging connection points</li>
                <li>• Use the minimap to navigate large flows</li>
              </ul>
            </div>
          </div>

          {/* Middle Panel - Intent Editor */}
          <div className="flex-1 p-6 bg-muted/20">
            {selectedNode ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-1">Edit: {String(selectedNode.data.label)}</h2>
                  <p className="text-muted-foreground">Configure training phrases and responses</p>
                </div>

                <div className="space-y-6">
                  {/* Intent Name */}
                  <div>
                    <Label htmlFor="intent-name" className="text-sm font-medium">Intent Name</Label>
                    <Input
                      id="intent-name"
                      value={selectedNode.data.label as string}
                      onChange={(e) => updateSelectedNode('label', e.target.value)}
                      className="mt-1"
                      disabled={Boolean(selectedNode.data.isDefault)}
                    />
                    {selectedNode.data.isDefault && (
                      <p className="text-xs text-muted-foreground mt-1">Default intents cannot be renamed</p>
                    )}
                  </div>

                  {/* Training Phrases */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-medium">Training Phrases</Label>
                      <Badge variant="outline" className="text-xs">
                        {(selectedNode.data.trainingPhrases as string[])?.length || 0} phrases
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add examples of what users might say to trigger this intent. Aim for at least 5 varied phrases.
                    </p>
                    
                    {(selectedNode.data.trainingPhrases as string[])?.map((phrase, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          value={phrase}
                          onChange={(e) => {
                            const newPhrases = [...(selectedNode.data.trainingPhrases as string[])];
                            newPhrases[index] = e.target.value;
                            updateSelectedNode('trainingPhrases', newPhrases.filter(p => p.trim()));
                          }}
                          placeholder="e.g. How do I make pancakes?"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newPhrases = (selectedNode.data.trainingPhrases as string[]).filter((_, i) => i !== index);
                            updateSelectedNode('trainingPhrases', newPhrases);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newPhrases = [...(selectedNode.data.trainingPhrases as string[] || []), ''];
                        updateSelectedNode('trainingPhrases', newPhrases);
                      }}
                      className="w-full mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Training Phrase
                    </Button>
                  </div>

                  {/* Bot Responses */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <Label className="text-sm font-medium">Bot Responses</Label>
                      <Badge variant="outline" className="text-xs">
                        {(selectedNode.data.responses as string[])?.length || 0} responses
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      What should your bot say when this intent is triggered? Add multiple responses for variety.
                    </p>
                    
                    {(selectedNode.data.responses as string[])?.map((response, index) => (
                      <div key={index} className="mb-2">
                        <Textarea
                          value={response}
                          onChange={(e) => {
                            const newResponses = [...(selectedNode.data.responses as string[])];
                            newResponses[index] = e.target.value;
                            updateSelectedNode('responses', newResponses.filter(r => r.trim()));
                          }}
                          placeholder="e.g. You'll need flour, eggs, milk, and butter. Ready for the full recipe?"
                          rows={2}
                        />
                      </div>
                    ))}
                    
                    <Button
                      onClick={() => {
                        const newResponses = [...(selectedNode.data.responses as string[] || []), ''];
                        updateSelectedNode('responses', newResponses);
                      }}
                      className="w-full mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Response
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Intent to Edit</h3>
                  <p className="text-muted-foreground">
                    Choose an intent from the conversation flow to configure its training phrases and responses.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Test Chat */}
          <div className="w-80 border-l bg-background flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Test Your Chatbot</h2>
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Try talking to your chatbot</p>
            </div>

            <div className="flex-1 p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Live Chat Test</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Undo className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">Chat cleared! Try typing something to test me out!</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">22:31:31</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send • Click mic for voice • 
                  <Button variant="link" className="p-0 h-auto text-xs">
                    Edit with Lovable
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Settings Dialog */}
        <VoiceSettings 
          open={showVoiceSettings} 
          onOpenChange={setShowVoiceSettings} 
        />
      </div>
    </TooltipProvider>
  );
};

export default SimplifiedBotBuilder;