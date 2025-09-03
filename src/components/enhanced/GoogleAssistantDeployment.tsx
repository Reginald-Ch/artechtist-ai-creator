import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Radio, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Mic,
  Settings,
  Play,
  Upload
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GoogleAssistantDeploymentProps {
  nodes: any[];
  edges: any[];
  botName?: string;
}

export const GoogleAssistantDeployment: React.FC<GoogleAssistantDeploymentProps> = ({
  nodes,
  edges,
  botName = "My Assistant"
}) => {
  const [deploymentState, setDeploymentState] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [connectionKey, setConnectionKey] = useState<string>('');
  const [settings, setSettings] = useState({
    invocationName: botName.toLowerCase().replace(/\s+/g, ''),
    enableVoice: true,
    enableAudio: true,
    testMode: true,
    parentalControls: true
  });

  const deployToGoogleAssistant = async () => {
    setDeploymentState('deploying');
    
    try {
      // Simulate the AMBY-style one-click deployment
      const response = await fetch('/api/deploy-google-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionsConfig: {
            invocationName: settings.invocationName,
            welcomeIntent: nodes.find(n => n.type === 'intent')?.data,
            enableVoice: settings.enableVoice
          },
          voiceSettings: {
            enableAudio: settings.enableAudio,
            language: 'en-US'
          },
          actionSettings: {
            invocationName: settings.invocationName,
            testMode: settings.testMode,
            parentalControls: settings.parentalControls
          },
          botNodes: nodes,
          botEdges: edges
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setConnectionKey(result.connectionKey);
        setDeploymentState('deployed');
        toast({
          title: "🎉 Deployed Successfully!",
          description: `Your bot is now available on Google Assistant! Try saying: "Hey Google, talk to ${settings.invocationName}"`
        });
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      setDeploymentState('error');
      toast({
        title: "Deployment Failed",
        description: "There was an issue deploying your bot. Please try again.",
        variant: "destructive"
      });
    }
  };

  const testVoiceIntegration = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Hi! I'm ${botName}. I'm now available on Google Assistant!`
      );
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getStatusColor = () => {
    switch (deploymentState) {
      case 'deployed': return 'text-green-600';
      case 'deploying': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (deploymentState) {
      case 'deployed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'deploying': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Radio className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Google Assistant Integration
            <Badge variant="outline" className={getStatusColor()}>
              {deploymentState === 'deployed' ? 'Connected' : 
               deploymentState === 'deploying' ? 'Deploying...' :
               deploymentState === 'error' ? 'Failed' : 'Ready to Deploy'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getStatusIcon()}
            <span>
              {deploymentState === 'deployed' ? 'Your bot is live on Google Assistant!' :
               deploymentState === 'deploying' ? 'Deploying your bot...' :
               deploymentState === 'error' ? 'Deployment failed. Please try again.' :
               'Configure and deploy your bot to Google Assistant'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Bot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invocation">Invocation Name</Label>
            <Input
              id="invocation"
              value={settings.invocationName}
              onChange={(e) => setSettings(prev => ({ ...prev, invocationName: e.target.value }))}
              placeholder="e.g., my awesome bot"
              disabled={deploymentState === 'deployed'}
            />
            <p className="text-xs text-muted-foreground">
              Users will say: "Hey Google, talk to {settings.invocationName}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice">Enable Voice</Label>
              <Switch
                id="voice"
                checked={settings.enableVoice}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableVoice: checked }))}
                disabled={deploymentState === 'deployed'}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="audio">Enable Audio</Label>
              <Switch
                id="audio"
                checked={settings.enableAudio}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAudio: checked }))}
                disabled={deploymentState === 'deployed'}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="test">Test Mode</Label>
              <Switch
                id="test"
                checked={settings.testMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, testMode: checked }))}
                disabled={deploymentState === 'deployed'}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="parental">Parental Controls</Label>
              <Switch
                id="parental"
                checked={settings.parentalControls}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, parentalControls: checked }))}
                disabled={deploymentState === 'deployed'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Deploy Your Bot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={deployToGoogleAssistant}
              disabled={deploymentState === 'deploying' || deploymentState === 'deployed'}
              className="flex-1"
            >
              {deploymentState === 'deploying' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deploying...
                </>
              ) : deploymentState === 'deployed' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Deployed
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Deploy to Google Assistant
                </>
              )}
            </Button>

            {deploymentState === 'deployed' && (
              <Button variant="outline" onClick={testVoiceIntegration}>
                <Play className="h-4 w-4 mr-2" />
                Test Voice
              </Button>
            )}
          </div>

          {deploymentState === 'deployed' && connectionKey && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                🎉 Success! Your bot is now live!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Try it out by saying: "Hey Google, talk to {settings.invocationName}"
              </p>
              <div className="space-y-2">
                <p className="text-xs text-green-600 dark:text-green-400">
                  Connection ID: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">{connectionKey}</code>
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Mode: {settings.testMode ? 'Test (only you can access)' : 'Public (everyone can access)'}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground">How to use:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Configure your bot settings above</li>
              <li>Click "Deploy to Google Assistant"</li>
              <li>Wait for deployment to complete</li>
              <li>Test with your Google Home or phone</li>
              <li>Say: "Hey Google, talk to {settings.invocationName}"</li>
            </ol>
          </div>

          {/* Safety Notice */}
          {settings.parentalControls && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                🛡️ <strong>Safety First:</strong> Parental controls are enabled. This bot includes content filtering and safety measures for young users.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};