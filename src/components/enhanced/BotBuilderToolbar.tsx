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
  onAddIntent,
  canUndo,
  canRedo,
  isConnected = false,
  nodeCount
}) => {

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
              variant="default" 
              size="sm"
              onClick={onTestBot}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Play className="h-4 w-4 mr-2" />
              Test Chat
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onTutorial}
              className="hover:bg-secondary transition-colors"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Tutorial
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