import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Globe, Smartphone, Speaker, Settings, Link, CheckCircle, AlertTriangle, Play, Code } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Node } from '@xyflow/react';

interface GoogleAssistantPanelProps {
  nodes: Node[];
  botName: string;
  onDeploy: () => void;
}

export const GoogleAssistantPanel = ({ nodes, botName, onDeploy }: GoogleAssistantPanelProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0);
  const [projectId, setProjectId] = useState('');
  const [invocationName, setInvocationName] = useState(botName.toLowerCase().replace(/\s+/g, ' '));
  const [isDeploying, setIsDeploying] = useState(false);

  const deploymentSteps = [
    { title: 'Configure Project', description: 'Set up Google Actions project' },
    { title: 'Generate Actions', description: 'Convert intents to Actions format' },
    { title: 'Deploy & Test', description: 'Upload to Google Actions console' },
    { title: 'Publish', description: 'Submit for review (optional)' }
  ];

  const handleConnect = () => {
    setIsConnected(!isConnected);
    toast({
      title: isConnected ? "Disconnected from Google Assistant" : "Connected to Google Assistant! 🎉",
      description: isConnected 
        ? "Your bot is no longer linked to Google Assistant" 
        : "Your bot can now work with Google Assistant and smart speakers!",
    });
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    // Simulate deployment process
    for (let i = 0; i <= 3; i++) {
      setDeploymentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (i === 1) {
        toast({
          title: "Generating Actions Schema",
          description: `Converting ${nodes.filter(n => n.type === 'intent').length} intents to Google Actions format`,
        });
      }
    }
    
    setIsDeploying(false);
    onDeploy();
    
    toast({
      title: "Deployment Complete! 🚀",
      description: "Your bot is now available on Google Assistant",
    });
  };

  const generateActionsJson = () => {
    const intentNodes = nodes.filter(node => node.type === 'intent');
    const actions = {
      actions: [{
        name: 'actions.intent.MAIN',
        intent: {
          name: 'actions.intent.MAIN',
          trigger: {
            queryPatterns: [`talk to ${invocationName}`, `speak to ${invocationName}`]
          }
        },
        fulfillment: {
          conversationName: 'bot_conversation'
        }
      }],
      conversations: {
        bot_conversation: {
          name: 'bot_conversation',
          url: 'https://your-webhook-url.com/webhook',
          fulfillmentApiVersion: 2
        }
      },
      locale: 'en'
    };

    return JSON.stringify(actions, null, 2);
  };

  const compatibilityScore = () => {
    const intentNodes = nodes.filter(node => node.type === 'intent');
    const totalPhrases = intentNodes.reduce((sum, node) => 
      sum + (node.data.trainingPhrases?.length || 0), 0
    );
    
    let score = 0;
    if (intentNodes.length >= 2) score += 30; // Has basic intents
    if (totalPhrases >= 10) score += 30; // Sufficient training data
    if (invocationName.length >= 2) score += 20; // Valid invocation name
    if (intentNodes.some(node => node.data.label?.toLowerCase().includes('help'))) score += 10;
    if (intentNodes.some(node => node.data.label?.toLowerCase().includes('fallback'))) score += 10;
    
    return Math.min(100, score);
  };

  const score = compatibilityScore();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={`border-2 ${isConnected ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe className={`h-6 w-6 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <h3>Google Assistant Integration</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Deploy your bot to Google Assistant and smart speakers
              </p>
            </div>
            <div className="ml-auto">
              <Badge className={isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleConnect} 
            className={`w-full ${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            <Link className="h-4 w-4 mr-2" />
            {isConnected ? 'Disconnect' : 'Connect to Google Assistant'}
          </Button>
        </CardContent>
      </Card>

      {/* Compatibility Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Compatibility Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Readiness Score</span>
              <span className={`text-lg font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {score}%
              </span>
            </div>
            <Progress value={score} className="h-3" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {nodes.filter(n => n.type === 'intent').length >= 2 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm">Intent Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  {invocationName.length >= 2 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm">Invocation Name</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {nodes.reduce((sum, node) => sum + (node.data.trainingPhrases?.length || 0), 0) >= 10 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm">Training Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Response Handling</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Google Cloud Project ID</label>
                <Input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="your-project-id"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Create a project in Google Cloud Console if you don't have one
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Invocation Name</label>
                <Input
                  value={invocationName}
                  onChange={(e) => setInvocationName(e.target.value)}
                  placeholder="my awesome bot"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Users will say "Hey Google, talk to {invocationName}"
                </p>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <strong>Prerequisites:</strong> You'll need a Google Cloud Project with Actions API enabled and authentication credentials.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {deploymentSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < deploymentStep ? 'bg-green-500 text-white' :
                      index === deploymentStep && isDeploying ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index < deploymentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleDeploy} 
                disabled={!isConnected || isDeploying || score < 60}
                className="w-full"
              >
                {isDeploying ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Deploying... (Step {deploymentStep + 1}/4)
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Deploy to Google Assistant
                  </>
                )}
              </Button>

              {score < 60 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your bot needs a compatibility score of at least 60% before deployment. 
                    Add more intents and training phrases to improve readiness.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Generated Actions Schema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                {generateActionsJson()}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-medium">Mobile Test</h4>
                  <p className="text-sm text-muted-foreground">Test on your phone</p>
                  <Button size="sm" className="mt-2">
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </Card>
                
                <Card className="p-4 text-center">
                  <Speaker className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-medium">Smart Speaker</h4>
                  <p className="text-sm text-muted-foreground">Test on Google Home</p>
                  <Button size="sm" className="mt-2">
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </Card>
                
                <Card className="p-4 text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-medium">Web Simulator</h4>
                  <p className="text-sm text-muted-foreground">Browser testing</p>
                  <Button size="sm" className="mt-2">
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </Card>
              </div>

              <Alert>
                <Play className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Commands:</strong> Try saying "Hey Google, talk to {invocationName}" to start a conversation with your bot.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};