import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Speaker, ExternalLink, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImprovedGoogleAssistantIntegrationProps {
  botName: string;
  nodes: any[];
  edges: any[];
  voiceSettings?: any;
  onDeploymentComplete?: (connectionKey: string) => void;
}

export const ImprovedGoogleAssistantIntegration = ({ 
  botName, 
  nodes, 
  edges, 
  voiceSettings,
  onDeploymentComplete 
}: ImprovedGoogleAssistantIntegrationProps) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentState, setDeploymentState] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [connectionKey, setConnectionKey] = useState<string>('');
  const [actionSettings, setActionSettings] = useState({
    invocationName: botName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim(),
    testMode: true,
    parentalControls: true,
    voiceLanguage: 'en-US'
  });

  const convertToGoogleActionsFormat = () => {
    const intents = nodes.map(node => ({
      name: node.data.label,
      trainingPhrases: node.data.trainingPhrases || [],
      responses: node.data.responses || [],
      isDefault: node.data.isDefault || false
    }));

    const actions = {
      intents,
      flows: edges.map(edge => ({
        from: edge.source,
        to: edge.target,
        condition: edge.data?.condition || 'default'
      })),
      settings: {
        invocationName: actionSettings.invocationName,
        testMode: actionSettings.testMode,
        parentalControls: actionSettings.parentalControls,
        voiceLanguage: actionSettings.voiceLanguage
      }
    };

    return actions;
  };

  const deployToGoogleAssistant = async () => {
    if (!actionSettings.invocationName.trim()) {
      toast({
        title: "Missing invocation name",
        description: "Please enter an invocation name for your Google Assistant action",
        variant: "destructive"
      });
      return;
    }

    if (nodes.length === 0) {
      toast({
        title: "No intents to deploy",
        description: "Please add at least one intent before deploying",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentState('deploying');

    try {
      const actionsConfig = convertToGoogleActionsFormat();
      
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

      setDeploymentState('deployed');
      setConnectionKey(data.connectionKey);
      
      toast({
        title: "🎉 Successfully deployed to Google Assistant!",
        description: `Your bot "${botName}" is now available for testing`
      });

      onDeploymentComplete?.(data.connectionKey);
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentState('error');
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "Failed to deploy to Google Assistant",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const testVoiceCommand = () => {
    toast({
      title: "Test your bot",
      description: `Say: "Hey Google, talk to test version of ${actionSettings.invocationName}"`
    });
  };

  const getStatusColor = () => {
    switch (deploymentState) {
      case 'deployed': return 'text-green-600 dark:text-green-400';
      case 'deploying': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (deploymentState) {
      case 'deployed': return <CheckCircle className="h-4 w-4" />;
      case 'deploying': return <Clock className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Speaker className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={getStatusColor()}>
            Google Assistant Integration
          </span>
          {deploymentState === 'deployed' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bot Summary */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium">{nodes.length}</div>
            <div className="text-xs text-muted-foreground">Intents</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{edges.length}</div>
            <div className="text-xs text-muted-foreground">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{voiceSettings?.language || 'en-US'}</div>
            <div className="text-xs text-muted-foreground">Language</div>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="invocation" className="text-sm font-medium">
              Invocation Name
            </Label>
            <Input
              id="invocation"
              value={actionSettings.invocationName}
              onChange={(e) => setActionSettings(prev => ({ ...prev, invocationName: e.target.value }))}
              placeholder="my awesome bot"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Users will say: "Hey Google, talk to {actionSettings.invocationName}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="test-mode" className="text-sm">Test Mode</Label>
              <Switch
                id="test-mode"
                checked={actionSettings.testMode}
                onCheckedChange={(checked) => setActionSettings(prev => ({ ...prev, testMode: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="parental" className="text-sm">Kid-Safe</Label>
              <Switch
                id="parental"
                checked={actionSettings.parentalControls}
                onCheckedChange={(checked) => setActionSettings(prev => ({ ...prev, parentalControls: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Deploy Button */}
        <Button 
          onClick={deployToGoogleAssistant}
          disabled={isDeploying}
          className="w-full"
          size="lg"
        >
          {isDeploying ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
              Deploying to Google...
            </>
          ) : deploymentState === 'deployed' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Redeploy Bot
            </>
          ) : (
            <>
              <Speaker className="h-4 w-4 mr-2" />
              Deploy to Google Assistant
            </>
          )}
        </Button>

        {/* Success State */}
        {deploymentState === 'deployed' && (
          <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Successfully deployed!
              </span>
            </div>
            
            <div className="text-sm text-green-700 dark:text-green-300">
              <strong>Connection ID:</strong> {connectionKey}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-800 dark:text-green-200">
                Test your bot:
              </h4>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-700">
                <code className="text-sm">
                  "Hey Google, talk to test version of {actionSettings.invocationName}"
                </code>
              </div>
            </div>
            
            <Button
              onClick={testVoiceCommand}
              variant="outline"
              size="sm"
              className="border-green-300 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900/30"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test Voice Command
            </Button>
          </div>
        )}

        {/* Safety Notice */}
        {actionSettings.parentalControls && (
          <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
            🛡️ <strong>Kid-Safe Mode:</strong> Your bot follows child safety guidelines and content policies
          </div>
        )}
      </CardContent>
    </Card>
  );
};