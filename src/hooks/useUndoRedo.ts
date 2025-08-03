import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

interface UndoRedoHook {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => HistoryState | null;
  redo: () => HistoryState | null;
  saveState: (nodes: Node[], edges: Edge[]) => void;
  clearHistory: () => void;
}

export const useUndoRedo = (
  maxHistorySize: number = 50
): UndoRedoHook => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveState = useCallback((nodes: Node[], edges: Edge[]) => {
    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove any future states if we're in the middle of history
      const truncatedHistory = prev.slice(0, currentIndex + 1);
      
      // Add new state
      const newHistory = [...truncatedHistory, newState];
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }
      
      return newHistory;
    });

    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, maxHistorySize - 1);
      return newIndex;
    });
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    clearHistory,
  };
};