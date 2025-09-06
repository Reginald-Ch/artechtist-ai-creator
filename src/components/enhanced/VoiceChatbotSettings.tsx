import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mic, Volume2, Settings, Play, Pause, TestTube } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface VoiceSettings {
  gender: 'male' | 'female' | 'child';
  pitch: number;
  rate: number;
  volume: number;
  language: string;
  voiceId: string;
}

export const VoiceChatbotSettings = () => {
  const [settings, setSettings] = useState<VoiceSettings>({
    gender: 'child',
    pitch: 1.2,
    rate: 0.9,
    volume: 0.8,
    language: 'en-US',
    voiceId: 'child-friendly'
  });

  const [isOpen, setIsOpen] = useState(false);
  const { speak, stop, isPlaying } = useSpeechSynthesis();

  const testVoice = () => {
    const testMessage = "Hi there! I'm your AI assistant. How do you like my voice?";
    
    // Configure speech synthesis with current settings
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(testMessage);
      utterance.pitch = settings.pitch;
      utterance.rate = settings.rate;
      utterance.volume = settings.volume;
      
      // Try to find a voice matching the gender preference
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes(settings.language) && 
        (settings.gender === 'female' ? voice.name.toLowerCase().includes('female') : 
         settings.gender === 'male' ? voice.name.toLowerCase().includes('male') : true)
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
    
    toast({
      title: "🎤 Voice Test",
      description: "Playing voice sample with current settings"
    });
  };

  const saveSettings = () => {
    localStorage.setItem('voiceChatbotSettings', JSON.stringify(settings));
    toast({
      title: "✅ Settings Saved",
      description: "Voice settings have been saved successfully"
    });
    setIsOpen(false);
  };

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ar-SA', name: 'Arabic' },
    { code: 'sw-TZ', name: 'Swahili' },
    { code: 'yo-NG', name: 'Yoruba' },
    { code: 'zu-ZA', name: 'Zulu' },
    { code: 'am-ET', name: 'Amharic' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Voice Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Chatbot Voice Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Voice Gender */}
          <div className="space-y-2">
            <Label>Voice Gender</Label>
            <Select value={settings.gender} onValueChange={(value: 'male' | 'female' | 'child') => 
              setSettings(prev => ({ ...prev, gender: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="child">Child-Friendly</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={settings.language} onValueChange={(value) => 
              setSettings(prev => ({ ...prev, language: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pitch Control */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Pitch</Label>
              <span className="text-sm text-muted-foreground">{settings.pitch}</span>
            </div>
            <Slider
              value={[settings.pitch]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, pitch: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Speaking Rate */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Speaking Rate</Label>
              <span className="text-sm text-muted-foreground">{settings.rate}</span>
            </div>
            <Slider
              value={[settings.rate]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, rate: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Volume */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Volume</Label>
              <span className="text-sm text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, volume: value }))}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Voice Test */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Test Voice</h4>
                  <p className="text-sm text-muted-foreground">
                    Hear how your chatbot will sound
                  </p>
                </div>
                <Button onClick={testVoice} variant="outline" size="sm">
                  <TestTube className="mr-2 h-4 w-4" />
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={saveSettings} className="flex-1">
              Save Settings
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};