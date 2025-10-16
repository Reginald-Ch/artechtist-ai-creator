import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Briefcase, 
  Smile, 
  GraduationCap,
  Trash2,
  Volume2,
  Heart,
  Zap,
  Brain
} from "lucide-react";
import { useVoicePersonality, VoicePersonality } from "@/hooks/useVoicePersonality";
import { ScrollArea } from "@/components/ui/scroll-area";

const PERSONALITY_INFO = {
  friendly: {
    icon: Sparkles,
    label: 'Friendly',
    description: 'Warm, cheerful, and supportive tone',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  formal: {
    icon: Briefcase,
    label: 'Formal',
    description: 'Professional and respectful tone',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  humorous: {
    icon: Smile,
    label: 'Humorous',
    description: 'Fun, playful, and energetic tone',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  teacher: {
    icon: GraduationCap,
    label: 'Teacher',
    description: 'Patient, educational, and encouraging',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
} as const;

const EMOTION_INFO = {
  neutral: { icon: Volume2, label: 'Neutral', color: 'text-gray-500' },
  excited: { icon: Zap, label: 'Excited', color: 'text-orange-500' },
  calm: { icon: Heart, label: 'Calm', color: 'text-blue-500' },
  empathetic: { icon: Brain, label: 'Empathetic', color: 'text-purple-500' },
} as const;

interface VoicePersonalitySettingsProps {
  onClose?: () => void;
}

export const VoicePersonalitySettings = ({ onClose }: VoicePersonalitySettingsProps) => {
  const {
    settings,
    setPersonality,
    clearHistory,
    getGreeting,
    personalityConfig,
  } = useVoicePersonality();

  const handlePersonalityChange = (value: string) => {
    setPersonality(value as VoicePersonality);
  };

  const handleTestVoice = () => {
    const greeting = getGreeting();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(greeting);
      utterance.pitch = personalityConfig.pitch;
      utterance.rate = personalityConfig.speed;
      window.speechSynthesis.speak(utterance);
    }
  };

  const CurrentEmotion = EMOTION_INFO[settings.emotionalTone];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Voice Personality
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Emotional State */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CurrentEmotion.icon className={`h-5 w-5 ${CurrentEmotion.color}`} />
              <div>
                <p className="text-sm font-medium">Current Tone</p>
                <p className="text-xs text-muted-foreground">{CurrentEmotion.label}</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Brain className="h-3 w-3" />
              Adaptive
            </Badge>
          </div>
        </div>

        {/* Personality Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Choose Personality</Label>
          <RadioGroup 
            value={settings.personality} 
            onValueChange={handlePersonalityChange}
            className="grid grid-cols-2 gap-3"
          >
            {(Object.keys(PERSONALITY_INFO) as VoicePersonality[]).map((key) => {
              const info = PERSONALITY_INFO[key];
              const Icon = info.icon;
              const isSelected = settings.personality === key;
              
              return (
                <label
                  key={key}
                  className={`
                    relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? `${info.bgColor} border-current ${info.color}` 
                      : 'border-muted hover:border-muted-foreground/50'
                    }
                  `}
                >
                  <RadioGroupItem value={key} className="sr-only" />
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? info.color : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-0.5">{info.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {info.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className={`h-2 w-2 rounded-full ${info.color} bg-current`} />
                    </div>
                  )}
                </label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Voice Settings Display */}
        <div className="space-y-2 p-3 rounded-lg bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground">VOICE SETTINGS</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Pitch</p>
              <p className="font-medium">{personalityConfig.pitch.toFixed(1)}x</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Speed</p>
              <p className="font-medium">{personalityConfig.speed.toFixed(1)}x</p>
            </div>
          </div>
        </div>

        {/* Conversation History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Conversation Memory</Label>
            <Badge variant="secondary">
              {settings.conversationHistory.length} messages
            </Badge>
          </div>
          
          {settings.conversationHistory.length > 0 ? (
            <ScrollArea className="h-32 rounded-md border p-3">
              <div className="space-y-2">
                {settings.conversationHistory.slice(-5).reverse().map((entry, idx) => (
                  <div key={idx} className="text-xs space-y-1 pb-2 border-b last:border-0">
                    <p className="text-muted-foreground">
                      <span className="font-medium">You:</span> {entry.userMessage.slice(0, 50)}...
                    </p>
                    {entry.detectedSentiment && (
                      <Badge variant="outline" className="text-xs">
                        {entry.detectedSentiment}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No conversation history yet
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleTestVoice}
            variant="outline"
            className="flex-1"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Test Voice
          </Button>
          <Button
            onClick={clearHistory}
            variant="outline"
            size="icon"
            disabled={settings.conversationHistory.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💡 The AI adapts its tone based on your conversation sentiment
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
