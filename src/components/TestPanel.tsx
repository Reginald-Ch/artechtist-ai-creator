import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Send, Bot, User, Mic, Volume2, MicOff, VolumeX, Settings, Zap, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConversationEngine } from "@/hooks/useConversationEngine";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isVoice?: boolean;
}

interface TestPanelProps {
  onClose: () => void;
  nodes?: any[];
  edges?: any[];
  botName?: string;
  botPersonality?: string;
}

interface VoiceSettings {
  voiceId: string;
  voiceName: string;
  pitch: number;
  speed: number;
  enabled: boolean;
}

const TestPanel = ({ onClose, nodes = [], edges = [], botName = "AI Assistant", botPersonality = "helpful and friendly" }: TestPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Sanibonani! I'm your AI assistant. Try asking me something in English, Zulu, Swahili, or French!",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
    voiceName: 'Sarah',
    pitch: 1.0,
    speed: 1.0,
    enabled: true,
  });
  const [googleAssistantConnected, setGoogleAssistantConnected] = useState(false);
  const [botLanguage, setBotLanguage] = useState('en');
  
  const { toast } = useToast();
  const recognition = useRef<any>(null);
  const synthesis = useRef<any>(null);
  
  // Initialize conversation engine
  const { processUserInput, resetConversation } = useConversationEngine(nodes, edges, botPersonality);

  // Available voices for African learners
  const availableVoices = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', accent: 'Global English', flag: '🌍' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', accent: 'British English', flag: '🇬🇧' },
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', accent: 'American English', flag: '🇺🇸' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', accent: 'Warm & Friendly', flag: '💫' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇪🇬' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = botLanguage === 'en' ? 'en-US' : 
                                  botLanguage === 'zu' ? 'zu-ZA' :
                                  botLanguage === 'sw' ? 'sw-KE' :
                                  botLanguage === 'fr' ? 'fr-FR' :
                                  botLanguage === 'ar' ? 'ar-EG' :
                                  botLanguage === 'am' ? 'am-ET' : 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        toast({
          title: "Voice captured! 🎤",
          description: `I heard: "${transcript}"`,
        });
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again",
          variant: "destructive",
        });
      };
    }

    // Initialize speech synthesis
    synthesis.current = window.speechSynthesis;
  }, [botLanguage, toast]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      isVoice: isRecording,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsRecording(false);

    // Process input through conversation engine
    try {
      const result = await processUserInput(inputValue);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      // Speak the response if voice is enabled
      if (voiceSettings.enabled) {
        speakText(botResponse.text);
      }
      
      // Show debug info if intent was matched
      if (result.matchedIntent) {
        toast({
          title: `Intent: ${result.matchedIntent}`,
          description: `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
        });
      }
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Error processing message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleVoiceInput = () => {
    if (!recognition.current) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setIsRecording(true);
      recognition.current.start();
      toast({
        title: "Listening... 🎤",
        description: "Speak clearly in your chosen language",
      });
    }
  };

  const speakText = async (text: string) => {
    if (!voiceSettings.enabled || !synthesis.current) return;

    // Cancel any ongoing speech
    synthesis.current.cancel();

    // For production, you would integrate with ElevenLabs API here
    // For now, using browser's built-in speech synthesis
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.speed;
    utterance.pitch = voiceSettings.pitch;
    utterance.lang = botLanguage === 'en' ? 'en-US' : 
                     botLanguage === 'fr' ? 'fr-FR' : 'en-US';
    
    synthesis.current.speak(utterance);
    
    toast({
      title: "🔊 Speaking...",
      description: "Bot is responding with voice",
    });
  };

  const connectGoogleAssistant = () => {
    setGoogleAssistantConnected(!googleAssistantConnected);
    toast({
      title: googleAssistantConnected ? "Disconnected from Google Assistant" : "Connected to Google Assistant! 🎉",
      description: googleAssistantConnected 
        ? "Your bot is no longer linked to Google Assistant" 
        : "Your bot can now work with smart speakers and Google devices!",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-96 border-l bg-background flex flex-col h-full">
      <Card className="border-0 rounded-none h-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              Test Your Bot
              {googleAssistantConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Globe className="h-3 w-3 mr-1" />
                  GA Connected
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex-1 flex flex-col">
          {/* Settings Panel */}
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'bot' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex flex-col gap-1">
                        <div
                          className={`max-w-xs rounded-lg p-3 text-sm ${
                            message.sender === 'user'
                              ? 'bg-orange-500 text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {message.text}
                          {message.isVoice && (
                            <Mic className="h-3 w-3 ml-2 inline opacity-70" />
                          )}
                        </div>
                        {message.sender === 'bot' && voiceSettings.enabled && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs w-fit"
                            onClick={() => speakText(message.text)}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Replay
                          </Button>
                        )}
                      </div>
                      
                      {message.sender === 'user' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-orange-500 text-white text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted text-foreground rounded-lg p-3 text-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4 space-y-3">
                <div className="flex gap-2">
                  <Button 
                    variant={isListening ? "destructive" : "outline"} 
                    size="sm" 
                    className="flex-1"
                    onClick={handleVoiceInput}
                  >
                    {isListening ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                    {isListening ? 'Stop' : 'Voice'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  >
                    {voiceSettings.enabled ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
                    {voiceSettings.enabled ? 'Sound On' : 'Sound Off'}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Type in ${languages.find(l => l.code === botLanguage)?.name}...`}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  {isRecording && "🎤 Voice message will be sent"}
                  {!isRecording && "Test your AI in multiple African languages"}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-4 space-y-6">
              {/* Language Settings */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language & Region
                </h4>
                <Select value={botLanguage} onValueChange={setBotLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          {lang.flag} {lang.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Settings */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Voice Character
                </h4>
                <Select 
                  value={voiceSettings.voiceId} 
                  onValueChange={(value) => {
                    const voice = availableVoices.find(v => v.id === value);
                    setVoiceSettings(prev => ({ 
                      ...prev, 
                      voiceId: value, 
                      voiceName: voice?.name || 'Sarah' 
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <span className="flex items-center gap-2">
                          {voice.flag} {voice.name} - {voice.accent}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Speed */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Speed: {voiceSettings.speed.toFixed(1)}x
                </label>
                <Slider
                  value={[voiceSettings.speed]}
                  onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, speed: value }))}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Voice Pitch */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Pitch: {voiceSettings.pitch.toFixed(1)}
                </label>
                <Slider
                  value={[voiceSettings.pitch]}
                  onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, pitch: value }))}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Google Assistant Integration */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Smart Speaker Integration
                </h4>
                <Button
                  variant={googleAssistantConnected ? "destructive" : "default"}
                  onClick={connectGoogleAssistant}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {googleAssistantConnected ? 'Disconnect' : 'Connect'} Google Assistant
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Connect your bot to Google Assistant and smart speakers for hands-free interaction
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default TestPanel;