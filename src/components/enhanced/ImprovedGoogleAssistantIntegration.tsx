import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Cloud, CheckCircle, AlertCircle, Loader2, ExternalLink, Mic } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImprovedGoogleAssistantIntegrationProps {
  nodes: Node[];
  edges: Edge[];
  voiceSettings?: any;
  selectedAvatar?: string;
  botPersonality?: string;
  onDeploymentComplete?: (status: 'deployed' | 'failed') => void;
}

type DeploymentState = 'idle' | 'deploying' | 'deployed' | 'error';

export const ImprovedGoogleAssistantIntegration: React.FC<ImprovedGoogleAssistantIntegrationProps> = ({
  nodes,
  edges,
  voiceSettings,
  selectedAvatar = '🤖',
  botPersonality = 'friendly and helpful',
  onDeploymentComplete
}) => {
  const [deploymentState, setDeploymentState] = useState<DeploymentState>('idle');
  const [connectionKey, setConnectionKey] = useState<string>('');
  const [actionSettings, setActionSettings] = useState({
    invocationName: '',
    testMode: true,
    parentalControls: false,
    voiceLanguage: voiceSettings?.language || 'en-US'
  });
  
  const { toast } = useToast();

  const convertToGoogleActionsFormat = () => {
    // Convert bot nodes/edges to Google Actions format
    const intents = nodes
      .filter(node => node.type === 'intent')
      .map(node => ({
        name: node.data.label || 'Default Intent',
        trainingPhrases: node.data.phrases || ['hello', 'hi', 'start'],
        response: node.data.response || 'Hello! How can I help you?',
        parameters: node.data.parameters || [],
        context: node.data.context || []
      }));

    const actions = {
      projectId: `test-${Date.now()}`,
      invocationName: actionSettings.invocationName,
      locale: actionSettings.voiceLanguage,
      category: 'EDUCATION',
      surfaceSupport: ['PHONE', 'SMART_DISPLAY'],
      intents,
      responses: {
        welcome: `Hi! I'm ${selectedAvatar}, your ${botPersonality} assistant. How can I help you today?`,
        fallback: "I'm sorry, I didn't understand that. Could you try rephrasing?",
        goodbye: "Goodbye! Thanks for chatting with me!"
      },
      voice: {
        gender: voiceSettings?.gender || 'FEMALE',
        language: voiceSettings?.language || 'en-US',
        speed: voiceSettings?.speed || 1.0,
        pitch: voiceSettings?.pitch || 0
      }
    };

    return actions;
  };

  const deployToGoogleAssistant = async () => {
    if (!actionSettings.invocationName.trim()) {
      toast({
        title: "Missing invocation name",
        description: "Please enter a name for your Google Assistant action",
        variant: "destructive"
      });
      return;
    }

    if (nodes.length === 0) {
      toast({
        title: "No intents found",
        description: "Add at least one intent before deploying",
        variant: "destructive"
      });
      return;
    }

    setDeploymentState('deploying');

    try {
      const actionsConfig = convertToGoogleActionsFormat();
      
      // Call our Supabase edge function for deployment
      const { data, error } = await supabase.functions.invoke('deploy-google-assistant', {
        body: {
          actionsConfig,
          voiceSettings,
          actionSettings,
          botNodes: nodes,
          botEdges: edges
        }
      });

      if (error) throw error;

      if (data.success) {
        setConnectionKey(data.connectionKey);
        setDeploymentState('deployed');
        onDeploymentComplete?.('deployed');
        
        toast({
          title: "🎉 Successfully deployed!",
          description: `Your bot is now available on Google Assistant. Try saying: "Hey Google, talk to test version of ${actionSettings.invocationName}"`
        });
      } else {
        throw new Error(data.message || 'Deployment failed');
      }
    } catch (error: any) {
      console.error('Deployment error:', error);
      setDeploymentState('error');
      onDeploymentComplete?.('failed');
      
      toast({
        title: "Deployment failed",
        description: error.message || "Failed to deploy to Google Assistant. Please try again.",
        variant: "destructive"
      });
    }
  };

  const testVoiceCommand = () => {
    toast({
      title: "Test your Google Assistant bot",
      description: `Try saying: "Hey Google, talk to test version of ${actionSettings.invocationName}"`,
    });
  };

  const getStatusColor = () => {
    switch (deploymentState) {
      case 'deployed': return 'text-green-600';
      case 'deploying': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (deploymentState) {
      case 'deployed': return <CheckCircle className="h-4 w-4" />;
      case 'deploying': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Cloud className="h-4 w-4" />;
    }
  };

  if (deploymentState === 'deployed') {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-700">Google Assistant Live!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-sm font-medium mb-1">Test Command:</p>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              "Hey Google, talk to test version of {actionSettings.invocationName}"
            </code>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={testVoiceCommand}>
              <Mic className="h-4 w-4 mr-1" />
              Test Voice
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDeploymentState('idle')}>
              Redeploy
            </Button>
          </div>
          {connectionKey && (
            <div className="text-xs text-muted-foreground">
              Connection ID: {connectionKey}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={deploymentState === 'idle' ? deployToGoogleAssistant : undefined}
        disabled={deploymentState === 'deploying'}
        className="gap-2 whitespace-nowrap"
      >
        {getStatusIcon()}
        {deploymentState === 'deploying' ? 'Deploying...' : 'Google Assistant'}
      </Button>
      
      {/* Quick Settings Modal - shown on first click */}
      {deploymentState === 'idle' && (
        <div className="hidden group-hover:block absolute top-full mt-2 p-4 bg-popover border rounded-lg shadow-lg z-50 min-w-80">
          <div className="space-y-4">
            <div>
              <Label htmlFor="invocation">Action Name*</Label>
              <Input
                id="invocation"
                placeholder="my awesome bot"
                value={actionSettings.invocationName}
                onChange={(e) => setActionSettings(prev => ({
                  ...prev,
                  invocationName: e.target.value
                }))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Users will say: "Hey Google, talk to {actionSettings.invocationName}"
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="test-mode">Test Mode</Label>
              <Switch
                id="test-mode"
                checked={actionSettings.testMode}
                onCheckedChange={(checked) => setActionSettings(prev => ({
                  ...prev,
                  testMode: checked
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="parental">Parental Controls</Label>
              <Switch
                id="parental"
                checked={actionSettings.parentalControls}
                onCheckedChange={(checked) => setActionSettings(prev => ({
                  ...prev,
                  parentalControls: checked
                }))}
              />
            </div>
            
            <Button 
              onClick={deployToGoogleAssistant} 
              className="w-full"
              disabled={!actionSettings.invocationName.trim()}
            >
              Deploy to Google Assistant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedGoogleAssistantIntegration;