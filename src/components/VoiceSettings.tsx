import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Volume2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoiceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VoiceSettings = ({ open, onOpenChange }: VoiceSettingsProps) => {
  const [voiceGender, setVoiceGender] = useState("female");
  const [pitch, setPitch] = useState([1.0]);
  const [speakingSpeed, setSpeakingSpeed] = useState([1.0]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const presets = [
    { id: 'kid-friendly', label: 'Kid-Friendly', emoji: '🧸' },
    { id: 'robot', label: 'Robot Voice', emoji: '🤖' },
    { id: 'natural', label: 'Natural', emoji: '😊' },
    { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  ];

  const handlePresetClick = (presetId: string) => {
    setSelectedPreset(presetId);
    
    // Apply preset values
    switch (presetId) {
      case 'kid-friendly':
        setPitch([1.2]);
        setSpeakingSpeed([0.9]);
        break;
      case 'robot':
        setPitch([0.8]);
        setSpeakingSpeed([0.7]);
        break;
      case 'natural':
        setPitch([1.0]);
        setSpeakingSpeed([1.0]);
        break;
      case 'energetic':
        setPitch([1.1]);
        setSpeakingSpeed([1.2]);
        break;
    }
  };

  const handleTestVoice = () => {
    const testMessage = "Hello! This is how I will sound when I speak to users.";
    
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(testMessage);
      
      // Apply current settings
      utterance.pitch = pitch[0];
      utterance.rate = speakingSpeed[0];
      utterance.volume = 0.8;
      
      // Set voice gender preference
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voiceGender === 'female' ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') : 
         voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man'))
      ) || voices.find(voice => voice.lang.includes('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Testing voice with settings:', {
        voiceGender,
        pitch: pitch[0],
        speakingSpeed: speakingSpeed[0],
      });
    }
  };

  const handleSaveSettings = () => {
    const voiceSettings = {
      voiceGender,
      pitch: pitch[0],
      speakingSpeed: speakingSpeed[0],
      preset: selectedPreset,
      savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('aiAgentVoiceSettings', JSON.stringify(voiceSettings));
    
    console.log('Saved voice settings:', voiceSettings);
    
    toast({
      title: "Voice settings saved",
      description: "Your voice preferences have been saved successfully",
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
              <Volume2 className="h-5 w-5 text-primary" />
            </div>
            Voice Settings ✨
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Voice Gender */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Voice Gender</Label>
            <RadioGroup 
              value={voiceGender} 
              onValueChange={setVoiceGender}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="text-sm">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="text-sm">Male</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pitch */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Pitch</Label>
              <span className="text-sm text-muted-foreground">{pitch[0].toFixed(1)}</span>
            </div>
            <div className="px-2">
              <Slider
                value={pitch}
                onValueChange={setPitch}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>
          </div>

          {/* Speaking Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Speaking Speed</Label>
              <span className="text-sm text-muted-foreground">{speakingSpeed[0].toFixed(1)}x</span>
            </div>
            <div className="px-2">
              <Slider
                value={speakingSpeed}
                onValueChange={setSpeakingSpeed}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>
          </div>

          {/* Test Voice */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4" />
              Test Your Voice
            </Label>
            <p className="text-sm text-muted-foreground">Hear how your chatbot will sound</p>
            <Button 
              onClick={handleTestVoice}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg transition-all duration-200"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              🎤 Test Voice
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Card 
                  key={preset.id}
                  className={`cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedPreset === preset.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handlePresetClick(preset.id)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-lg mb-1">{preset.emoji}</div>
                    <div className="text-xs font-medium">{preset.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSaveSettings}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-200"
            size="lg"
          >
            ✅ Save Voice Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSettings;