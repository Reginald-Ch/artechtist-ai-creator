import { useState, useCallback, useEffect, useMemo } from 'react';
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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Bot, MessageSquare, Play, Save, Settings, Mic, Volume2, Palette, HelpCircle, Trash2, Undo, Redo, Download, Upload, X, Copy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import IntentNode from "@/components/flow/IntentNode";
import TestPanel from "@/components/TestPanel";
import AvatarSelector from "@/components/AvatarSelector";
import VoiceTrainingPanel from "@/components/VoiceTrainingPanel";
import { AIMascot } from "@/components/ai-tutor/AIMascot";
import { TutorialOverlay } from "@/components/ai-tutor/TutorialOverlay";
import { ConceptExplainer } from "@/components/ai-tutor/ConceptExplainer";
import { BotBuilderToolbar } from "@/components/enhanced/BotBuilderToolbar";
import { SmartSuggestions } from "@/components/enhanced/SmartSuggestions";
import { PerformanceMetrics } from "@/components/enhanced/PerformanceMetrics";
import { CollaborationPanel } from "@/components/enhanced/CollaborationPanel";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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

const BotBuilder = () => {
  const location = useLocation();
  const template = location.state?.template;
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [botName, setBotName] = useState("My AI Assistant");
  const [botAvatar, setBotAvatar] = useState("🤖");
  const [botPersonality, setBotPersonality] = useState("helpful and friendly");
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showVoiceTraining, setShowVoiceTraining] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Undo/Redo functionality
  const undoRedo = useUndoRedo();

  // Save initial state
  useEffect(() => {
    undoRedo.saveState(nodes, edges);
  }, []);

  // Save state on changes (optimized debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      undoRedo.saveState(nodes, edges);
    }, 1000); // Increased debounce time to reduce frequent saves
    return () => clearTimeout(timeoutId);
  }, [nodes, edges, undoRedo]);

  const handleUndo = () => {
    const state = undoRedo.undo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      toast({ title: "Undone", description: "Previous action undone" });
    }
  };

  const handleRedo = () => {
    const state = undoRedo.redo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      toast({ title: "Redone", description: "Action redone" });
    }
  };
  
  // Apply template data when component mounts
  useEffect(() => {
    if (template) {
      setBotName(template.name);
      setBotAvatar(template.avatar);
      setBotPersonality(template.description);
      
      // Convert template intents to nodes
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
      setEdges([]); // Start with no connections, user can add them
    }
  }, [template, setNodes]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#f97316' }
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
  };

  const deleteSelectedNode = () => {
    if (!selectedNode || selectedNode.data.isDefault) return;
    deleteNode(selectedNode.id);
  };

  const deleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete || nodeToDelete.data.isDefault) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Intent',
      description: `Are you sure you want to delete "${nodeToDelete.data.label}"? This action cannot be undone.`,
      onConfirm: () => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => 
          edge.source !== nodeId && edge.target !== nodeId
        ));
        setSelectedNode(null);
        toast({ title: "Intent deleted", description: `"${nodeToDelete.data.label}" has been removed` });
      },
    });
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

  const handleKeyboardActions = {
    onDelete: () => {
      if (selectedNode && !selectedNode.data.isDefault) {
        deleteNode(selectedNode.id);
      }
    },
    onDuplicate: () => {
      if (selectedNode) {
        duplicateNode(selectedNode.id);
      }
    },
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: () => {
      toast({ title: "Bot saved", description: "Your bot has been saved successfully" });
    },
  };

  useKeyboardShortcuts(handleKeyboardActions);

  // Memoize nodeTypes to prevent recreation on every render
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

  const handleExport = () => {
    const botConfig = {
      name: botName,
      avatar: botAvatar,
      personality: botPersonality,
      nodes: nodes,
      edges: edges,
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(botConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${botName.replace(/\s+/g, '_')}_config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          setBotName(config.name || 'Imported Bot');
          setBotAvatar(config.avatar || '🤖');
          setBotPersonality(config.personality || 'helpful and friendly');
          setNodes(config.nodes || []);
          setEdges(config.edges || []);
          toast({
            title: "Bot Imported Successfully",
            description: `Loaded configuration for "${config.name}"`,
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid configuration file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <div className="flex items-center gap-4 p-4 border-b glassmorphism">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="hover:bg-muted">← Back</Button>
        </Link>
        <div className="flex items-center gap-3">
          <AvatarSelector 
            selectedAvatar={botAvatar} 
            onAvatarChange={(avatar, personality) => {
              setBotAvatar(avatar);
              setBotPersonality(personality);
            }} 
          />
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary animate-glow-pulse" />
            <Input 
              value={botName} 
              onChange={(e) => setBotName(e.target.value)}
              className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0 max-w-xs"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Personality: {botPersonality}
          </div>
        </div>
      </div>

      {/* Enhanced Toolbar */}
      <BotBuilderToolbar
        onTestBot={() => setShowTestPanel(!showTestPanel)}
        onTutorial={() => setShowTutorial(true)}
        onSave={handleKeyboardActions.onSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onImport={handleImport}
        onAddIntent={addNewIntent}
        canUndo={undoRedo.canUndo}
        canRedo={undoRedo.canRedo}
        nodeCount={nodes.length}
      />

      <div className="flex-1 flex">
        {/* Flow Builder */}
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
            zoomOnDoubleClick={false}
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.5}
            maxZoom={2}
            className="bg-gradient-to-br from-primary/5 via-background to-primary-glow/5"
          >
            <Controls 
              className="glassmorphism shadow-lg rounded-lg" 
              showInteractive={false}
            />
            <MiniMap 
              className="glassmorphism rounded-lg"
              nodeColor={(node) => {
                if (node.data?.isDefault) return 'hsl(var(--primary))';
                return 'hsl(var(--primary-glow))';
              }}
              maskColor="hsla(var(--background) / 0.8)"
              pannable
              zoomable
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              className="opacity-30"
            />
          </ReactFlow>
          
          {/* Enhanced Add Intent Button */}
          <div className="absolute top-4 left-4">
            <Button 
              onClick={addNewIntent} 
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300 animate-glow-pulse"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Intent
            </Button>
          </div>
        </div>

        {/* Enhanced Properties Panel */}
        <div className="w-96 border-l glassmorphism overflow-y-auto">
          <Tabs defaultValue="properties" className="h-full">
            <div className="border-b p-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
                <TabsTrigger value="suggestions" className="text-xs">AI</TabsTrigger>
                <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
                <TabsTrigger value="collaborate" className="text-xs">Team</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="properties" className="p-0 mt-0 h-full">
              <div className="p-4 space-y-4">
                {/* AI Mascot */}
                <AIMascot 
                  currentTopic={selectedConcept}
                  onTopicChange={setSelectedConcept}
                />
                
                {/* Concept Explainer */}
                {selectedConcept && (
                  <ConceptExplainer 
                    concept={selectedConcept}
                    onClose={() => setSelectedConcept(null)}
                  />
                )}
              </div>
          
              {selectedNode ? (
                <div className="space-y-4">
                  <Card className="border-0 rounded-none animate-fade-in">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-primary" />
                          Intent Properties
                        </CardTitle>
                        {!selectedNode.data.isDefault && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={deleteSelectedNode}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                      {/* Intent Name */}
                      <div className="space-y-2">
                        <Label htmlFor="intent-name">Intent Name</Label>
                        <Input
                          id="intent-name"
                          value={selectedNode.data.label as string}
                          onChange={(e) => updateSelectedNode('label', e.target.value)}
                          placeholder="Enter intent name"
                        />
                      </div>

                      {/* Training Phrases */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Training Phrases</Label>
                          <Badge variant="outline">{(selectedNode.data.trainingPhrases as string[])?.length || 0} phrases</Badge>
                        </div>
                        <div className="space-y-2">
                          {(selectedNode.data.trainingPhrases as string[])?.map((phrase, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={phrase}
                                onChange={(e) => {
                                  const newPhrases = [...(selectedNode.data.trainingPhrases as string[])];
                                  newPhrases[index] = e.target.value;
                                  updateSelectedNode('trainingPhrases', newPhrases);
                                }}
                                placeholder="Training phrase"
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
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
                            size="sm"
                            onClick={() => {
                              const currentPhrases = (selectedNode.data.trainingPhrases as string[]) || [];
                              updateSelectedNode('trainingPhrases', [...currentPhrases, '']);
                            }}
                            className="w-full"
                          >
                            + Add Training Phrase
                          </Button>
                        </div>
                      </div>

                      {/* Responses */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Bot Responses</Label>
                          <Badge variant="outline">{(selectedNode.data.responses as string[])?.length || 0} responses</Badge>
                        </div>
                        <div className="space-y-2">
                          {(selectedNode.data.responses as string[])?.map((response, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Textarea
                                value={response}
                                onChange={(e) => {
                                  const newResponses = [...(selectedNode.data.responses as string[])];
                                  newResponses[index] = e.target.value;
                                  updateSelectedNode('responses', newResponses);
                                }}
                                placeholder="Bot response"
                                className="flex-1 min-h-[60px]"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newResponses = (selectedNode.data.responses as string[]).filter((_, i) => i !== index);
                                  updateSelectedNode('responses', newResponses);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentResponses = (selectedNode.data.responses as string[]) || [];
                              updateSelectedNode('responses', [...currentResponses, '']);
                            }}
                            className="w-full"
                          >
                            + Add Response
                          </Button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-4 border-t space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowVoiceTraining(true)}
                          className="w-full"
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Voice Training
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (selectedNode) {
                              duplicateNode(selectedNode.id);
                            }
                          }}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate Intent
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground animate-fade-in">
                  <Bot className="h-16 w-16 mx-auto mb-4 opacity-50 animate-bounce" />
                  <p className="text-lg font-medium mb-2">Select an Intent</p>
                  <p className="text-sm">Click on any intent node to edit its properties</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="p-0 mt-0 h-full">
              <div className="p-4">
                <SmartSuggestions
                  nodes={nodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  onApplySuggestion={(suggestion) => {
                    console.log('Applied suggestion:', suggestion);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="p-0 mt-0 h-full">
              <div className="p-4">
                <PerformanceMetrics
                  nodes={nodes}
                />
              </div>
            </TabsContent>

            <TabsContent value="collaborate" className="p-0 mt-0 h-full">
              <div className="p-4">
                <CollaborationPanel
                  selectedNode={selectedNode}
                  onAddComment={(comment, nodeId) => {
                    console.log('Added comment:', comment, 'to node:', nodeId);
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Test Panel */}
        {showTestPanel && (
          <TestPanel 
            onClose={() => setShowTestPanel(false)}
            nodes={nodes}
            edges={edges}
            botName={botName}
            botPersonality={botPersonality}
          />
        )}

        {/* Voice Training Panel */}
        {showVoiceTraining && (
          <VoiceTrainingPanel 
            onClose={() => setShowVoiceTraining(false)}
            onAddTrainingPhrase={(phrase, intent) => {
              // Add the phrase to the selected node if it matches the intent
              if (selectedNode && selectedNode.data.label === intent) {
                const currentPhrases = selectedNode.data.trainingPhrases as string[] || [];
                updateSelectedNode('trainingPhrases', [...currentPhrases, phrase]);
              }
            }}
          />
        )}

        {/* Tutorial Overlay */}
        <TutorialOverlay 
          isVisible={showTutorial}
          onClose={() => setShowTutorial(false)}
          tutorialType="bot-builder"
          onStepComplete={(stepId) => {
            console.log('Completed step:', stepId);
          }}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default BotBuilder;