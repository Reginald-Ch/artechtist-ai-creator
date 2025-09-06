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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Google Assistant Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Automatically convert your chatbot to work with Google Assistant!</p>
          <p className="text-xs mt-1">Your bot will be available in a test environment.</p>
        </div>

        {/* Bot Summary */}
        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-medium">Bot Summary</h4>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{nodes.length} intents</Badge>
            <Badge variant="outline">{edges.length} connections</Badge>
            <Badge variant="outline">Voice: {voiceSettings.gender || 'Neutral'}</Badge>
          </div>
        </div>

        {/* Deployment Button */}
        <Button 
          onClick={deployToGoogleAssistant}
          disabled={isDeploying}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying to Google Assistant...
            </>
          ) : (
            <>
              <Radio className="mr-2 h-4 w-4" />
              Deploy to Google Assistant
            </>
          )}
        </Button>

        {/* Status Display */}
        {deploymentStatus !== 'idle' && (
          <div className={`p-3 rounded-lg border ${
            deploymentStatus === 'success' ? 'bg-green-50 border-green-200' :
            deploymentStatus === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {deploymentStatus === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              {deploymentStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {deploymentStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
              
              <span className="font-medium">
                {deploymentStatus === 'processing' && 'Deploying...'}
                {deploymentStatus === 'success' && 'Successfully Deployed!'}
                {deploymentStatus === 'error' && 'Deployment Failed'}
              </span>
            </div>
            
            {deploymentStatus === 'success' && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-green-700">
                  Your bot is now available on Google Assistant in test mode.
                </p>
                <div className="bg-white p-2 rounded border">
                  <code className="text-sm">
                    "Hey Google, talk to test version of {botName}"
                  </code>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={testVoiceCommand}
                  className="mt-2"
                >
                  <Mic className="mr-2 h-3 w-3" />
                  Test Voice Command
                </Button>
              </div>
            )}
          </div>
        )}

        {/* How it Works */}
        <div className="text-xs text-muted-foreground">
          <h5 className="font-medium mb-1">How it works:</h5>
          <ul className="space-y-1 list-disc list-inside">
            <li>Converts your intents to Google Actions format</li>
            <li>Sets up voice recognition for kids' speech</li>
            <li>Creates a test environment for safe testing</li>
            <li>Enables voice commands through Google Assistant</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};