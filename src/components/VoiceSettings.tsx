import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Volume2 } from "lucide-react";

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
    // Implement voice testing logic here
    console.log('Testing voice with settings:', {
      voiceGender,
      pitch: pitch[0],
      speakingSpeed: speakingSpeed[0],
    });
  };

  const handleSaveSettings = () => {
    // Implement save logic here
    console.log('Saving voice settings:', {
      voiceGender,
      pitch: pitch[0],
      speakingSpeed: speakingSpeed[0],
      preset: selectedPreset,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Settings
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
            <Label className="text-sm font-medium">Test Your Voice</Label>
            <p className="text-sm text-muted-foreground">Hear how your chatbot will sound</p>
            <Button 
              onClick={handleTestVoice}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Test
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Voice Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSettings;