import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, CheckCircle, AlertCircle, Loader2, Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AutoGoogleAssistantIntegrationProps {
  botName: string;
  nodes: any[];
  edges: any[];
  voiceSettings: any;
  onDeploymentComplete?: (connectionKey: string) => void;
}

export const AutoGoogleAssistantIntegration = ({ 
  botName, 
  nodes, 
  edges, 
  voiceSettings,
  onDeploymentComplete 
}: AutoGoogleAssistantIntegrationProps) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [connectionKey, setConnectionKey] = useState<string>('');

  const convertToGoogleActionsFormat = () => {
    // Convert kid-friendly intents to Google Actions format
    const actions = nodes.map(node => ({
      name: node.data.intent || `intent_${node.id}`,
      description: node.data.description || `Intent for ${node.data.label}`,
      trainingPhrases: node.data.trainingPhrases || [node.data.label],
      responses: node.data.responses || [`I heard you say something about ${node.data.label}`],
      parameters: node.data.parameters || []
    }));

    const invocationName = botName.toLowerCase().replace(/\s+/g, '_');

    return {
      invocationName,
      actions,
      voiceSettings: {
        pitch: voiceSettings.pitch || 0,
        speakingRate: voiceSettings.speakingRate || 1,
        voiceGender: voiceSettings.gender || 'NEUTRAL'
      }
    };
  };

  const deployToGoogleAssistant = async () => {
    if (!botName.trim()) {
      toast({
        title: "Bot name required",
        description: "Please give your bot a name before deploying",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus('processing');

    try {
      const actionsConfig = convertToGoogleActionsFormat();
      
      // Deploy via Supabase edge function
      const { data, error } = await supabase.functions.invoke('deploy-google-assistant', {
        body: {
          actionsConfig,
          voiceSettings,
          actionSettings: {
            invocationName: actionsConfig.invocationName,
            displayName: botName
          },
          botNodes: nodes,
          botEdges: edges
        }
      });

      if (error) throw error;

      if (data.success) {
        setDeploymentStatus('success');
        setConnectionKey(data.connectionKey);
        onDeploymentComplete?.(data.connectionKey);
        
        toast({
          title: "🎉 Deployed to Google Assistant!",
          description: `Try saying: "Hey Google, talk to test version of ${botName}"`
        });
      } else {
        throw new Error(data.message || 'Deployment failed');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentStatus('error');
      toast({
        title: "Deployment failed",
        description: "Failed to deploy to Google Assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const testVoiceCommand = () => {
    if (connectionKey) {
      // Simulate voice test
      toast({
        title: "🎤 Voice Test",
        description: `Say: "Hey Google, talk to test version of ${botName}"`
      });
    }
  };

  return (
    <div className="w-full">
      <div className="text-xs text-muted-foreground mb-2">
        <p>Auto-deploy to Google Assistant test environment</p>
      </div>

      {/* Compact Bot Summary */}
      <div className="bg-muted p-2 rounded text-xs mb-3">
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">{nodes.length} intents</Badge>
          <Badge variant="outline" className="text-xs">{edges.length} flows</Badge>
        </div>
      </div>

      {/* Compact Deployment Button */}
      <Button 
        onClick={deployToGoogleAssistant}
        disabled={isDeploying}
        size="sm"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        {isDeploying ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Deploying...
          </>
        ) : (
          <>
            <Radio className="mr-1 h-3 w-3" />
            Deploy to Google Assistant
          </>
        )}
      </Button>

      {/* Compact Status Display */}
      {deploymentStatus !== 'idle' && (
        <div className={`p-2 rounded mt-3 text-xs ${
          deploymentStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
          deploymentStatus === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
          'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center gap-1">
            {deploymentStatus === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
            {deploymentStatus === 'success' && <CheckCircle className="h-3 w-3" />}
            {deploymentStatus === 'error' && <AlertCircle className="h-3 w-3" />}
            
            <span className="font-medium">
              {deploymentStatus === 'processing' && 'Deploying...'}
              {deploymentStatus === 'success' && 'Deployed!'}
              {deploymentStatus === 'error' && 'Failed'}
            </span>
          </div>
          
          {deploymentStatus === 'success' && (
            <div className="mt-2">
              <div className="bg-white p-2 rounded border text-xs">
                <code>
                  "Hey Google, talk to test version of {botName}"
                </code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};