import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Speaker, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceSettings {
  language: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
}

interface ActionSettings {
  invocationName: string;
  welcomeMessage: string;
  helpMessage: string;
  fallbackMessage: string;
}

interface GoogleSpeakerIntegrationProps {
  botNodes: any[];
  botEdges: any[];
  onConnectionChange?: (isConnected: boolean) => void;
}

const GoogleSpeakerIntegration: React.FC<GoogleSpeakerIntegrationProps> = ({
  botNodes,
  botEdges,
  onConnectionChange
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: 'en-US',
    voice: 'en-US-Standard-D',
    speed: 1.0,
    pitch: 0.0,
    volume: 0.8
  });
  const [actionSettings, setActionSettings] = useState<ActionSettings>({
    invocationName: 'my ai assistant',
    welcomeMessage: 'Welcome to your AI assistant. How can I help you today?',
    helpMessage: 'You can ask me questions or have a conversation. Try saying something like "tell me a joke" or "what can you do?"',
    fallbackMessage: "I didn't understand that. Can you try asking differently?"
  });

  const [testMode, setTestMode] = useState(false);
  const [connectionKey, setConnectionKey] = useState('');

  // Speech Recognition and Synthesis
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize speech APIs
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = voiceSettings.language;
      setRecognition(recog);
    }

    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }
  }, [voiceSettings.language]);

  // Generate Actions on Google configuration
  const generateActionsConfig = useCallback(() => {
    const config = {
      actions: {
        custom: {
          [actionSettings.invocationName]: {
            intent: {
              name: 'actions.intent.MAIN',
              trigger: {
                queryPatterns: [
                  `Talk to ${actionSettings.invocationName}`,
                  `Ask ${actionSettings.invocationName}`,
                  `Launch ${actionSettings.invocationName}`
                ]
              }
            }
          }
        }
      },
      conversations: {
        welcome: {
          intent: 'actions.intent.MAIN',
          handler: {
            webhookHandler: 'webhook'
          }
        },
        fallback: {
          intent: 'actions.intent.NO_INPUT',
          handler: {
            webhookHandler: 'webhook'
          }
        }
      },
      webhooks: {
        webhook: {
          url: `https://sukjhodekowdfmqimiyo.supabase.co/functions/v1/google-assistant-webhook`
        }
      }
    };

    return config;
  }, [actionSettings]);

  // Deploy to Google Assistant
  const deployToGoogleAssistant = useCallback(async () => {
    setIsDeploying(true);
    setDeploymentStatus('deploying');

    try {
      // Generate the configuration
      const actionsConfig = generateActionsConfig();
      
      // Create or update the Google Assistant webhook
      const { data, error } = await supabase.functions.invoke('deploy-google-assistant', {
        body: {
          actionsConfig,
          voiceSettings,
          actionSettings,
          botNodes,
          botEdges
        }
      });

      if (error) throw error;

      setDeploymentStatus('success');
      setIsConnected(true);
      setConnectionKey(data.connectionKey);
      
      toast({
        title: "Successfully Deployed!",
        description: "Your AI assistant is now available on Google Assistant",
      });

      if (onConnectionChange) {
        onConnectionChange(true);
      }

    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentStatus('error');
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying to Google Assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  }, [generateActionsConfig, voiceSettings, actionSettings, botNodes, botEdges, onConnectionChange]);

  // Test voice interaction locally
  const startVoiceTest = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Voice Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    setTestMode(true);
    setIsListening(true);

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript;
        handleVoiceInput(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "There was an error with speech recognition.",
        variant: "destructive",
      });
    };

    recognition.start();
    
    // Speak welcome message
    if (synthesis) {
      const utterance = new SpeechSynthesisUtterance(actionSettings.welcomeMessage);
      utterance.lang = voiceSettings.language;
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      synthesis.speak(utterance);
    }
  }, [recognition, synthesis, actionSettings.welcomeMessage, voiceSettings]);

  const stopVoiceTest = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    if (synthesis) {
      synthesis.cancel();
    }
    setIsListening(false);
    setTestMode(false);
  }, [recognition, synthesis]);

  // Handle voice input during testing
  const handleVoiceInput = useCallback(async (input: string) => {
    try {
      // Simple intent matching for testing
      let response = actionSettings.fallbackMessage;
      
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        response = "Hello! How can I help you today?";
      } else if (lowerInput.includes('help')) {
        response = actionSettings.helpMessage;
      } else if (lowerInput.includes('goodbye') || lowerInput.includes('bye')) {
        response = "Goodbye! Thanks for testing the voice assistant.";
        setTimeout(() => stopVoiceTest(), 2000);
      }

      // Speak the response
      if (synthesis) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.lang = voiceSettings.language;
        utterance.rate = voiceSettings.speed;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;
        synthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Error handling voice input:', error);
    }
  }, [actionSettings, voiceSettings, synthesis, stopVoiceTest]);

  // Disconnect from Google Assistant
  const disconnectGoogleAssistant = useCallback(async () => {
    try {
      const { error } = await supabase.functions.invoke('disconnect-google-assistant', {
        body: { connectionKey }
      });

      if (error) throw error;

      setIsConnected(false);
      setConnectionKey('');
      setDeploymentStatus('idle');
      
      toast({
        title: "Disconnected",
        description: "Your AI assistant has been removed from Google Assistant",
      });

      if (onConnectionChange) {
        onConnectionChange(false);
      }

    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnect Failed",
        description: "There was an error disconnecting from Google Assistant.",
        variant: "destructive",
      });
    }
  }, [connectionKey, onConnectionChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Speaker className="h-5 w-5 text-primary" />
            <CardTitle>Google Speaker Integration</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="bg-green-500">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline">
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Deploy your conversational AI to Google Assistant and Google Smart Speakers
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
          </TabsList>

          {/* Action Settings */}
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Invocation Name</label>
                <input
                  type="text"
                  value={actionSettings.invocationName}
                  onChange={(e) => setActionSettings(prev => ({ ...prev, invocationName: e.target.value }))}
                  placeholder="my ai assistant"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Users will say "Hey Google, talk to {actionSettings.invocationName}"
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Welcome Message</label>
                <textarea
                  value={actionSettings.welcomeMessage}
                  onChange={(e) => setActionSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  placeholder="Welcome message..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Help Message</label>
                <textarea
                  value={actionSettings.helpMessage}
                  onChange={(e) => setActionSettings(prev => ({ ...prev, helpMessage: e.target.value }))}
                  placeholder="Help message..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Fallback Message</label>
                <textarea
                  value={actionSettings.fallbackMessage}
                  onChange={(e) => setActionSettings(prev => ({ ...prev, fallbackMessage: e.target.value }))}
                  placeholder="Fallback message..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                />
              </div>
            </div>
          </TabsContent>

          {/* Voice Settings */}
          <TabsContent value="voice" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <select
                  value={voiceSettings.language}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="fr-FR">French</option>
                  <option value="es-ES">Spanish</option>
                  <option value="de-DE">German</option>
                  <option value="sw-KE">Swahili</option>
                  <option value="ar-EG">Arabic</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Voice</label>
                <select
                  value={voiceSettings.voice}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en-US-Standard-D">Standard Voice (Male)</option>
                  <option value="en-US-Standard-F">Standard Voice (Female)</option>
                  <option value="en-US-Wavenet-D">WaveNet Voice (Male)</option>
                  <option value="en-US-Wavenet-F">WaveNet Voice (Female)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Speed: {voiceSettings.speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Pitch: {voiceSettings.pitch > 0 ? '+' : ''}{voiceSettings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Volume: {Math.round(voiceSettings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          {/* Voice Testing */}
          <TabsContent value="test" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Test your voice assistant locally before deploying to Google Assistant. 
                Make sure your microphone is enabled.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              {!testMode ? (
                <Button onClick={startVoiceTest} className="bg-green-500 hover:bg-green-600">
                  <Play className="h-4 w-4 mr-2" />
                  Start Voice Test
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    {isListening ? (
                      <>
                        <Mic className="h-6 w-6 text-green-500 animate-pulse" />
                        <span className="text-green-500 font-medium">Listening...</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="h-6 w-6 text-muted-foreground" />
                        <span className="text-muted-foreground">Processing...</span>
                      </>
                    )}
                  </div>
                  
                  <Button onClick={stopVoiceTest} variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Test
                  </Button>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Try saying:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>"Hello" or "Hi"</li>
                  <li>"Help me"</li>
                  <li>"Goodbye"</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Deployment */}
          <TabsContent value="deploy" className="space-y-4">
            {!isConnected ? (
              <div className="space-y-4">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Before deploying, make sure you have configured your Google Actions Console project 
                    and provided the necessary credentials.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">Deployment Checklist:</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Bot conversation flow configured
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Voice settings configured
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Action settings configured
                    </li>
                    <li className="flex items-center gap-2">
                      {botNodes.length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      Intent nodes created ({botNodes.length})
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={deployToGoogleAssistant}
                  disabled={isDeploying || botNodes.length === 0}
                  className="w-full"
                >
                  {isDeploying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Speaker className="h-4 w-4 mr-2" />
                      Deploy to Google Assistant
                    </>
                  )}
                </Button>

                {deploymentStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Deployment failed. Please check your configuration and try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your AI assistant is successfully deployed to Google Assistant!
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">How to use:</h4>
                  <ul className="text-sm space-y-1 pl-4">
                    <li>• Say "Hey Google, talk to {actionSettings.invocationName}"</li>
                    <li>• Or "Hey Google, ask {actionSettings.invocationName} [your question]"</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={deployToGoogleAssistant}
                    variant="outline"
                    disabled={isDeploying}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Deployment
                  </Button>
                  
                  <Button
                    onClick={disconnectGoogleAssistant}
                    variant="destructive"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GoogleSpeakerIntegration;