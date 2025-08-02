import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, MessageCircle, Lightbulb, Star } from 'lucide-react';

interface AIMascotProps {
  emotion?: 'happy' | 'thinking' | 'excited' | 'explaining' | 'surprised';
  message?: string;
  showTip?: boolean;
  learningLevel?: number;
  isInteracting?: boolean;
  onInteraction?: () => void;
}

export const AIMascot = ({ 
  emotion = 'happy', 
  message, 
  showTip = false, 
  learningLevel = 0,
  isInteracting = false,
  onInteraction 
}: AIMascotProps) => {
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  const getMascotAppearance = () => {
    switch (currentEmotion) {
      case 'thinking':
        return {
          face: '🤔',
          body: '🟦',
          accent: 'border-blue-400 bg-blue-50 dark:bg-blue-950/20',
          glow: 'shadow-blue-400/30'
        };
      case 'excited':
        return {
          face: '🤩',
          body: '🟨',
          accent: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20',
          glow: 'shadow-yellow-400/30'
        };
      case 'explaining':
        return {
          face: '🧠',
          body: '🟪',
          accent: 'border-purple-400 bg-purple-50 dark:bg-purple-950/20',
          glow: 'shadow-purple-400/30'
        };
      case 'surprised':
        return {
          face: '😮',
          body: '🟧',
          accent: 'border-orange-400 bg-orange-50 dark:bg-orange-950/20',
          glow: 'shadow-orange-400/30'
        };
      default: // happy
        return {
          face: '😊',
          body: '🟩',
          accent: 'border-green-400 bg-green-50 dark:bg-green-950/20',
          glow: 'shadow-green-400/30'
        };
    }
  };

  const appearance = getMascotAppearance();

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    onInteraction?.();
  };

  const getLearningBadge = () => {
    if (learningLevel < 20) return { text: 'Learning', color: 'bg-blue-500', icon: Brain };
    if (learningLevel < 50) return { text: 'Growing', color: 'bg-green-500', icon: Sparkles };
    if (learningLevel < 80) return { text: 'Smart', color: 'bg-purple-500', icon: Lightbulb };
    return { text: 'Genius', color: 'bg-yellow-500', icon: Star };
  };

  const badge = getLearningBadge();

  return (
    <Card className={`${appearance.accent} border-2 ${appearance.glow} shadow-lg transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'} ${isInteracting ? 'animate-pulse' : ''}`}>
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          {/* Mascot Character */}
          <div 
            className={`relative inline-block cursor-pointer transition-transform duration-300 ${isAnimating ? 'animate-bounce' : 'hover:scale-110'}`}
            onClick={handleClick}
          >
            {/* Body */}
            <div className="text-6xl mb-2">
              {appearance.body}
            </div>
            
            {/* Face */}
            <div className="text-4xl absolute -top-2 left-1/2 transform -translate-x-1/2">
              {appearance.face}
            </div>
            
            {/* Learning Level Badge */}
            <div className="absolute -top-1 -right-1">
              <Badge className={`${badge.color} text-white text-xs px-1 py-0.5 flex items-center gap-1`}>
                <badge.icon className="h-3 w-3" />
                {badge.text}
              </Badge>
            </div>
            
            {/* AI Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-sm -z-10 animate-pulse"></div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">Kesi AI</h3>
            <p className="text-xs text-muted-foreground">Your Comic Hero Guide</p>
          </div>

          {/* Learning Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Learning Progress</span>
              <span>{learningLevel}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${badge.color}`}
                style={{ width: `${learningLevel}%` }}
              ></div>
            </div>
          </div>

          {/* Message Bubble */}
          {message && (
            <div className="relative bg-background border rounded-lg p-3 text-sm">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-border"></div>
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground leading-relaxed">{message}</p>
              </div>
            </div>
          )}

          {/* Interactive Tip */}
          {showTip && (
            <div className="bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-2">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3 w-3 text-cyan-500" />
                <span className="text-cyan-700 dark:text-cyan-300">Click me to learn more!</span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {onInteraction && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClick}
              className="w-full text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Ask Kesi
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};