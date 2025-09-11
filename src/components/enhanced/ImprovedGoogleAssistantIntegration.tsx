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
    // Convert bot nodes/edges to Google Actions format with proper AMBY-style structure
    const intents = nodes
      .filter(node => node.type === 'intent')
      .map(node => ({
        name: node.data.label || 'Default Intent',
        trainingPhrases: node.data.trainingPhrases || ['hello', 'hi', 'start'],
        responses: node.data.responses || ['Hello! How can I help you?'],
        parameters: node.data.parameters || [],
        context: node.data.context || [],
        followUpIntents: edges
          .filter(edge => edge.source === node.id)
          .map(edge => {
            const targetNode = nodes.find(n => n.id === edge.target);
            return targetNode ? targetNode.data.label : 'Unknown';
          })
      }));

    const actions = {
      projectId: `amby-test-${Date.now()}`,
      invocationName: actionSettings.invocationName,
      locale: actionSettings.voiceLanguage,
      category: 'EDUCATION',
      surface: ['PHONE', 'SMART_DISPLAY', 'SMART_SPEAKER'],
      intents,
      conversationFlow: {
        welcome: {
          prompt: `Hi! I'm ${selectedAvatar}, your ${botPersonality} assistant created by a young African innovator. How can I help you today?`,
          suggestions: intents.slice(0, 3).map(i => i.name)
        },
        fallback: {
          prompt: "I'm sorry, I didn't understand that. Could you try rephrasing?",
          suggestions: ['help', 'start over', 'what can you do']
        },
        goodbye: {
          prompt: "Goodbye! Thanks for chatting with me. Keep building amazing things!"
        }
      },
      voice: {
        gender: voiceSettings?.gender || 'FEMALE',
        language: voiceSettings?.language || 'en-US',
        speed: voiceSettings?.speed || 1.0,
        pitch: voiceSettings?.pitch || 0,
        style: 'conversational'
      },
      testingConfig: {
        enableSandbox: actionSettings.testMode,
        testPhrase: `talk to test version of ${actionSettings.invocationName}`,
        releaseChannel: 'ALPHA'
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
      
      {/* Enhanced Settings Modal with proper z-index */}
      {deploymentState === 'idle' && (
        <div className="relative group">
          <div className="hidden group-hover:block absolute top-full right-0 mt-2 p-4 bg-popover border rounded-lg shadow-lg z-[100] min-w-80">
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="font-semibold text-sm">Google Assistant Setup</h4>
                <p className="text-xs text-muted-foreground">Deploy your bot to Google Assistant for voice interaction</p>
              </div>
              
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
                  Users will say: "Hey Google, talk to test version of {actionSettings.invocationName}"
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="test-mode">Sandbox Mode</Label>
                    <p className="text-xs text-muted-foreground">Deploy to test environment first</p>
                  </div>
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
                  <div>
                    <Label htmlFor="parental">Family-Friendly</Label>
                    <p className="text-xs text-muted-foreground">Enable parental controls</p>
                  </div>
                  <Switch
                    id="parental"
                    checked={actionSettings.parentalControls}
                    onCheckedChange={(checked) => setActionSettings(prev => ({
                      ...prev,
                      parentalControls: checked
                    }))}
                  />
                </div>
              </div>
              
              <Button 
                onClick={deployToGoogleAssistant} 
                className="w-full"
                disabled={!actionSettings.invocationName.trim()}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Deploy to Google Assistant
              </Button>
              
              <div className="text-xs text-muted-foreground border-t pt-2">
                <strong>What happens next:</strong>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Bot deployed to Google Actions Console</li>
                  <li>Test command generated for voice testing</li>
                  <li>Available on all Google Assistant devices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedGoogleAssistantIntegration;