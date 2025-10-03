import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings, Mic, Globe } from "lucide-react";
import { OptimizedAvatarSelector } from "@/components/enhanced/OptimizedAvatarSelector";
import { validateBotName } from "@/utils/validation";
import { useState } from "react";

interface BotConfigurationProps {
  botName: string;
  botDescription: string;
  botAvatar: string;
  onBotNameChange: (name: string) => void;
  onBotDescriptionChange: (description: string) => void;
  onAvatarChange: (avatar: string, personality: string) => void;
  onVoiceSettings: () => void;
  onGoogleAssistant: () => void;
}

export const BotConfiguration = ({
  botName,
  botDescription,
  botAvatar,
  onBotNameChange,
  onBotDescriptionChange,
  onAvatarChange,
  onVoiceSettings,
  onGoogleAssistant
}: BotConfigurationProps) => {
  const [nameError, setNameError] = useState<string>("");
  const [descError, setDescError] = useState<string>("");

  const handleNameChange = (value: string) => {
    const result = validateBotName(value);
    if (!result.isValid && value.length > 0) {
      setNameError(result.errors[0]);
    } else {
      setNameError("");
    }
    onBotNameChange(value);
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length > 300) {
      setDescError("Description must be less than 300 characters");
    } else {
      setDescError("");
    }
    onBotDescriptionChange(value);
  };

  const nameChars = botName.length;
  const descChars = botDescription.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-4 w-4" />
          Bot Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bot Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bot-name">Bot Name</Label>
            <span className={`text-xs ${nameChars > 90 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {nameChars}/100
            </span>
          </div>
          <Input
            id="bot-name"
            value={botName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="My AI Assistant"
            maxLength={100}
            aria-label="Bot name"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "name-error" : undefined}
          />
          {nameError && (
            <p id="name-error" className="text-xs text-destructive" role="alert">
              {nameError}
            </p>
          )}
        </div>

        {/* Bot Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bot-description">Personality</Label>
            <span className={`text-xs ${descChars > 270 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {descChars}/300
            </span>
          </div>
          <Textarea
            id="bot-description"
            value={botDescription}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="helpful and friendly"
            rows={2}
            maxLength={300}
            aria-label="Bot personality description"
            aria-invalid={!!descError}
            aria-describedby={descError ? "desc-error" : undefined}
          />
          {descError && (
            <p id="desc-error" className="text-xs text-destructive" role="alert">
              {descError}
            </p>
          )}
        </div>

        {/* Avatar Selector */}
        <div className="space-y-2">
          <Label>Avatar</Label>
          <OptimizedAvatarSelector
            selectedAvatar={botAvatar}
            onAvatarChange={(avatar, personality) => onAvatarChange(avatar, personality)}
          />
        </div>

        {/* Advanced Settings */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs text-muted-foreground">ADVANCED</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onVoiceSettings}
              className="justify-start"
              aria-label="Voice settings"
            >
              <Mic className="h-3.5 w-3.5 mr-2" />
              Voice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onGoogleAssistant}
              className="justify-start"
              aria-label="Google Assistant integration"
            >
              <Globe className="h-3.5 w-3.5 mr-2" />
              Assistant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
