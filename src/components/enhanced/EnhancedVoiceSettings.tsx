import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, Play, Volume2, Settings, Key, TestTube } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EnhancedVoiceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VOICE_PRESETS = [
  {
    id: "friendly",
    name: "Friendly Assistant",
    description: "Warm and approachable",
    voiceId: "9BWtsMINqrJLrRacOk9x",
    stability: 0.75,
    clarity: 0.75,
    style: 0.5,
    emoji: "😊"
  },
  {
    id: "professional",
    name: "Professional Guide", 
    description: "Clear and authoritative",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    stability: 0.85,
    clarity: 0.85,
    style: 0.2,
    emoji: "👔"
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Expressive and engaging",
    voiceId: "AZnzlk1XvdvUeBnXmlld",
    stability: 0.65,
    clarity: 0.75,
    style: 0.8,
    emoji: "📚"
  },
  {
    id: "teacher",
    name: "Patient Teacher",
    description: "Educational and encouraging",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    stability: 0.8,
    clarity: 0.9,
    style: 0.4,
    emoji: "👨‍🏫"
  }
];

export const EnhancedVoiceSettings = ({ open, onOpenChange }: EnhancedVoiceSettingsProps) => {
  const [apiKey, setApiKey] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("friendly");
  const [customSettings, setCustomSettings] = useState({
    stability: 0.75,
    clarity: 0.75,
    style: 0.5,
    voiceId: "9BWtsMINqrJLrRacOk9x"
  });
  const [isTesting, setIsTesting] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedApiKey = localStorage.getItem('elevenlabs_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setHasApiKey(true);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('elevenlabs_api_key', apiKey.trim());
      setHasApiKey(true);
      toast({
        title: "API Key Saved",
        description: "ElevenLabs API key has been saved securely"
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid ElevenLabs API key",
        variant: "destructive"
      });
    }
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = VOICE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setCustomSettings({
        stability: preset.stability,
        clarity: preset.clarity,
        style: preset.style,
        voiceId: preset.voiceId
      });
    }
  };

  const handleTestVoice = async () => {
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your ElevenLabs API key first",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // Mock voice test - in real implementation, this would call ElevenLabs API
      const testText = "Hello! This is how I would sound as your AI assistant. I'm ready to help you with your questions.";
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Voice Test Complete",
        description: "Voice synthesis would play here with your selected settings"
      });
    } catch (error) {
      toast({
        title: "Voice Test Failed",
        description: "Could not generate voice sample. Please check your settings.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = () => {
    const settings = {
      apiKey: hasApiKey ? apiKey : null,
      preset: selectedPreset,
      custom: customSettings,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('voice_settings', JSON.stringify(settings));
    
    toast({
      title: "Voice Settings Saved",
      description: "Your voice preferences have been saved successfully"
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Voice Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={hasApiKey ? "presets" : "setup"} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="presets" disabled={!hasApiKey}>
              <Settings className="h-4 w-4" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="advanced" disabled={!hasApiKey}>
              <TestTube className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ElevenLabs API Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your ElevenLabs API key"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your API key from{" "}
                    <a 
                      href="https://elevenlabs.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      ElevenLabs.io
                    </a>
                  </p>
                </div>
                
                {hasApiKey && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      ✓ API Key Configured
                    </Badge>
                  </div>
                )}

                <Button 
                  onClick={handleApiKeySubmit}
                  disabled={!apiKey.trim()}
                  className="w-full"
                >
                  Save API Key
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {VOICE_PRESETS.map((preset) => (
                <Card 
                  key={preset.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedPreset === preset.id 
                      ? 'border-primary shadow-lg' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{preset.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{preset.name}</h3>
                        <p className="text-sm text-muted-foreground">{preset.description}</p>
                      </div>
                      {selectedPreset === preset.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleTestVoice}
                disabled={isTesting}
                variant="outline"
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <Mic className="h-4 w-4 mr-2 animate-pulse" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Voice
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Voice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Stability: {customSettings.stability}</Label>
                  <Slider
                    value={[customSettings.stability]}
                    onValueChange={([value]) => 
                      setCustomSettings(prev => ({ ...prev, stability: value }))
                    }
                    max={1}
                    min={0}
                    step={0.05}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls voice consistency and stability
                  </p>
                </div>

                <div>
                  <Label>Clarity: {customSettings.clarity}</Label>
                  <Slider
                    value={[customSettings.clarity]}
                    onValueChange={([value]) => 
                      setCustomSettings(prev => ({ ...prev, clarity: value }))
                    }
                    max={1}
                    min={0}
                    step={0.05}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls voice clarity and pronunciation
                  </p>
                </div>

                <div>
                  <Label>Style Exaggeration: {customSettings.style}</Label>
                  <Slider
                    value={[customSettings.style]}
                    onValueChange={([value]) => 
                      setCustomSettings(prev => ({ ...prev, style: value }))
                    }
                    max={1}
                    min={0}
                    step={0.05}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls voice expressiveness and style
                  </p>
                </div>

                <Button 
                  onClick={handleTestVoice}
                  disabled={isTesting}
                  variant="outline"
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <Mic className="h-4 w-4 mr-2 animate-pulse" />
                      Testing Custom Settings...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test Custom Voice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={!hasApiKey}>
            Save Voice Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};