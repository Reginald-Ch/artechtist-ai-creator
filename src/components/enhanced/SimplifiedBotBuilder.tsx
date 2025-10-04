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
import { IntentTrainingDialog } from './IntentTrainingDialog';
import { ConversationTemplates, type Template } from './ConversationTemplates';
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
import { Brain, Bot, MessageSquare, Play, Save, Mic, ArrowLeft, Plus, Undo, Redo, ChevronDown, Menu, Info, Zap, Layout, X, Send, RotateCcw, MicIcon, StopCircle, Speaker, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import IntentNode from "@/components/flow/IntentNode";
import { OptimizedAvatarSelector } from "@/components/enhanced/OptimizedAvatarSelector";
import { EnhancedTestChatInterface } from "@/components/chat/EnhancedTestChatInterface";
import { BotBuilderToolbar } from "@/components/enhanced/BotBuilderToolbar";
import { IntentList } from "@/components/builder/IntentList";
import { CanvasControls } from "@/components/builder/CanvasControls";
import { BotConfiguration } from "@/components/builder/BotConfiguration";
import { TutorialManager } from "@/components/enhanced/TutorialManager";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useConversationEngine } from "@/hooks/useConversationEngine";
import { toast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/enhanced/ConfirmationDialog";
import { ErrorBoundary } from "@/components/enhanced/ErrorBoundary";
import { BotBuilderTutorial } from '@/components/tutorial/BotBuilderTutorial';
import { AIMascot } from '@/components/tutorial/AIMascot';
import { VoiceChatbotSettings } from "@/components/enhanced/VoiceChatbotSettings";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BeginnerModeToggle } from "./BeginnerModeToggle";
import { VoiceFirstExperience } from "./VoiceFirstExperience";
import { KidFriendlyProgressTracker } from "./KidFriendlyProgressTracker";
import { FirstTimeBotWizard } from "./FirstTimeBotWizard";
import { useAvatarPersistence } from "@/hooks/useAvatarPersistence";

// Removed duplicate nodeTypes definition

const initialNodes: Node[] = [
  {
    id: 'greet',
    type: 'intent',
    position: { x: 200, y: 100 },
    data: {
      label: 'Greet',
      trainingPhrases: ['hello', 'hi', 'hey there', 'good morning', 'what\'s up'],
      responses: ['Hello! How can I help you today?', 'Hi there! What can I do for you?', 'Hey! Great to see you! How can I assist?'],
      isDefault: true,
    },
    draggable: true,
  },
  {
    id: 'fallback',
    type: 'intent',
    position: { x: 200, y: 400 },
    data: {
      label: 'Fallback',
      trainingPhrases: [],
      responses: ["I didn't understand that. Can you try asking differently?", "Sorry, I'm not sure about that. What else can I help with?", "Could you rephrase that? I want to make sure I help you properly!"],
      isDefault: true,
    },
    draggable: true,
  },
];

// Enhanced initial edges for tree flow
const initialEdges: Edge[] = [
  {
    id: 'greet-fallback',
    source: 'greet',
    target: 'fallback',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { 
      stroke: 'hsl(var(--muted-foreground))',
      strokeWidth: 2,
      strokeDasharray: '8,4',
    },
    animated: false,
  }
];

interface SimplifiedBotBuilderProps {
  template?: any;
}

const SimplifiedBotBuilder = ({ template }: SimplifiedBotBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [isBeginnerMode, setIsBeginnerMode] = useState(true);
  const [showFirstTimeWizard, setShowFirstTimeWizard] = useState(false);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [botName, setBotName] = useState("My AI Assistant");
  const [botDescription, setBotDescription] = useState("helpful and friendly");
  
  // Use centralized avatar persistence
  const { avatar: botAvatar, personality: botPersonality, saveAvatar, updateAvatarAndPersonality } = useAvatarPersistence("🤖", "helpful and friendly");
  const [selectedAvatar, setSelectedAvatar] = useState(botAvatar);
  const [voiceSettings, setVoiceSettings] = useState({});
  const [showTestPanel, setShowTestPanel] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const { user } = useAuth();
  
  const [projectName, setProjectName] = useState("My Project");
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, nodeId: string | null}>({open: false, nodeId: null});
  const [intentTrainingDialog, setIntentTrainingDialog] = useState<{
    open: boolean;
    intentData: { id: string; label: string; trainingPhrases: string[]; responses: string[] } | null;
  }>({ open: false, intentData: null });
  const [followUpNameDialog, setFollowUpNameDialog] = useState<{
    open: boolean;
    parentId: string | null;
  }>({ open: false, parentId: null });
  const [followUpIntentName, setFollowUpIntentName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Voice settings state
  const [voiceApiKey, setVoiceApiKey] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("9BWtsMINqrJLrRacOk9x");
  const [selectedModel, setSelectedModel] = useState("eleven_multilingual_v2");
  
  const isMobile = useIsMobile();

  // Undo/Redo functionality
  const undoRedo = useUndoRedo();

  // Define updateSelectedNode first
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

  // Voice recognition for training phrases
  const startVoiceRecognition = useCallback(() => {
    if (!selectedNode) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const currentPhrases = (selectedNode.data.trainingPhrases as string[]) || [];
        const newPhrases = [...currentPhrases, transcript];
        updateSelectedNode('trainingPhrases', newPhrases);
        
        toast({
          title: "Training phrase added",
          description: `"${transcript}" has been added to ${selectedNode.data.label}`
        });
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Could not access microphone",
          variant: "destructive"
        });
      };

      recognition.start();
    } else {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
    }
  }, [selectedNode, updateSelectedNode]);

  // Handle voice recognition toggle
  useEffect(() => {
    if (isListening && selectedNode) {
      startVoiceRecognition();
    }
  }, [isListening, selectedNode, startVoiceRecognition]);

  // Debounced auto-save for undo/redo
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0) {
        undoRedo.saveState(nodes, edges);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeoutId);
  }, [nodes, edges]);

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

  // Apply template data when component mounts
  useEffect(() => {
    if (template) {
      console.log('Applying template:', template);
      setBotName(template.name || "My AI Assistant");
      if (template.avatar) {
        saveAvatar(template.avatar, template.personality || template.description || "helpful and friendly");
      }
      setBotDescription(template.description || "helpful and friendly");
      
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

      // Create connecting lines between template nodes
      const templateEdges = templateNodes.length > 1 ? templateNodes.slice(1).map((node, index) => ({
        id: `template-edge-${index}`,
        source: templateNodes[0].id,
        target: node.id,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { 
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2,
          strokeDasharray: '5,5'
        }
      })) : [];
      
      setNodes(templateNodes);
      setEdges(templateEdges);
      
      // Save template data to localStorage for persistence
      localStorage.setItem('current-agent-template', JSON.stringify(template));
    }
  }, [template, setNodes]);

  // Load saved project data and check for first-time users
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const savedProjectData = searchParams.get('project');
    
    if (savedProjectData) {
      try {
        const savedProject = JSON.parse(decodeURIComponent(savedProjectData));
        setBotName(savedProject.project_name);
        setBotDescription(savedProject.project_data.description || '');
        setNodes(savedProject.project_data.nodes || []);
        setEdges(savedProject.project_data.edges || []);
        setVoiceSettings(savedProject.project_data.voiceSettings || {});
        setSelectedAvatar(savedProject.project_data.selectedAvatar || '');
      } catch (error) {
        console.error('Error loading saved project:', error);
      }
    } else {
      // Check if this is a first-time user
      const hasBuiltBot = localStorage.getItem('hasBuiltFirstBot');
      if (!hasBuiltBot && isBeginnerMode) {
        setShowFirstTimeWizard(true);
      }
    }
  }, [isBeginnerMode]);
  
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

  const openIntentTraining = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      // Block training for fallback intent - always locked
      if (typeof node.data.label === 'string' && node.data.label.toLowerCase().includes('fallback')) {
        toast({
          title: "Fallback Intent Locked",
          description: "The fallback intent cannot be modified to ensure consistent error handling.",
          variant: "default"
        });
        return;
      }
      
      // Only allow training for "Greet" intent (and any custom intents)
      if (typeof node.data.label === 'string' && !node.data.label.toLowerCase().includes('greet') && node.data.isDefault) {
        toast({
          title: "Intent Locked",
          description: "Only the Greet intent can be trained for new agents.",
          variant: "default"
        });
        return;
      }
      
      setIntentTrainingDialog({
        open: true,
        intentData: {
          id: node.id,
          label: node.data.label as string,
          trainingPhrases: (node.data.trainingPhrases as string[]) || [],
          responses: (node.data.responses as string[]) || []
        }
      });
    }
  }, [nodes]);

  const handleIntentTrainingSave = useCallback((data: { trainingPhrases: string[]; responses: string[] }) => {
    if (intentTrainingDialog.intentData) {
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === intentTrainingDialog.intentData!.id
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
      undoRedo.saveState(nodes, edges);
    }
  }, [intentTrainingDialog.intentData, nodes, edges, undoRedo, setNodes]);

  const addNewIntent = (parentId?: string, customName?: string) => {
    const newId = `intent-${Date.now()}`;
    const parentNode = parentId ? nodes.find(n => n.id === parentId) : null;
    
    // Enhanced tree-based positioning for conversational flow
    let newPosition;
    if (parentNode) {
      // Create tree-like structure with better spacing
      const childrenCount = edges.filter(e => e.source === parentId).length;
      const angle = (childrenCount * 60) - 30; // Spread children in fan pattern
      const distance = 250;
      const radians = (angle * Math.PI) / 180;
      
      newPosition = {
        x: parentNode.position.x + Math.cos(radians) * distance,
        y: parentNode.position.y + Math.sin(radians) * distance + 150
      };
    } else {
      // Auto-connect to the most recent non-fallback node in tree layout
      const connectableNodes = nodes.filter(n => n.id !== 'fallback');
      const targetNode = connectableNodes[connectableNodes.length - 1] || nodes.find(n => n.id === 'greet');
      
      if (targetNode) {
        // Position new nodes to the right and slightly down for tree flow
        const existingChildren = edges.filter(e => e.source === targetNode.id).length;
        newPosition = { 
          x: targetNode.position.x + 280 + (existingChildren * 150), 
          y: targetNode.position.y + 120 
        };
      } else {
        newPosition = { x: 600, y: 100 };
      }
    }
    
    // Use custom name if provided, otherwise use default naming
    const intentLabel = customName || (parentId ? `${parentNode?.data.label} Follow-up` : 'New Intent');
    
    const newNode: Node = {
      id: newId,
      type: 'intent',
      position: newPosition,
      data: {
        label: intentLabel,
        trainingPhrases: [],
        responses: [],
        isDefault: false,
      },
      draggable: true, // Enable drag & rearrange
    };
    
    const newNodes = [...nodes, newNode];
    let newEdges = [...edges];
    
    // Enhanced auto-connect logic for tree structure
    let sourceNodeId = parentId;
    if (!parentId) {
      // Auto-connect to most recent node (excluding fallback for clean tree)
      const nonFallbackNodes = nodes.filter(n => n.id !== 'fallback');
      const lastNode = nonFallbackNodes[nonFallbackNodes.length - 1];
      sourceNodeId = lastNode?.id || 'greet';
    }
    
    if (sourceNodeId) {
      const newEdge: Edge = {
        id: `e${sourceNodeId}-${newId}`,
        source: sourceNodeId,
        target: newId,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { 
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2,
          strokeDasharray: parentId ? undefined : '5,5',
        },
        animated: true, // Add animation for better visual flow
      };
      newEdges = [...edges, newEdge];
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
    undoRedo.saveState(newNodes, newEdges);
    
    toast({
      title: "New Intent Added",
      description: `"${intentLabel}" has been connected to your conversation flow`,
    });
  };

  // Handler for showing the follow-up intent naming dialog
  const handleAddFollowUpIntent = (parentId: string) => {
    setFollowUpNameDialog({ open: true, parentId });
    setFollowUpIntentName('');
  };

  // Handler for confirming the follow-up intent creation with custom name
  const confirmFollowUpIntent = () => {
    if (followUpIntentName.trim() && followUpNameDialog.parentId) {
      addNewIntent(followUpNameDialog.parentId, followUpIntentName.trim());
      setFollowUpNameDialog({ open: false, parentId: null });
      setFollowUpIntentName('');
    }
  };

  // Add global function for follow-up intents and training
  useEffect(() => {
    (window as any).addFollowUpIntent = handleAddFollowUpIntent;
    (window as any).openIntentTraining = openIntentTraining;
    return () => {
      delete (window as any).addFollowUpIntent;
      delete (window as any).openIntentTraining;
    };
  }, [nodes, edges, openIntentTraining]);

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
        description: botDescription,
        avatar: selectedAvatar || botAvatar,
        nodes,
        edges,
        voiceSettings,
        selectedAvatar: selectedAvatar || botAvatar,
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

      // Navigate to dashboard after saving
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
            if (projectData.botAvatar) {
              updateAvatarAndPersonality(projectData.botAvatar, projectData.botPersonality || 'helpful and friendly');
            }
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
    } else {
      toast({ title: "Nothing to undo", description: "You're at the beginning of history", variant: "default" });
    }
  };

  const handleRedo = () => {
    const nextState = undoRedo.redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      toast({ title: "Redone", description: "Action redone" });
    } else {
      toast({ title: "Nothing to redo", description: "You're at the latest state", variant: "default" });
    }
  };

  // Save state whenever nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        undoRedo.saveState(nodes, edges);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges]);

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
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Enter training phrases (one per line)"
                                value={(selectedNode.data.trainingPhrases as string[])?.join('\n') || ''}
                                onChange={(e) => updateSelectedNode('trainingPhrases', e.target.value.split('\n').filter(p => p.trim()))}
                                className="flex-1"
                                rows={4}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsListening(!isListening)}
                                className={`px-3 ${isListening ? 'bg-red-50 border-red-200' : ''}`}
                                title="Use voice to add training phrases"
                              >
                                {isListening ? (
                                  <>
                                    <StopCircle className="h-4 w-4 text-red-500" />
                                  </>
                                ) : (
                                  <>
                                    <Mic className="h-4 w-4" />
                                  </>
                                )}
                              </Button>
                            </div>
                            {isListening && (
                              <div className="text-xs text-red-500 flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                Say a training phrase - it will be added automatically
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Add at least 5 training phrases to train your model effectively
                            </p>
                          </div>
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
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Ready to Build Your Bot</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                  Click on any intent node in the workspace to configure its training phrases and responses
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => addNewIntent()}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Intent
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Or select an existing intent to edit
                  </p>
                </div>
              </div>
            )}

            {/* Bot Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  Bot Configuration
                  <Badge variant={completionPercentage > 80 ? "default" : "secondary"}>
                    {completionPercentage}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bot Avatar & Personality</Label>
                  <OptimizedAvatarSelector
                    selectedAvatar={botAvatar}
                    onAvatarChange={(avatar, personality) => {
                      updateAvatarAndPersonality(avatar, personality);
                      toast({
                        title: "Avatar updated!",
                        description: `Now using ${avatar}`
                      });
                    }}
                  />
                </div>
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
            
            {/* Voice First Experience */}
            <VoiceFirstExperience 
              nodes={nodes}
              onVoiceTest={() => setShowVoiceSettings(true)}
              botName={botName}
            />
            
            {/* Kid Friendly Progress Tracker */}
            {isBeginnerMode && (
              <KidFriendlyProgressTracker />
            )}
          </div>
        </TabsContent>

        <TabsContent value="test" className="p-0 mt-0 h-full">
          <div className="p-4 h-full">
            <EnhancedTestChatInterface
              nodes={nodes}
              edges={edges}
              botName={botName}
              botAvatar={selectedAvatar || botAvatar}
              className="h-full"
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
            // Tutorial is now managed by TutorialManager component
            toast({
              title: "📚 Tutorial",
              description: "Look for the Tutorial button in the bottom right corner!"
            });
          }}
          onSave={handleSave}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAddIntent={addNewIntent}
          canUndo={undoRedo.canUndo}
          canRedo={undoRedo.canRedo}
          isConnected={false}
          nodeCount={nodes.length}
        />
        
        {/* Enhanced Secondary header with navigation, project info, and action buttons */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-b bg-gradient-to-r from-background to-muted/30">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover:bg-muted">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Playground - {botName}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Conversation Builder</span>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  {completionPercentage}% Complete
                </Badge>
                <span className="text-xs opacity-75">
                  Auto-saved: {lastSaved.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Beginner Mode Toggle */}
            <BeginnerModeToggle 
              isBeginnerMode={isBeginnerMode}
              onToggle={setIsBeginnerMode}
            />
            {/* Voice Settings Button */}
            <Button
              onClick={() => setShowVoiceSettings(true)}
              variant="outline"
              size="sm"
              className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
            >
              <Mic className="h-4 w-4" />
              Voice
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2"
              variant="default"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Project
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 gap-0 border-t border-border">
          {/* Expanded Full Workspace - Intent panel removed */}
          <div className="flex-[2] lg:border-l lg:border-r border-border bg-background order-2 lg:order-1">
            <div className="h-12 px-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Conversation Flow Builder</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {nodes.length} intents
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {edges.length} connections
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  className="text-xs hover:bg-muted gap-2"
                >
                  <Sparkles className="h-3 w-3" />
                  Templates
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={autoLayoutNodes}
                  className="text-xs hover:bg-muted"
                >
                  <Layout className="h-3 w-3 mr-1" />
                  Auto Layout
                </Button>
              </div>
            </div>
            <div className="h-[calc(100vh-14rem)] relative">
              {/* Empty state with engaging design for kids */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="text-center space-y-6 p-8 max-w-md">
                    <div className="relative">
                      <div className="text-8xl animate-bounce">🤖</div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                        <div className="text-3xl animate-pulse">✨</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Let's Build Your First Chatbot!
                      </h3>
                      <p className="text-muted-foreground">
                        Create conversation flows by adding intents. Each intent teaches your bot what to say when users ask different questions.
                      </p>
                    </div>
                    <Button 
                      onClick={() => addNewIntent()} 
                      className="mt-6 px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create First Intent
                    </Button>
                  </div>
                </div>
              )}
              
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={memoizedNodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3, minZoom: 0.4, maxZoom: 1.0 }}
                minZoom={0.2}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
                panOnScroll={true}
                selectionOnDrag={false}
                panOnDrag={[1, 2]}
                proOptions={{ hideAttribution: true }}
                className="bg-gradient-to-br from-background via-muted/5 to-primary/5"
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                connectionLineStyle={{ 
                  stroke: 'hsl(var(--primary))', 
                  strokeWidth: 3,
                  strokeDasharray: '8,4',
                }}
                snapToGrid={true}
                snapGrid={[25, 25]}
                panOnScrollSpeed={0.8}
                zoomOnScroll={true}
                zoomOnPinch={true}
              >
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={25} 
                  size={2} 
                  color="hsl(var(--muted-foreground) / 0.2)"
                  className="opacity-60"
                />
                <MiniMap 
                  nodeColor={(node) => {
                    if (node.data.isDefault && node.data.label === 'Fallback') return 'hsl(var(--destructive))';
                    if (node.data.isDefault) return 'hsl(var(--primary))';
                    return 'hsl(var(--accent-foreground))';
                  }}
                  className="bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-xl"
                  style={{ width: 180, height: 120 }}
                  position="bottom-right"
                  pannable
                  zoomable
                />
                <Controls 
                  className="bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-xl" 
                  showZoom={true}
                  showFitView={true}
                  showInteractive={true}
                  position="top-left"
                />
              </ReactFlow>
            </div>
          </div>


          {/* Enhanced Right Panel - Real-time Testing - Mobile: Above canvas, Desktop: Right side */}
          <div className="w-full lg:w-96 lg:border-l border-border bg-background order-1 lg:order-2 min-h-[300px] lg:min-h-0">
            <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">Live Testing</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={showTestPanel ? "default" : "secondary"} className="text-xs">
                  {showTestPanel ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-b from-muted/20 to-background">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">🎯 Test Your Bot Instantly</p>
                <div className="flex items-center gap-2 text-xs">
                  <Mic className="h-3 w-3" />  <span>Voice input enabled</span>             
                </div>
              </div>
            </div>
            <div className="h-[calc(100vh-13rem)] border-t">
              <EnhancedTestChatInterface
                nodes={nodes}
                edges={edges}
                botAvatar={botAvatar}
                botName={botName || 'My AI Assistant'}
              />
            </div>
          </div>
        </div>



        {/* Voice Settings Dialog */}
        <Dialog open={showVoiceSettings} onOpenChange={setShowVoiceSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Voice Settings</DialogTitle>
            </DialogHeader>
            <VoiceChatbotSettings />
          </DialogContent>
        </Dialog>


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

        {/* Follow-up Intent Name Dialog - Amby Style */}
        <Dialog open={followUpNameDialog.open} onOpenChange={(open) => setFollowUpNameDialog(prev => ({ ...prev, open }))}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Name Your Follow-Up Intent
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="followup-name" className="text-sm font-medium">
                  What should this intent be called?
                </Label>
                <Input
                  id="followup-name"
                  placeholder="e.g., Order Pizza, Check Weather, Help"
                  value={followUpIntentName}
                  onChange={(e) => setFollowUpIntentName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && followUpIntentName.trim()) {
                      confirmFollowUpIntent();
                    }
                  }}
                  autoFocus
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Choose a clear, descriptive name that explains what this intent will handle.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setFollowUpNameDialog({ open: false, parentId: null })}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmFollowUpIntent}
                disabled={!followUpIntentName.trim()}
                className="bg-gradient-to-r from-primary to-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Intent
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tutorial Manager - Centralized tutorial system */}
        <TutorialManager autoStart={isBeginnerMode} />

        {/* First Time Bot Wizard */}
        <FirstTimeBotWizard
          open={showFirstTimeWizard}
          onOpenChange={setShowFirstTimeWizard}
          onComplete={(botData) => {
            setBotName(botData.name);
            setBotDescription(botData.description);
            updateAvatarAndPersonality('🤖', botData.personality);
            
            // Create nodes based on wizard data
            const greetNode = {
              id: 'greet',
              type: 'intent',
              position: { x: 300, y: 100 },
              data: {
                label: 'Greet',
                trainingPhrases: [botData.firstIntent, 'hello', 'hi', 'hey there'],
                responses: [botData.responses[0]],
                isDefault: true,
              },
            };
            
            setNodes([greetNode, ...initialNodes.slice(1)]);
            localStorage.setItem('hasBuiltFirstBot', 'true');
            
            toast({
              title: `🎉 ${botData.name} is ready!`,
              description: "Your first chatbot has been created. Start building!"
            });
          }}
        />

        {/* Intent Training Dialog */}
        <IntentTrainingDialog
          open={intentTrainingDialog.open}
          onOpenChange={(open) => setIntentTrainingDialog(prev => ({ ...prev, open }))}
          intentData={intentTrainingDialog.intentData || { id: '', label: '', trainingPhrases: [], responses: [] }}
          onSave={handleIntentTrainingSave}
        />

        {/* Templates Dialog */}
        {showTemplates && (
          <ConversationTemplates
            onSelectTemplate={(template: Template) => {
              // Clear existing nodes except greet and fallback
              const baseNodes = nodes.filter(n => 
                n.data.label === 'Greet' || n.data.label === 'Fallback'
              );
              
              // Create nodes from template
              const templateNodes: Node[] = template.intents.map((intent, index) => {
                const id = `intent-${Date.now()}-${index}`;
                return {
                  id,
                  type: 'intent',
                  position: { 
                    x: 400, 
                    y: 150 + (index * 150) 
                  },
                  data: {
                    label: intent.name,
                    trainingPhrases: intent.trainingPhrases,
                    responses: intent.responses,
                    onTrain: () => openIntentTraining(id),
                    onAddFollowUp: () => handleAddFollowUpIntent(id)
                  }
                };
              });

              // Create edges connecting to greet node
              const greetNode = baseNodes.find(n => n.data.label === 'Greet');
              const templateEdges: Edge[] = greetNode ? templateNodes.map((node) => ({
                id: `edge-greet-${node.id}`,
                source: greetNode.id,
                target: node.id,
                type: 'smoothstep',
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
              })) : [];

              setNodes([...baseNodes, ...templateNodes]);
              setEdges([
                ...edges.filter(e => {
                  const sourceNode = baseNodes.find(n => n.id === e.source);
                  const targetNode = baseNodes.find(n => n.id === e.target);
                  return sourceNode && targetNode;
                }),
                ...templateEdges
              ]);

              toast({
                title: "Template applied!",
                description: `${template.name} loaded with ${template.intents.length} intents. You can now customize and test it!`
              });
            }}
            onClose={() => setShowTemplates(false)}
          />
        )}
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default SimplifiedBotBuilder;
