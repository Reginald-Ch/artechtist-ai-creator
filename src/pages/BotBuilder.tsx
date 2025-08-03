import { useState, useCallback, useEffect } from 'react';
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
import { Brain, Bot, MessageSquare, Play, Save, Settings, Mic, Volume2, Palette, HelpCircle, Trash2, Undo, Redo } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import IntentNode from "@/components/flow/IntentNode";
import TestPanel from "@/components/TestPanel";
import AvatarSelector from "@/components/AvatarSelector";
import VoiceTrainingPanel from "@/components/VoiceTrainingPanel";
import { AIMascot } from "@/components/ai-tutor/AIMascot";
import { TutorialOverlay } from "@/components/ai-tutor/TutorialOverlay";
import { ConceptExplainer } from "@/components/ai-tutor/ConceptExplainer";
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

  // Save state on changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      undoRedo.saveState(nodes, edges);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [nodes, edges]);

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

  const updateSelectedNode = (field: string, value: any) => {
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
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">← Back</Button>
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
                <Brain className="h-6 w-6 text-orange-500" />
                <Input 
                  value={botName} 
                  onChange={(e) => setBotName(e.target.value)}
                  className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Personality: {botPersonality}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUndo}
              disabled={!undoRedo.canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRedo}
              disabled={!undoRedo.canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTestPanel(!showTestPanel)}
            >
              <Play className="h-4 w-4 mr-2" />
              Test Bot
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTutorial(true)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Tutorial
            </Button>
            <Button size="sm" onClick={handleKeyboardActions.onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

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
            nodeTypes={{
              intent: (props) => (
                <IntentNode 
                  {...props} 
                  onDelete={deleteNode}
                  onDuplicate={duplicateNode}
                  onEdit={editNode}
                />
              ),
            }}
            fitView
            className="bg-gradient-to-br from-orange-50/30 to-yellow-50/30"
          >
            <Controls className="bg-white shadow-lg" />
            <MiniMap 
              className="bg-white border shadow-lg" 
              nodeColor={(node) => node.data.isDefault ? '#f97316' : '#3b82f6'}
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
          
          {/* Add Intent Button */}
          <div className="absolute top-4 left-4">
            <Button onClick={addNewIntent} className="bg-orange-500 hover:bg-orange-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Intent
            </Button>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 border-l bg-muted/30 overflow-y-auto">
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
            <Card className="border-0 rounded-none h-full">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Intent: {selectedNode.data.label as string}
                    {selectedNode.data.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
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
                <Tabs defaultValue="training" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="training">Training</TabsTrigger>
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="training" className="space-y-4">
                    <div>
                  <Label htmlFor="intent-name">Intent Name</Label>
                  <Input
                    id="intent-name"
                    value={selectedNode.data.label as string}
                    onChange={(e) => updateSelectedNode('label', e.target.value)}
                    disabled={selectedNode.data.isDefault as boolean}
                  />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Training Phrases</Label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={selectedNode.data.isDefault as boolean}
                          onClick={() => setShowVoiceTraining(true)}
                        >
                          <Mic className="h-4 w-4 mr-1" />
                          Voice
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Enter training phrases (one per line)&#10;Example:&#10;hello&#10;hi there&#10;good morning"
                        value={(selectedNode.data.trainingPhrases as string[])?.join('\n') || ''}
                        onChange={(e) => updateSelectedNode('trainingPhrases', e.target.value.split('\n').filter(p => p.trim()))}
                        className="min-h-32"
                        disabled={selectedNode.data.isDefault as boolean}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedNode.data.trainingPhrases as string[])?.length || 0} phrases
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="responses" className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Bot Responses</Label>
                        <Button size="sm" variant="outline">
                          <Volume2 className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Enter responses (one per line)&#10;Example:&#10;Hello! How can I help you?&#10;Hi there! What can I do for you?"
                        value={(selectedNode.data.responses as string[])?.join('\n') || ''}
                        onChange={(e) => updateSelectedNode('responses', e.target.value.split('\n').filter(r => r.trim()))}
                        className="min-h-32"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedNode.data.responses as string[])?.length || 0} responses
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <div>
                      <Label>Voice Settings</Label>
                      <div className="space-y-2 mt-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Voice
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click on an intent node to edit its properties</p>
              <p className="text-sm mt-2">Or explore AI concepts with AI-ko above!</p>
            </div>
          )}
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