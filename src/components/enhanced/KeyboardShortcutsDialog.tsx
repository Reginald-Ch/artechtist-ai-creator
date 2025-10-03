import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsDialog = ({ open, onOpenChange }: KeyboardShortcutsDialogProps) => {
  const shortcuts = [
    { key: '→', description: 'Next panel' },
    { key: '←', description: 'Previous panel' },
    { key: 'Space', description: 'Next panel' },
    { key: 'S', description: 'Play/Pause audio' },
    { key: 'B', description: 'Toggle bookmark' },
    { key: 'Esc', description: 'Back to lessons' },
    { key: '?', description: 'Show this dialog' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Use these shortcuts to navigate lessons faster
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {shortcuts.map(({ key, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{description}</span>
                  <Badge variant="outline" className="font-mono">
                    {key}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
