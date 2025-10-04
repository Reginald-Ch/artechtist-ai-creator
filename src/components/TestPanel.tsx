import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Send, Bot, User, Mic, Volume2, MicOff, VolumeX, Settings, Zap, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useConversationEngine } from "@/hooks/useConversationEngine";
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
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
  const [botLanguage, setBotLanguage] = useState('en');
  const [savedBotAvatar, setSavedBotAvatar] = useState('🤖');
  
  const recognition = useRef<any>(null);
  const synthesis = useRef<any>(null);
  
  // Load saved avatar for consistency
  useEffect(() => {
    const savedAvatar = localStorage.getItem('bot-avatar-selection');
    if (savedAvatar) {
      setSavedBotAvatar(savedAvatar);
    }
  }, []);
  
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
          title: t('testPanel.voiceCaptured'),
          description: `I heard: "${transcript}"`,
        });
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: t('botBuilder.voiceRecognitionError'),
          description: t('common.retry'),
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
    
    // Get available voices
    const voices = synthesis.current.getVoices();
    let selectedVoice = null;
    
    // Enhanced voice mapping based on ElevenLabs voice IDs
    const voiceMap: Record<string, 'female' | 'male'> = {
      // Female voices
      'EXAVITQu4vr4xnSDxMaL': 'female', // Sarah
      '9BWtsMINqrJLrRacOk9x': 'female', // Aria
      'FGY2WhTYpPnrIDTdsKH5': 'female', // Laura
      'XB0fDUnXU5powFXDhCwa': 'female', // Charlotte
      'Xb7hH8MSUJpSbSDYk0k2': 'female', // Alice
      'XrExE9yKIg1WjnnlVkGX': 'female', // Matilda
      'cgSgspJ2msm6clMCkdW9': 'female', // Jessica
      'pFZP5JQG7iQjIQuC4Bku': 'female', // Lily
      
      // Male voices
      'CwhRBWXzGAHq8TQ4Fs17': 'male', // Roger
      'IKne3meq5aSn9XLyUdCD': 'male', // Charlie
      'JBFqnCBsd6RMkjVDRZzb': 'male', // George
      'N2lVS1w4EtoT3dr4eOWO': 'male', // Callum
      'TX3LPaxmHKxFdv7VOQHJ': 'male', // Liam
      'bIHbv24MWmeRgasZH58o': 'male', // Will
      'cjVigY5qzO86Huf0OWal': 'male', // Eric
      'iP95p4xoKVk53GoZ742B': 'male', // Chris
      'nPczCjzI2devNBz1zQrb': 'male', // Brian
      'onwK4e9ZLuTAKqWW03F9': 'male', // Daniel
      'pqHfZKP75CvOlQylNhV4': 'male', // Bill
    };
    
    const preferredGender = voiceMap[voiceSettings.voiceId] || 'female';
    const targetLang = botLanguage === 'en' ? 'en' : botLanguage === 'fr' ? 'fr' : 'en';
    
    // Find voice matching language and gender
    if (preferredGender === 'female') {
      selectedVoice = voices.find(voice => 
        voice.lang.includes(targetLang) && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('victoria'))
      );
    } else {
      selectedVoice = voices.find(voice => 
        voice.lang.includes(targetLang) && 
        (voice.name.toLowerCase().includes('male') || 
         voice.name.toLowerCase().includes('man') ||
         voice.name.toLowerCase().includes('daniel') ||
         voice.name.toLowerCase().includes('alex'))
      );
    }
    
    // Fallback to any voice in the target language
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.includes(targetLang));
    }
    
    // Ultimate fallback to first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    synthesis.current.speak(utterance);
    
    toast({
      title: "🔊 Speaking...",
      description: selectedVoice ? `Using ${selectedVoice.name}` : "Bot is responding with voice",
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
              {t('testPanel.testYourBot')}
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
              <TabsTrigger value="chat">{t('testPanel.chat')}</TabsTrigger>
              <TabsTrigger value="settings">{t('testPanel.settings')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              {/* Messages */}
              <div className="flex-none mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('testPanel.testYourChatbot')}
                </h2>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                     <div
                      key={message.id}
                      className={`flex gap-3 max-w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'bot' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                            {savedBotAvatar}
                          </div>
                        </div>
                      )}
                      
                     <div className={`flex flex-col gap-1 min-w-0 max-w-[80%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-xl px-4 py-3 shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground'
                              : 'bg-gradient-to-r from-muted to-muted/80 text-foreground'
                          }`}
                          style={{ 
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '400px',
                            overflowY: 'auto'
                          }}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.text}
                            {message.isVoice && (
                              <Mic className="h-3 w-3 ml-2 inline opacity-70" />
                            )}
                          </p>
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
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                          {savedBotAvatar}
                        </div>
                      </div>
                      <div className="bg-muted text-foreground rounded-xl px-4 py-3 shadow-sm">
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

              {/* Input Area - Improved responsiveness */}
              <div className="border-t p-4 space-y-3 flex-shrink-0">
                <div className="flex gap-2">
                  <Button 
                    variant={isListening ? "destructive" : "outline"} 
                    size="sm" 
                    className="flex-1 min-w-0"
                    onClick={handleVoiceInput}
                  >
                    {isListening ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                    {isListening ? t('common.stop') : t('playground.voice')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 min-w-0"
                    onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  >
                    {voiceSettings.enabled ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
                    {voiceSettings.enabled ? t('botBuilder.soundOn') : t('botBuilder.soundOff')}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('testPanel.typeMessage')}
                    className="flex-1 min-w-0 text-sm"
                    style={{ 
                      wordWrap: 'break-word', 
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground text-center break-words">
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

            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default TestPanel;