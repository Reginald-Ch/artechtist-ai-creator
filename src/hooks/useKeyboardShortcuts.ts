import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
  onSave?: () => void;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { ctrlKey, metaKey, key, shiftKey } = event;
    const cmdOrCtrl = ctrlKey || metaKey;

    // Prevent shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    switch (true) {
      case key === 'Delete' || key === 'Backspace':
        event.preventDefault();
        config.onDelete?.();
        break;
        
      case cmdOrCtrl && key === 'd':
        event.preventDefault();
        config.onDuplicate?.();
        break;
        
      case cmdOrCtrl && key === 'z' && !shiftKey:
        event.preventDefault();
        config.onUndo?.();
        break;
        
      case cmdOrCtrl && (key === 'y' || (key === 'z' && shiftKey)):
        event.preventDefault();
        config.onRedo?.();
        break;
        
      case cmdOrCtrl && key === 'a':
        event.preventDefault();
        config.onSelectAll?.();
        break;
        
      case cmdOrCtrl && key === 's':
        event.preventDefault();
        config.onSave?.();
        break;
        
      default:
        break;
    }
  }, [config]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};