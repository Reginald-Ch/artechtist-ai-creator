import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface AvatarData {
  avatar: string;
  personality: string;
  timestamp: number;
}

const STORAGE_KEY = 'bot-avatar-selection';
const PERSONALITY_KEY = 'bot-personality';

export const useAvatarPersistence = (initialAvatar: string = '🤖', initialPersonality: string = 'helpful and friendly') => {
  const [avatar, setAvatar] = useState<string>(initialAvatar);
  const [personality, setPersonality] = useState<string>(initialPersonality);

  // Load saved avatar and personality on mount
  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem(STORAGE_KEY);
      const savedPersonality = localStorage.getItem(PERSONALITY_KEY);
      
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
      if (savedPersonality) {
        setPersonality(savedPersonality);
      }
    } catch (error) {
      console.error('Failed to load avatar from localStorage:', error);
    }
  }, []);

  // Save avatar and personality to localStorage
  const saveAvatar = useCallback((newAvatar: string, newPersonality?: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, newAvatar);
      setAvatar(newAvatar);
      
      if (newPersonality) {
        localStorage.setItem(PERSONALITY_KEY, newPersonality);
        setPersonality(newPersonality);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save avatar to localStorage:', error);
      toast({
        title: "Failed to save avatar",
        description: "There was an error saving your avatar selection",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  // Update both avatar and personality
  const updateAvatarAndPersonality = useCallback((newAvatar: string, newPersonality: string) => {
    return saveAvatar(newAvatar, newPersonality);
  }, [saveAvatar]);

  return {
    avatar,
    personality,
    saveAvatar,
    updateAvatarAndPersonality,
  };
};
