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
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, MessageSquare, Save, Mic, ArrowLeft, Plus, Layout, Lightbulb, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import IntentNode from "@/components/flow/IntentNode";
import { TestChatInterface } from "@/components/TestChatInterface";
import { toast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/enhanced/ErrorBoundary";
import { ImprovedGoogleAssistantIntegration } from "./ImprovedGoogleAssistantIntegration";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SavedProjectsSection } from "./SavedProjectsSection";
import TemplateGallery from "@/components/TemplateGallery";
import { ExpandedAvatarSelector } from "./ExpandedAvatarSelector";

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
      stroke: 'hsl(var(--primary))',
      strokeWidth: 2,
      strokeDasharray: '5,5',
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
  const [botPersonality, setBotPersonality] = useState("helpful and friendly");
  const [selectedAvatar, setSelectedAvatar] = useState("🤖");
  const [testChatActive, setTestChatActive] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState("9BWtsMINqrJLrRacOk9x");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedProjects, setShowSavedProjects] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

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

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your project",
        variant: "destructive"
      });
      return;
    }

    if (!botName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const projectData = {
        name: botName,
        description: botPersonality,
        nodes,
        edges,
        voiceSettings: {
          voice: selectedVoice,
          speed: voiceSpeed,
          pitch: voicePitch
        },
        selectedAvatar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('saved_projects')
        .insert({
          user_id: user.id,
          project_name: botName,
          project_data: projectData as any
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Project saved successfully!",
        description: `${botName} has been saved to your dashboard`
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error saving project",
        description: "Failed to save your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadProject = (project: any) => {
    setBotName(project.project_name);
    setBotPersonality(project.project_data.description || '');
    setNodes(project.project_data.nodes || []);
    setEdges(project.project_data.edges || []);
    setSelectedAvatar(project.project_data.selectedAvatar || '🤖');
    setShowSavedProjects(false);
    toast({ 
      title: "Project loaded", 
      description: `${project.project_name} has been loaded successfully` 
    });
  };

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

  const memoizedNodeTypes = useMemo(() => ({
    intent: IntentNode,
  }), []);

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
        {/* Modern Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Bot Builder</h1>
              <p className="text-white/80 text-sm">Create and deploy intelligent conversational agents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Project"}
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavedProjects(!showSavedProjects)}
                className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Project
              </Button>
              {showSavedProjects && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 p-4">
                  <p className="text-sm text-gray-600">Saved projects will be shown here</p>
                  <Button onClick={() => setShowSavedProjects(false)} size="sm" className="mt-2">Close</Button>
                </div>
              )}
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowTemplateGallery(true)}
              className="bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 flex gap-6 p-6 overflow-hidden">
          {/* Configuration Panel */}
          <div className="w-80 space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Bot Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/80">Bot Name</Label>
                  <Input
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="My AI Assistant"
                  />
                </div>
                <div>
                  <Label className="text-white/80">Personality</Label>
                  <Textarea
                    value={botPersonality}
                    onChange={(e) => setBotPersonality(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Describe your bot's personality..."
                  />
                </div>
                <div>
                  <Label className="text-white/80">Avatar Selection</Label>
                  <ExpandedAvatarSelector
                    selectedAvatar={selectedAvatar}
                    onAvatarSelect={setSelectedAvatar}
                  />
                </div>
                <div>
                  <Label className="text-white/80">Voice Settings</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs text-white/60">Speed</Label>
                      <Input
                        type="number"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-white/60">Pitch</Label>
                      <Input
                        type="number"
                        min="-20"
                        max="20"
                        value={voicePitch}
                        onChange={(e) => setVoicePitch(parseInt(e.target.value))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Node Editor */}
            {selectedNode && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Edit Intent: {selectedNode.data.label as string}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white/80">Intent Name</Label>
                    <Input
                      value={selectedNode.data.label as string}
                      onChange={(e) => updateSelectedNode('label', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Training Phrases</Label>
                    <Textarea
                      placeholder="Enter training phrases (one per line)"
                      value={(selectedNode.data.trainingPhrases as string[])?.join('\n') || ''}
                      onChange={(e) => updateSelectedNode('trainingPhrases', e.target.value.split('\n').filter(p => p.trim()))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Bot Responses</Label>
                    <Textarea
                      placeholder="Enter responses (one per line)"
                      value={(selectedNode.data.responses as string[])?.join('\n') || ''}
                      onChange={(e) => updateSelectedNode('responses', e.target.value.split('\n').filter(r => r.trim()))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Flow Builder - Center Panel */}
          <div className="flex-1 space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Flow Builder
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                    {nodes.length} nodes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    size="sm"
                    onClick={addNewIntent}
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Intent
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={autoLayoutNodes}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Auto Layout
                  </Button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-white/10 h-96">
                  <ReactFlowProvider>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onNodeClick={onNodeClick}
                      nodeTypes={memoizedNodeTypes}
                      fitView
                      className="bg-transparent"
                      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    >
                      <Background color="#ffffff20" />
                      <Controls className="bg-white/10 border-white/20" />
                    </ReactFlow>
                  </ReactFlowProvider>
                </div>
              </CardContent>
            </Card>

            {/* Testing & Deployment Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Test Interface
                    <Badge variant={testChatActive ? "default" : "secondary"} className="ml-2">
                      {testChatActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TestChatInterface
                    nodes={nodes}
                    edges={edges}
                    isActive={testChatActive}
                    onToggle={() => setTestChatActive(!testChatActive)}
                    selectedAvatar={selectedAvatar}
                    botPersonality={botPersonality}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Google Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ImprovedGoogleAssistantIntegration
                    nodes={nodes}
                    edges={edges}
                    voiceSettings={{
                      voice: selectedVoice,
                      speed: voiceSpeed,
                      pitch: voicePitch,
                      language: 'en-US'
                    }}
                    selectedAvatar={selectedAvatar}
                    botPersonality={botPersonality}
                    onDeploymentComplete={(status) => {
                      console.log('Deployment status:', status);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Dialogs and Modals */}
        {showTemplateGallery && (
          <Dialog open={showTemplateGallery} onOpenChange={setShowTemplateGallery}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Choose a Template</DialogTitle>
              </DialogHeader>
              <TemplateGallery 
                onUseTemplate={(template) => {
                  setShowTemplateGallery(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SimplifiedBotBuilder;