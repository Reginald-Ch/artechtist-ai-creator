import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Settings, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeginnerModeToggleProps {
  isBeginnerMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export const BeginnerModeToggle: React.FC<BeginnerModeToggleProps> = ({
  isBeginnerMode,
  onToggle
}) => {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    // Show tip on first visit
    const hasSeenTip = localStorage.getItem('hasSeenBeginnerModeTip');
    if (!hasSeenTip) {
      setShowTip(true);
      localStorage.setItem('hasSeenBeginnerModeTip', 'true');
    }
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button
          variant={isBeginnerMode ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(!isBeginnerMode)}
          className="h-8 px-3 text-xs font-medium transition-all duration-200"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {isBeginnerMode ? 'Beginner' : 'Advanced'}
        </Button>
        
        {isBeginnerMode && (
          <Badge variant="secondary" className="text-xs">
            Simplified
          </Badge>
        )}
      </div>

      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-10 left-0 z-50"
          >
            <Card className="w-64 border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs space-y-1">
                    <p className="font-medium text-foreground">
                      New to building bots? 
                    </p>
                    <p className="text-muted-foreground">
                      Try Beginner Mode for a simplified experience!
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs mt-1"
                      onClick={() => setShowTip(false)}
                    >
                      Got it!
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};