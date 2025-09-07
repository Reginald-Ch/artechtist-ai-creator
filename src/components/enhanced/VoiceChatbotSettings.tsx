import { useState, useEffect } from 'react';
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

  // Load saved settings on component mount
  useEffect(() => {
    const saved = localStorage.getItem('voiceChatbotSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load voice settings:', error);
      }
    }
  }, []);

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
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hover:bg-accent transition-colors"
          title="Voice Settings"
        >
          <Mic className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Voice</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mic className="h-4 w-4" />
            Voice Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Compact Voice & Language */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Voice</Label>
              <Select value={settings.gender} onValueChange={(value: 'male' | 'female' | 'child') => 
                setSettings(prev => ({ ...prev, gender: value }))
              }>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Language</Label>
              <Select value={settings.language} onValueChange={(value) => 
                setSettings(prev => ({ ...prev, language: value }))
              }>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="sw-TZ">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Compact Sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Pitch</Label>
              <span className="text-xs text-muted-foreground">{settings.pitch}</span>
            </div>
            <Slider
              value={[settings.pitch]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, pitch: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="h-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Speed</Label>
              <span className="text-xs text-muted-foreground">{settings.rate}</span>
            </div>
            <Slider
              value={[settings.rate]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, rate: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="h-2"
            />
          </div>

          {/* Test and Save */}
          <div className="flex gap-2 pt-2">
            <Button onClick={testVoice} variant="outline" size="sm" className="flex-1">
              <TestTube className="mr-1 h-3 w-3" />
              Test
            </Button>
            <Button onClick={saveSettings} size="sm" className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};