import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Key, Volume2, Mic, TestTube, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceSettingsDialogProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ELEVENLABS_VOICES = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Warm, clear female voice" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "Professional male voice" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Friendly female voice" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", description: "Calm, soothing voice" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Young, energetic voice" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "Deep, authoritative voice" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", description: "British accent, clear" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River", description: "Neutral, versatile voice" }
];

const ELEVENLABS_MODELS = [
  { id: "eleven_multilingual_v2", name: "Multilingual v2", description: "Best for content creation in 29 languages" },
  { id: "eleven_turbo_v2_5", name: "Turbo v2.5", description: "High quality, low latency in 32 languages" },
  { id: "eleven_turbo_v2", name: "Turbo v2", description: "English-only, fastest response" },
  { id: "eleven_multilingual_v1", name: "Multilingual v1", description: "First multilingual model" }
];

export const VoiceSettingsDialog: React.FC<VoiceSettingsDialogProps> = ({
  apiKey,
  onApiKeyChange,
  selectedVoice,
  onVoiceChange,
  selectedModel,
  onModelChange,
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const { toast } = useToast();

  const testApiKey = async () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key",
        variant: "destructive",
      });
      return;
    }

    setIsTestingApi(true);
    setApiStatus('testing');

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': tempApiKey,
        },
      });

      if (response.ok) {
        setApiStatus('valid');
        onApiKeyChange(tempApiKey);
        toast({
          title: "API Key Valid! ✅",
          description: "Successfully connected to ElevenLabs",
        });
      } else {
        setApiStatus('invalid');
        toast({
          title: "Invalid API Key",
          description: "Please check your ElevenLabs API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      setApiStatus('invalid');
      toast({
        title: "Connection Error",
        description: "Failed to connect to ElevenLabs API",
        variant: "destructive",
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const testVoice = async () => {
    if (!apiKey || !selectedVoice) {
      toast({
        title: "Setup Required",
        description: "Please configure API key and select a voice first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: "Hello! This is a test of African voice training with ElevenLabs. Habari! Comment ça va?",
          model_id: selectedModel,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        
        toast({
          title: "Voice Test Successful! 🎵",
          description: "Playing sample audio with your selected voice",
        });
      } else {
        toast({
          title: "Voice Test Failed",
          description: "Could not generate test audio",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to test voice synthesis",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Voice Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            ElevenLabs Voice Configuration
          </DialogTitle>
          <DialogDescription>
            Configure ElevenLabs API for real speech-to-text and text-to-speech functionality
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key Setup
              </CardTitle>
              <CardDescription>
                Get your API key from{" "}
                <a 
                  href="https://elevenlabs.io/app/settings" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ElevenLabs Settings
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">ElevenLabs API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={testApiKey}
                    disabled={isTestingApi}
                    variant={apiStatus === 'valid' ? 'default' : 'outline'}
                  >
                    {isTestingApi ? (
                      <TestTube className="h-4 w-4 mr-2 animate-spin" />
                    ) : apiStatus === 'valid' ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : apiStatus === 'invalid' ? (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Test
                  </Button>
                </div>
                {apiStatus === 'valid' && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ API key is valid and connected
                  </p>
                )}
                {apiStatus === 'invalid' && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ❌ Invalid API key - please check and try again
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Selection
              </CardTitle>
              <CardDescription>
                Choose a voice that works well for African accents and languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={onVoiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {ELEVENLABS_VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div>
                          <div className="font-medium">{voice.name}</div>
                          <div className="text-sm text-muted-foreground">{voice.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={selectedModel} onValueChange={onModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {ELEVENLABS_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={testVoice}
                disabled={!apiKey || !selectedVoice}
                className="w-full"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Test Voice
              </Button>
            </CardContent>
          </Card>

          {/* African Language Support Info */}
          <Card>
            <CardHeader>
              <CardTitle>🌍 African Language Support</CardTitle>
              <CardDescription>
                Optimized for African languages and accents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Supported Languages:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>🇰🇪 Swahili (Kenya, Tanzania)</li>
                    <li>🇿🇦 Zulu, Xhosa (South Africa)</li>
                    <li>🇳🇬 Yoruba, Hausa (Nigeria)</li>
                    <li>🇪🇹 Amharic (Ethiopia)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>✅ Real-time transcription</li>
                    <li>✅ Accent adaptation</li>
                    <li>✅ Cultural phrase recognition</li>
                    <li>✅ Multilingual support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};