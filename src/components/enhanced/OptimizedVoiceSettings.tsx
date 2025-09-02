import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Mic, Volume2, Zap, CheckCircle, Loader2 } from "lucide-react";

interface OptimizedVoiceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ELEVENLABS_VOICES = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Warm and engaging" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "Professional and clear" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Friendly and approachable" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", description: "Calm and soothing" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Energetic and youthful" },
];

const ELEVENLABS_MODELS = [
  { id: "eleven_multilingual_v2", name: "Multilingual v2", description: "Most life-like, 29 languages" },
  { id: "eleven_turbo_v2_5", name: "Turbo v2.5", description: "High quality, low latency, 32 languages" },
  { id: "eleven_turbo_v2", name: "Turbo v2", description: "English-only, fastest response" },
];

export const OptimizedVoiceSettings = ({ open, onOpenChange }: OptimizedVoiceSettingsProps) => {
  const [apiKey, setApiKey] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("9BWtsMINqrJLrRacOk9x");
  const [selectedModel, setSelectedModel] = useState("eleven_multilingual_v2");
  const [stability, setStability] = useState([0.5]);
  const [clarity, setClarity] = useState([0.75]);
  const [style, setStyle] = useState([0.0]);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('elevenlabs_api_key');
    const savedVoice = localStorage.getItem('elevenlabs_voice');
    const savedModel = localStorage.getItem('elevenlabs_model');
    const savedStability = localStorage.getItem('elevenlabs_stability');
    const savedClarity = localStorage.getItem('elevenlabs_clarity');
    const savedStyle = localStorage.getItem('elevenlabs_style');

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedVoice) setSelectedVoice(savedVoice);
    if (savedModel) setSelectedModel(savedModel);
    if (savedStability) setStability([parseFloat(savedStability)]);
    if (savedClarity) setClarity([parseFloat(savedClarity)]);
    if (savedStyle) setStyle([parseFloat(savedStyle)]);
  }, []);

  const testApiKey = useCallback(async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key",
        variant: "destructive"
      });
      return;
    }

    setIsTestingKey(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': apiKey.trim()
        }
      });

      if (response.ok) {
        setKeyStatus('valid');
        localStorage.setItem('elevenlabs_api_key', apiKey.trim());
        toast({
          title: "API Key Valid",
          description: "Your ElevenLabs API key is working correctly",
        });
      } else {
        setKeyStatus('invalid');
        toast({
          title: "Invalid API Key",
          description: "Please check your ElevenLabs API key",
          variant: "destructive"
        });
      }
    } catch (error) {
      setKeyStatus('invalid');
      toast({
        title: "Connection Error",
        description: "Unable to verify API key. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsTestingKey(false);
    }
  }, [apiKey]);

  const testVoice = useCallback(async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter and test your API key first",
        variant: "destructive"
      });
      return;
    }

    setIsTestingVoice(true);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          text: "Hello! This is a test of the voice settings. How does this sound?",
          model_id: selectedModel,
          voice_settings: {
            stability: stability[0],
            similarity_boost: clarity[0],
            style: style[0]
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audio = new Audio(URL.createObjectURL(audioBlob));
        await audio.play();
        
        toast({
          title: "Voice Test Successful",
          description: "Voice sample played successfully",
        });
      } else {
        throw new Error('Voice test failed');
      }
    } catch (error) {
      toast({
        title: "Voice Test Failed",
        description: "Unable to test voice. Please check your settings.",
        variant: "destructive"
      });
    } finally {
      setIsTestingVoice(false);
    }
  }, [apiKey, selectedVoice, selectedModel, stability, clarity, style]);

  const saveSettings = useCallback(() => {
    localStorage.setItem('elevenlabs_api_key', apiKey);
    localStorage.setItem('elevenlabs_voice', selectedVoice);
    localStorage.setItem('elevenlabs_model', selectedModel);
    localStorage.setItem('elevenlabs_stability', stability[0].toString());
    localStorage.setItem('elevenlabs_clarity', clarity[0].toString());
    localStorage.setItem('elevenlabs_style', style[0].toString());
    
    toast({
      title: "Settings Saved",
      description: "Voice settings have been saved successfully",
    });
    
    onOpenChange(false);
  }, [apiKey, selectedVoice, selectedModel, stability, clarity, style, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Voice Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="voices">Voices</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ElevenLabs API Configuration</CardTitle>
                <CardDescription>
                  Configure your ElevenLabs API key for voice synthesis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your ElevenLabs API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={testApiKey} 
                      disabled={isTestingKey || !apiKey.trim()}
                      variant="outline"
                    >
                      {isTestingKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : keyStatus === 'valid' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                  {keyStatus === 'valid' && (
                    <p className="text-sm text-green-600">✓ API key is valid</p>
                  )}
                  {keyStatus === 'invalid' && (
                    <p className="text-sm text-red-600">✗ Invalid API key</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice Selection</CardTitle>
                <CardDescription>Choose a voice and model for your AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
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
                  disabled={isTestingVoice || !apiKey.trim()}
                  className="w-full"
                >
                  {isTestingVoice ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Testing Voice...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Test Voice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice Parameters</CardTitle>
                <CardDescription>Fine-tune voice characteristics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Stability: {stability[0].toFixed(2)}</Label>
                  <Slider
                    value={stability}
                    onValueChange={setStability}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Higher values make the voice more stable but less expressive
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Clarity: {clarity[0].toFixed(2)}</Label>
                  <Slider
                    value={clarity}
                    onValueChange={setClarity}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Controls how similar the voice is to the original speaker
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Style: {style[0].toFixed(2)}</Label>
                  <Slider
                    value={style}
                    onValueChange={setStyle}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Adds stylistic expression to the voice
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveSettings}>
            <Zap className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};