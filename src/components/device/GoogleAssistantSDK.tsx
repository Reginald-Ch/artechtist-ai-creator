import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Speaker, 
  Monitor, 
  Cloud, 
  CheckCircle, 
  AlertCircle,
  Play,
  Settings,
  Upload,
  Download,
  Mic,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoogleAssistantSDKProps {
  botData: {
    name: string;
    nodes: any[];
    responses: string[];
  };
  onDeploy: () => void;
  className?: string;
}

export const GoogleAssistantSDK = ({ botData, onDeploy, className }: GoogleAssistantSDKProps) => {
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [deploymentState, setDeploymentState] = useState<'idle' | 'preparing' | 'uploading' | 'testing' | 'deployed'>('idle');
  const [projectId, setProjectId] = useState('');
  const [invocationName, setInvocationName] = useState(botData.name.toLowerCase().replace(/\s+/g, ''));
  const [testingDevice, setTestingDevice] = useState<'mobile' | 'speaker' | 'web' | null>(null);
  
  const compatibilityChecks = [
    {
      id: 'intents',
      name: 'Intent Structure',
      status: botData.nodes.length >= 2 ? 'pass' : 'fail',
      message: botData.nodes.length >= 2 ? 'Good intent coverage' : 'Need at least 2 intents'
    },
    {
      id: 'responses',
      name: 'Response Quality',
      status: botData.responses.length >= 3 ? 'pass' : 'warning',
      message: botData.responses.length >= 3 ? 'Sufficient responses' : 'Add more response variations'
    },
    {
      id: 'invocation',
      name: 'Invocation Name',
      status: invocationName.length >= 3 ? 'pass' : 'fail',
      message: invocationName.length >= 3 ? 'Valid invocation name' : 'Name too short'
    },
    {
      id: 'project',
      name: 'Google Cloud Project',
      status: projectId.length > 0 ? 'pass' : 'fail',
      message: projectId.length > 0 ? 'Project ID configured' : 'Project ID required'
    }
  ];

  const overallScore = Math.round((compatibilityChecks.filter(check => check.status === 'pass').length / compatibilityChecks.length) * 100);

  const handleConnect = useCallback(async () => {
    try {
      // Simulate Google OAuth flow
      setIsConnected(true);
      toast({
        title: "Connected to Google Assistant",
        description: "Authentication successful",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Assistant API",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDeploy = useCallback(async () => {
    if (overallScore < 75) {
      toast({
        title: "Deployment Blocked",
        description: "Please fix compatibility issues before deploying",
        variant: "destructive",
      });
      return;
    }

    const stages = ['preparing', 'uploading', 'testing', 'deployed'] as const;
    
    for (const stage of stages) {
      setDeploymentState(stage);
      
      // Simulate deployment time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (stage === 'deployed') {
        onDeploy();
        toast({
          title: "Deployment Successful",
          description: `${botData.name} is now live on Google Assistant`,
        });
      }
    }
  }, [overallScore, botData.name, onDeploy, toast]);

  const generateActionsJson = () => {
    return {
      actions: [
        {
          name: `actions.intent.${invocationName.toUpperCase()}`,
          intent: {
            name: `actions.intent.${invocationName.toUpperCase()}`,
            trigger: {
              queryPatterns: [invocationName, `talk to ${invocationName}`]
            }
          },
          fulfillment: {
            conversationName: invocationName
          }
        }
      ],
      conversations: {
        [invocationName]: {
          name: invocationName,
          url: `https://your-webhook-url.com/${invocationName}`
        }
      },
      locale: "en"
    };
  };

  const testOnDevice = async (device: 'mobile' | 'speaker' | 'web') => {
    setTestingDevice(device);
    
    // Simulate device testing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast({
      title: "Device Test Complete",
      description: `Successfully tested on ${device}`,
    });
    
    setTestingDevice(null);
  };

  return (
    <Card className={`glassmorphism ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Speaker className="h-6 w-6 text-primary" />
          Google Assistant Integration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Deploy your bot to Google Assistant and smart speakers
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-600' : 'bg-muted'}`}>
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Google Cloud Console</p>
                    <p className="text-sm text-muted-foreground">
                      {isConnected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleConnect}
                  variant={isConnected ? "outline" : "default"}
                  disabled={isConnected}
                >
                  {isConnected ? 'Connected' : 'Connect'}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-id">Google Cloud Project ID</Label>
                  <Input
                    id="project-id"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="my-assistant-project"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a project in Google Cloud Console with Actions API enabled
                  </p>
                </div>

                <div>
                  <Label htmlFor="invocation-name">Invocation Name</Label>
                  <Input
                    id="invocation-name"
                    value={invocationName}
                    onChange={(e) => setInvocationName(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="my bot name"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Users will say "Hey Google, talk to {invocationName}" to start
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Compatibility Tab */}
          <TabsContent value="compatibility" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Readiness Score</h3>
                <Badge variant={overallScore >= 75 ? "default" : "destructive"}>
                  {overallScore}%
                </Badge>
              </div>
              
              <Progress value={overallScore} className="h-3" />
              
              <div className="space-y-3">
                {compatibilityChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${
                        check.status === 'pass' ? 'bg-green-500/20 text-green-600' :
                        check.status === 'warning' ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-red-500/20 text-red-600'
                      }`}>
                        {check.status === 'pass' ? 
                          <CheckCircle className="h-4 w-4" /> : 
                          <AlertCircle className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">{check.name}</p>
                        <p className="text-xs text-muted-foreground">{check.message}</p>
                      </div>
                    </div>
                    <Badge variant={
                      check.status === 'pass' ? 'default' :
                      check.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Deploy Tab */}
          <TabsContent value="deploy" className="space-y-6">
            <div className="space-y-4">
              {/* Deployment Status */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h3 className="font-semibold mb-3">Deployment Status</h3>
                <div className="space-y-3">
                  {[
                    { id: 'preparing', label: 'Preparing deployment package', icon: <Settings className="h-4 w-4" /> },
                    { id: 'uploading', label: 'Uploading to Google Cloud', icon: <Upload className="h-4 w-4" /> },
                    { id: 'testing', label: 'Running integration tests', icon: <Play className="h-4 w-4" /> },
                    { id: 'deployed', label: 'Live on Google Assistant', icon: <CheckCircle className="h-4 w-4" /> }
                  ].map((step, index) => {
                    const isActive = ['preparing', 'uploading', 'testing', 'deployed'].indexOf(deploymentState) >= index;
                    const isCurrent = ['preparing', 'uploading', 'testing', 'deployed'][index] === deploymentState;
                    
                    return (
                      <div key={step.id} className={`flex items-center gap-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`p-1 rounded-full ${isActive ? 'bg-primary/20' : 'bg-muted'}`}>
                          {step.icon}
                        </div>
                        <span className="text-sm">{step.label}</span>
                        {isCurrent && deploymentState !== 'idle' && deploymentState !== 'deployed' && (
                          <div className="ml-auto">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deploy Button */}
              <Button
                onClick={handleDeploy}
                disabled={!isConnected || overallScore < 75 || deploymentState !== 'idle'}
                className="w-full"
                size="lg"
              >
                {deploymentState === 'idle' ? 'Deploy to Google Assistant' : 'Deploying...'}
              </Button>

              {/* Actions JSON Preview */}
              <div className="space-y-3">
                <h4 className="font-medium">Generated Actions Schema</h4>
                <div className="bg-muted p-4 rounded-lg border text-xs overflow-auto max-h-40">
                  <pre>{JSON.stringify(generateActionsJson(), null, 2)}</pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(generateActionsJson(), null, 2));
                    toast({ title: "Copied to clipboard" });
                  }}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Copy Actions Schema
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Test Your Bot</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'mobile', label: 'Test on Mobile', icon: <Smartphone className="h-8 w-8" />, description: 'Google Assistant app' },
                  { id: 'speaker', label: 'Test on Speaker', icon: <Speaker className="h-8 w-8" />, description: 'Smart speakers' },
                  { id: 'web', label: 'Web Simulator', icon: <Monitor className="h-8 w-8" />, description: 'Browser testing' }
                ].map((device) => (
                  <Card key={device.id} className="p-4 hover:bg-muted/20 transition-colors cursor-pointer">
                    <div className="text-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto text-primary">
                        {device.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{device.label}</h4>
                        <p className="text-xs text-muted-foreground">{device.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => testOnDevice(device.id as any)}
                        disabled={deploymentState !== 'deployed' || testingDevice === device.id}
                        className="w-full"
                      >
                        {testingDevice === device.id ? 'Testing...' : 'Test Now'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Voice Test Interface */}
              {deploymentState === 'deployed' && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-medium mb-3">Voice Test Interface</h4>
                  <div className="flex items-center gap-4 justify-center">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Start Voice Test
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Play Sample
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    Say "Hey Google, talk to {invocationName}" to test your bot
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};