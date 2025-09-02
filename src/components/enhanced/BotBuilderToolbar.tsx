import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Download, 
  Upload, 
  Play, 
  Settings, 
  Zap, 
  Globe,
  MessageSquare,
  Brain,
  Mic,
  Volume2,
  HelpCircle,
  Undo,
  Redo,
  Copy,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BotBuilderToolbarProps {
  onTestBot: () => void;
  onTutorial: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onAddIntent: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isConnected?: boolean;
  nodeCount: number;
}

export const BotBuilderToolbar: React.FC<BotBuilderToolbarProps> = ({
  onTestBot,
  onTutorial,
  onSave,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onAddIntent,
  canUndo,
  canRedo,
  isConnected = false,
  nodeCount
}) => {
  const handleExport = () => {
    onExport();
    toast({
      title: "Bot Configuration Exported",
      description: "Your bot has been saved to downloads",
    });
  };

  const handleImport = () => {
    onImport();
    toast({
      title: "Import Bot Configuration",
      description: "Select a configuration file to load",
    });
  };

  return (
    <div className="glassmorphism border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Core Actions */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={onAddIntent}
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Intent
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="hover:bg-muted transition-colors"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="hover:bg-muted transition-colors"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                title="Export bot configuration"
                className="hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleImport}
                title="Import bot configuration"
                className="hover:bg-muted transition-colors"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
          </div>

          {/* Center Section - Bot Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" />
              <span>{nodeCount} Intents</span>
            </div>
            {isConnected && (
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                <Globe className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
          </div>

          {/* Right Section - Test & Settings */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onTestBot}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              Test Bot
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://docs.elevenlabs.io', '_blank')}
              className="hover:bg-secondary transition-colors"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
            
            <Button 
              size="sm" 
              onClick={onSave}
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};