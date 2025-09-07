import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Undo, 
  Redo, 
  Download, 
  Upload, 
  Play, 
  Book, 
  Save,
  Bot,
  Zap,
  Layout,
  HelpCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EnhancedBotBuilderToolbarProps {
  onAddIntent: () => void;
  onTestBot: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onImport: () => void;
  onExport: () => void;
  onShowTutorial: () => void;
  onAutoLayout: () => void;
  canUndo: boolean;
  canRedo: boolean;
  nodeCount: number;
  isConnected?: boolean;
  isSaving?: boolean;
}

export const EnhancedBotBuilderToolbar = ({
  onAddIntent,
  onTestBot,
  onSave,
  onUndo,
  onRedo,
  onImport,
  onExport,
  onShowTutorial,
  onAutoLayout,
  canUndo,
  canRedo,
  nodeCount,
  isConnected = false,
  isSaving = false
}: EnhancedBotBuilderToolbarProps) => {

  const handleExport = () => {
    onExport();
    toast({
      title: "Project exported",
      description: "Your bot configuration has been downloaded as JSON."
    });
  };

  const handleImport = () => {
    onImport();
    toast({
      title: "Import file",
      description: "Select a JSON file to import your bot configuration."
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-card/80 backdrop-blur-sm border-b shadow-sm">
      {/* Left Section - Core Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onAddIntent}
          size="sm"
          className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Intent</span>
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Undo/Redo */}
        <div className="flex items-center bg-muted/50 rounded-md p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8 p-0 hover:bg-background/80"
            title="Undo"
          >
            <Undo className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8 p-0 hover:bg-background/80"
            title="Redo"
          >
            <Redo className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Import/Export */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="gap-2"
            title="Import Project"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Import</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
            title="Export Project"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Center Section - Bot Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">Intents:</span>
          <Badge variant="outline">{nodeCount}</Badge>
        </div>
        
        {isConnected && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-600 hidden md:inline">Live</span>
          </div>
        )}
      </div>

      {/* Right Section - Testing & Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAutoLayout}
          className="gap-2"
          title="Auto Layout"
        >
          <Layout className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Layout</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onShowTutorial}
          className="gap-2"
          title="Show Tutorial"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Help</span>
        </Button>

        <Separator orientation="vertical" className="h-6" />
        
        <Button
          onClick={onTestBot}
          variant="outline"
          size="sm"
          className="gap-2 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/20"
        >
          <Play className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Test Bot</span>
        </Button>
        
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary shadow-md"
          size="sm"
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? 'Saving...' : <span className="hidden sm:inline">Save</span>}
        </Button>
      </div>
    </div>
  );
};