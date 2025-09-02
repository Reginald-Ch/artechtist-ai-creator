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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Bot, MessageSquare, Play, Save, Mic, ArrowLeft, Plus, Undo, Redo, ChevronDown, Menu, Info, Zap, Layout, X, Send, RotateCcw, MicIcon, StopCircle, Speaker } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import IntentNode from "@/components/flow/IntentNode";
import TestPanel from "@/components/TestPanel";
import { OptimizedAvatarSelector } from "@/components/enhanced/OptimizedAvatarSelector";
import { OptimizedVoiceSettings } from "@/components/enhanced/OptimizedVoiceSettings";
import { TestChatInterface } from "@/components/TestChatInterface";
import { VoiceEnhancedChat } from "@/components/enhanced/VoiceEnhancedChat";
import { BotBuilderToolbar } from "@/components/enhanced/BotBuilderToolbar";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useConversationEngine } from "@/hooks/useConversationEngine";
import { toast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/enhanced/ConfirmationDialog";
import { ErrorBoundary } from "@/components/enhanced/ErrorBoundary";
import GoogleSpeakerIntegration from "@/components/google-speaker/GoogleSpeakerIntegration";
import { BotBuilderTutorial } from '@/components/tutorial/BotBuilderTutorial';
import { AIMascot } from '@/components/tutorial/AIMascot';
import { ConnectionFlowVisualization } from '@/components/flow/ConnectionFlowVisualization';

// Removed duplicate nodeTypes definition

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
  const [showTestPanel, setShowTestPanel] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [projectName, setProjectName] = useState("My Project");
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, nodeId: string | null}>({open: false, nodeId: null});
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHelpMascot, setShowHelpMascot] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  
  // Voice settings state
  const [voiceApiKey, setVoiceApiKey] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("9BWtsMINqrJLrRacOk9x");
  const [selectedModel, setSelectedModel] = useState("eleven_multilingual_v2");
  
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
      console.log('Applying template:', template);
      setBotName(template.name || "My AI Assistant");
      setBotAvatar(template.avatar || "🤖");
      setBotPersonality(template.description || "helpful and friendly");
      
      // Improved template parsing with fallbacks
      const templateNodes = template.intents?.map((intent: any, index: number) => ({
        id: intent.name ? intent.name.toLowerCase().replace(/\s+/g, '-') : `intent-${index}`,
        type: 'intent',
        position: { 
          x: 100 + (index % 3) * 300, 
          y: 50 + Math.floor(index / 3) * 200 
        },
        data: {
          label: intent.name || `Intent ${index + 1}`,
          trainingPhrases: Array.isArray(intent.trainingPhrases) ? intent.trainingPhrases : [],
          responses: Array.isArray(intent.responses) ? intent.responses : [],
          isDefault: intent.name === 'Greet' || intent.name === 'Fallback',
        },
      })) || initialNodes;
      
      setNodes(templateNodes);
      setEdges([]);
      
      // Save template data to localStorage for persistence
      localStorage.setItem('current-agent-template', JSON.stringify(template));
    }
  }, [template, setNodes]);
  
  const onConnect = useCallback((params: Connection) => 
    setEdges((eds) => addEdge({
      ...params,
      id: `e${params.source}-${params.target}`,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { 
        stroke: 'hsl(var(--foreground))',
        strokeWidth: 2,
      }
    }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(prev => prev?.id === node.id ? null : node);
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

  const deleteNode = useCallback((nodeId: string) => {
    console.log('deleteNode called with nodeId:', nodeId);
    console.log('Current nodes:', nodes.map(n => ({ id: n.id, label: n.data.label, isDefault: n.data.isDefault })));
    
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) {
      console.error('Node not found:', nodeId);
      toast({ 
        title: "Node not found", 
        description: "The intent could not be found",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Node to delete:', nodeToDelete);
    
    if (nodeToDelete.data.isDefault) {
      console.log('Cannot delete default node');
      toast({ 
        title: "Cannot delete", 
        description: "Default intents cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    console.log('Opening delete dialog for node:', nodeId);
    setDeleteDialog({open: true, nodeId});
  }, [nodes]);

  const confirmDelete = useCallback(() => {
    console.log('confirmDelete called with nodeId:', deleteDialog.nodeId);
    
    if (!deleteDialog.nodeId) {
      console.error('No nodeId in deleteDialog');
      return;
    }
    
    const nodeToDelete = nodes.find(n => n.id === deleteDialog.nodeId);
    if (!nodeToDelete) {
      console.error('Node not found for deletion:', deleteDialog.nodeId);
      return;
    }

    console.log('Deleting node:', nodeToDelete);

    // Save state before deletion for undo
    undoRedo.saveState(nodes, edges);

    const newNodes = nodes.filter((node) => node.id !== deleteDialog.nodeId);
    const newEdges = edges.filter((edge) => 
      edge.source !== deleteDialog.nodeId && edge.target !== deleteDialog.nodeId
    );
    
    console.log('New nodes after deletion:', newNodes.length);
    console.log('New edges after deletion:', newEdges.length);
    
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
    setDeleteDialog({open: false, nodeId: null});
    
    toast({ 
      title: "Intent deleted", 
      description: `"${nodeToDelete.data.label}" has been removed`
    });
  }, [deleteDialog.nodeId, nodes, edges, undoRedo, setNodes, setEdges]);

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

  // Optimize nodeTypes with proper dependencies
  const memoizedNodeTypes = useMemo(() => ({
    intent: IntentNode,
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
    setIsSaving(true);
    // Save to localStorage
    const projectData = {
      name: projectName,
      botName,
      botAvatar,
      botPersonality,
      nodes,
      edges,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(`bot-project-${projectName}`, JSON.stringify(projectData));
    
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      toast({ title: "Project saved", description: `"${projectName}" has been saved successfully` });
    }, 1000);
  };
  
  const handleExport = () => {
    const projectData = {
      name: projectName,
      botName,
      botAvatar,
      botPersonality,
      nodes,
      edges,
      exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const projectData = JSON.parse(e.target?.result as string);
            setProjectName(projectData.name || 'Imported Project');
            setBotName(projectData.botName || 'My AI Assistant');
            setBotAvatar(projectData.botAvatar || '🤖');
            setBotPersonality(projectData.botPersonality || 'helpful and friendly');
            setNodes(projectData.nodes || initialNodes);
            setEdges(projectData.edges || initialEdges);
            toast({ title: "Project imported", description: `"${projectData.name}" has been loaded` });
          } catch (error) {
            toast({ title: "Import failed", description: "Invalid project file", variant: "destructive" });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="speaker">Speaker</TabsTrigger>
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
          <div className="p-4 h-full">
            <VoiceEnhancedChat
              nodes={nodes}
              botName={botName}
              botAvatar={botAvatar}
            />
          </div>
        </TabsContent>

        <TabsContent value="speaker" className="p-0 mt-0 h-full">
          <div className="p-4 h-full overflow-y-auto">
            <GoogleSpeakerIntegration
              botNodes={nodes}
              botEdges={edges}
              onConnectionChange={(isConnected) => {
                console.log('Google Speaker connection changed:', isConnected);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="h-screen flex flex-col bg-background">
        {/* Enhanced Header with BotBuilderToolbar */}
        <BotBuilderToolbar
          onTestBot={() => setShowTestPanel(!showTestPanel)}
          onTutorial={() => {
            setShowTutorial(true);
            setShowMascot(true);
          }}
          onSave={handleSave}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExport={handleExport}
          onImport={handleImport}
          onAddIntent={addNewIntent}
          canUndo={undoRedo.canUndo}
          canRedo={undoRedo.canRedo}
          isConnected={false}
          nodeCount={nodes.length}
        />
        
        {/* Secondary header with navigation and project info */}
        <div className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-muted">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Chatbot Playground</h1>
          </div>

        </div>

        <div className="flex-1 flex">
          {/* Left Panel - Flow Canvas with ReactFlow */}
          <div className="w-[500px] border-r bg-background">
            <div className="h-14 px-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Conversation Flow</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addNewIntent}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Intent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={autoLayoutNodes}
                  className="text-xs"
                >
                  <Layout className="h-3 w-3 mr-1" />
                  Auto Layout
                </Button>
              </div>
            </div>
            <div className="h-[calc(100vh-14rem)]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={memoizedNodeTypes}
                fitView
                minZoom={0.3}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
                proOptions={{ hideAttribution: true }}
                className="bg-muted/20"
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                connectionLineStyle={{ 
                  stroke: '#3b82f6', 
                  strokeWidth: 3,
                  strokeDasharray: '8,4',
                  animation: 'dash 1s linear infinite'
                }}
                connectionMode={"loose" as any}
                snapToGrid={true}
                snapGrid={[15, 15]}
                onConnectStart={() => console.log('Connection started')}
                onConnectEnd={() => console.log('Connection ended')}
              >
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={20} 
                  size={1.5} 
                  color="#e2e8f0"
                  className="opacity-40"
                />
                <MiniMap 
                  nodeColor={(node) => {
                    if (node.data.isDefault && node.data.label === 'Fallback') return '#f97316';
                    if (node.data.isDefault) return '#3b82f6';
                    return '#6366f1';
                  }}
                  className="bg-background border border-border rounded-lg shadow-lg"
                  style={{ width: 160, height: 100 }}
                  position="bottom-right"
                  pannable
                  zoomable
                />
                <Controls 
                  className="bg-background border border-border rounded-lg shadow-lg" 
                  showZoom={true}
                  showFitView={true}
                  showInteractive={true}
                />
              </ReactFlow>
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

          {/* Right Panel - Real-time Testing */}
          <div className="w-80 border-l bg-background">
            <div className="h-14 px-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Testing Panel</h2>
              <Badge variant={showTestPanel ? "default" : "secondary"} className="text-xs">
                {showTestPanel ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="p-4 text-sm text-muted-foreground">
              <p className="mb-2">Real-time test of your chatbot responses.</p>
              <p>Try typing or using voice-to-text.</p>
            </div>
            <div className="h-[calc(100vh-12rem)]">
              <TestChatInterface
                nodes={nodes}
                edges={edges}
                isActive={showTestPanel}
                onToggle={() => setShowTestPanel(!showTestPanel)}
                selectedAvatar={botAvatar}
                botPersonality={botPersonality}
              />
            </div>
          </div>
        </div>

        {/* Avatar Selector Dialog */}
        {showAvatarSelector && (
          <Dialog open={showAvatarSelector} onOpenChange={setShowAvatarSelector}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-md border z-50">
              <DialogHeader>
                <DialogTitle>Choose Bot Avatar & Personality</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <OptimizedAvatarSelector
                  selectedAvatar={botAvatar}
                  onAvatarChange={(avatar, personality) => {
                    setBotAvatar(avatar);
                    setBotPersonality(personality);
                    setShowAvatarSelector(false);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Optimized Voice Settings Dialog */}
        <OptimizedVoiceSettings
          open={showVoiceSettings}
          onOpenChange={setShowVoiceSettings}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({...prev, open}))}
          title="Delete Intent"
          description={`Are you sure you want to delete "${nodes.find(n => n.id === deleteDialog.nodeId)?.data.label || 'this intent'}"? This action cannot be undone.`}
          confirmText="Delete Intent"
          cancelText="Keep Intent"
          onConfirm={confirmDelete}
          destructive
        />

        {/* Tutorial */}
        <BotBuilderTutorial 
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={() => setShowMascot(true)}
        />

        {/* AI Mascot */}
        {showMascot && (
          <AIMascot 
            onStartTutorial={() => {
              setShowTutorial(true);
              setShowMascot(false);
            }}
            onClose={() => setShowMascot(false)}
            mood="helpful"
          />
        )}
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default SimplifiedBotBuilder;