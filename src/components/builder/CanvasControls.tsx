import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Undo, Redo, Layout, Plus, Zap } from "lucide-react";

interface CanvasControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  onAddIntent: () => void;
  onTemplates: () => void;
}

export const CanvasControls = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
  onAddIntent,
  onTemplates
}: CanvasControlsProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8"
              aria-label="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8"
              aria-label="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAutoLayout}
              className="h-8"
              aria-label="Auto-arrange nodes"
            >
              <Layout className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Auto-arrange nodes</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={onAddIntent}
              className="h-8"
              aria-label="Add new intent"
            >
              <Plus className="h-4 w-4 mr-1" />
              Intent
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add new intent</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onTemplates}
              className="h-8"
              aria-label="Load template"
            >
              <Zap className="h-4 w-4 mr-1" />
              Templates
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Load conversation template</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
