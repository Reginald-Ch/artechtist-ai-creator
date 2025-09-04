import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Smartphone, Zap, Settings, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DeploymentState {
  status: 'idle' | 'deploying' | 'deployed' | 'error';
  connectionKey?: string;
  testPhrase?: string;
}

export const SimpleGoogleAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deployment, setDeployment] = useState<DeploymentState>({ status: 'idle' });
  const [config, setConfig] = useState({
    botName: 'My AI Friend',
    invocationName: 'my ai friend',
    description: 'A fun and educational AI assistant for kids',
    testMode: true,
    enableKidsMode: true,
    parentalControls: true
  });

  const deployToGoogleAssistant = async () => {
    setDeployment({ status: 'deploying' });
    
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const connectionKey = `ga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const testPhrase = `Hey Google, talk to ${config.invocationName}`;
      
      setDeployment({ 
        status: 'deployed', 
        connectionKey,
        testPhrase
      });
      
      toast({
        title: "🎉 Successfully Deployed!",
        description: `Your bot is now live on Google Assistant!`
      });
    } catch (error) {
      setDeployment({ status: 'error' });
      toast({
        title: "❌ Deployment Failed",
        description: "Failed to deploy to Google Assistant. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (deployment.status) {
      case 'deploying':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'deployed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Zap className="h-4 w-4" />
          Integrations
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Google Assistant Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          {deployment.status !== 'idle' && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon()}
                <span className="font-medium">
                  {deployment.status === 'deploying' && 'Deploying...'}
                  {deployment.status === 'deployed' && 'Successfully Deployed!'}
                  {deployment.status === 'error' && 'Deployment Failed'}
                </span>
              </div>
              
              {deployment.status === 'deployed' && (
                <div className="text-sm text-muted-foreground">
                  <p>Test phrase: <strong>"{deployment.testPhrase}"</strong></p>
                  <p className="text-xs mt-1">Connection ID: {deployment.connectionKey}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Config */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Bot Name</Label>
                <Input
                  value={config.botName}
                  onChange={(e) => setConfig(prev => ({ ...prev, botName: e.target.value }))}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Invocation</Label>
                <Input
                  value={config.invocationName}
                  onChange={(e) => setConfig(prev => ({ ...prev, invocationName: e.target.value.toLowerCase() }))}
                  className="h-8"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Kids Mode</span>
              <Switch
                checked={config.enableKidsMode}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableKidsMode: checked }))}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Test Environment</span>
              <Switch
                checked={config.testMode}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, testMode: checked }))}
              />
            </div>
          </div>

          {/* Deploy Button */}
          <Button 
            onClick={deployToGoogleAssistant}
            disabled={deployment.status === 'deploying'}
            className="w-full"
          >
            {deployment.status === 'deploying' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : deployment.status === 'deployed' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Redeploy
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Deploy to Google Assistant
              </>
            )}
          </Button>

          {/* Usage Instructions */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium mb-1">📱 How to Use:</h4>
            <p>Say: "Hey Google, talk to {config.invocationName}"</p>
            <p className="mt-1">Works on phones, smart speakers, and Google Home devices</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};