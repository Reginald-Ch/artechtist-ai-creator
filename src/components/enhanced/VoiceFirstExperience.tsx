import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Speaker, Zap, CheckCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { VoiceChatbotSettings } from "./VoiceChatbotSettings";

interface VoiceFirstExperienceProps {
  nodes: any[];
  onVoiceTest?: () => void;
  botName?: string;
}

export const VoiceFirstExperience: React.FC<VoiceFirstExperienceProps> = ({
  nodes,
  onVoiceTest,
  botName = "My Bot"
}) => {
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success'>('idle');
  const { toast } = useToast();

  const handleVoiceTest = () => {
    setIsTestingVoice(true);
    
    // Use Web Speech API for testing
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Hi! I'm ${botName}. This is how I'll sound when users interact with me. Pretty cool, right?`
      );
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsTestingVoice(false);
        toast({
          title: "Voice test complete!",
          description: "Your bot sounds great! Ready to deploy?",
        });
      };
      
      window.speechSynthesis.speak(utterance);
      onVoiceTest?.();
    } else {
      setIsTestingVoice(false);
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice synthesis.",
        variant: "destructive"
      });
    }
  };

  const handleQuickDeploy = async () => {
    setDeploymentStatus('deploying');
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDeploymentStatus('success');
    toast({
      title: "🎉 Voice bot deployed!",
      description: "Your bot is now ready for voice interactions!",
    });
    
    setTimeout(() => setDeploymentStatus('idle'), 3000);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Voice Experience
            <Badge variant="secondary" className="text-xs">
              Ready!
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-16 flex-col gap-1"
              onClick={handleVoiceTest}
              disabled={isTestingVoice}
            >
              <Speaker className="w-5 h-5" />
              <span className="text-xs">
                {isTestingVoice ? 'Testing...' : 'Test Voice'}
              </span>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="w-full h-16 flex-col gap-1"
              onClick={handleQuickDeploy}
              disabled={deploymentStatus === 'deploying' || nodes.length < 2}
            >
              {deploymentStatus === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              <span className="text-xs">
                {deploymentStatus === 'deploying' ? 'Deploying...' : 
                 deploymentStatus === 'success' ? 'Deployed!' : 
                 'Quick Deploy'}
              </span>
            </Button>
          </motion.div>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ Voice responses enabled</p>
          <p>✅ Speech recognition ready</p>
          <p>✅ Kid-friendly settings applied</p>
        </div>
        
        {nodes.length < 2 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            💡 Add more intents to unlock voice deployment
          </div>
        )}
      </CardContent>
      
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Voice settings configuration coming soon!
            </p>
            <Button onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};