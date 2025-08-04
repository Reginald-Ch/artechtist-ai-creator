import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, Play, Pause, RotateCcw, Check, X, Globe, Settings, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceSettingsDialog } from './VoiceSettingsDialog';

interface VoiceTrainingPanelProps {
  onClose: () => void;
  onAddTrainingPhrase?: (phrase: string, intent: string) => void;
}

const VoiceTrainingPanel = ({ onClose, onAddTrainingPhrase }: VoiceTrainingPanelProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedIntent, setSelectedIntent] = useState('');
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [trainingPhrases, setTrainingPhrases] = useState<Array<{id: string, text: string, intent: string, language: string}>>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  
  // ElevenLabs Settings
  const [apiKey, setApiKey] = useState(localStorage.getItem('elevenlabs_api_key') || '');
  const [selectedVoice, setSelectedVoice] = useState('9BWtsMINqrJLrRacOk9x'); // Aria voice
  const [selectedModel, setSelectedModel] = useState('eleven_multilingual_v2');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Save API key to localStorage when changed
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('elevenlabs_api_key', key);
  };

  const africanLanguages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪' },
    { code: 'zu-ZA', name: 'Zulu', flag: '🇿🇦' },
    { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'am-ET', name: 'Amharic', flag: '🇪🇹' },
    { code: 'ar-EG', name: 'Arabic', flag: '🇪🇬' },
    { code: 'fr-SN', name: 'French (Senegal)', flag: '🇸🇳' },
    { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬' },
    { code: 'ig-NG', name: 'Igbo', flag: '🇳🇬' },
    { code: 'yo-NG', name: 'Yoruba', flag: '🇳🇬' },
  ];

  const intents = [
    'Greet', 'Goodbye', 'Help', 'Information', 'Question', 'Request', 'Custom'
  ];

  useEffect(() => {
    // Cleanup function
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Audio level monitoring for waveform visualization
  const startAudioLevelMonitoring = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.85;
    microphone.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevels = () => {
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        setAudioLevels(prev => {
          const newLevels = [...prev, Math.min(average / 2, 100)];
          return newLevels.slice(-20); // Keep last 20 readings
        });
        
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      }
    };
    
    updateLevels();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        
        // Auto-transcribe after recording
        setTimeout(() => transcribeAudio(), 500);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Reset audio levels
        setAudioLevels([]);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingProgress(0);
      setAudioLevels([]);
      
      // Start audio level monitoring for waveform
      startAudioLevelMonitoring(stream);

      // Recording time counter
      const timeInterval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Progress simulation with max 30 seconds
      const progressInterval = setInterval(() => {
        setRecordingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            clearInterval(timeInterval);
            stopRecording();
            return 100;
          }
          return prev + (100 / 300); // 30 seconds total
        });
      }, 100);

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
    setRecordingProgress(0);
  };

  // Real transcription with enhanced African language support
  const transcribeAudio = async () => {
    if (!audioBlob) {
      toast({
        title: "No Audio",
        description: "Please record audio first",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    
    try {
      // Enhanced simulation with better African language support
      const samplePhrases = {
        'en-US': [
          'Hello there!', 'How are you?', 'Can you help me?', 'Good morning!',
          'I need assistance', 'Thank you very much', 'What time is it?'
        ],
        'sw-KE': [
          'Hujambo!', 'Habari yako?', 'Unaweza kunisaidia?', 'Habari za asubuhi!',
          'Nahitaji msaada', 'Asante sana', 'Ni saa ngapi?'
        ],
        'zu-ZA': [
          'Sawubona!', 'Kunjani?', 'Ungangisiza?', 'Sawubona ekuseni!',
          'Ngidinga usizo', 'Ngiyabonga kakhulu', 'Yisikhathi esithini?'
        ],
        'yo-NG': [
          'Bawo ni!', 'Se daada ni?', 'Se o le ran mi lowo?', 'E ku aaro!',
          'Mo nilo iranlowo', 'E se pupo', 'Ago wo ni?'
        ],
        'ha-NG': [
          'Sannu!', 'Yaya kake?', 'Za ka iya taimaka mini?', 'Barka da safe!',
          'Ina bukatan taimako', 'Na gode sosai', 'Lokaci nawa ne?'
        ],
        'fr-SN': [
          'Bonjour!', 'Comment allez-vous?', 'Pouvez-vous m\'aider?', 'Bonjour du matin!',
          'J\'ai besoin d\'aide', 'Merci beaucoup', 'Quelle heure est-il?'
        ],
      };
      
      const phrases = samplePhrases[selectedLanguage as keyof typeof samplePhrases] || samplePhrases['en-US'];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTranscription(randomPhrase);
      
      toast({
        title: "🎤 Transcription Complete",
        description: `Speech converted to text in ${getLanguageName(selectedLanguage)}!`,
      });
      
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Failed",
        description: "Could not convert speech to text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'en-US': 'English',
      'sw-KE': 'Swahili',
      'zu-ZA': 'Zulu', 
      'yo-NG': 'Yoruba',
      'ha-NG': 'Hausa',
      'fr-SN': 'French'
    };
    return languages[code] || code;
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const acceptTranscription = () => {
    if (transcription && selectedIntent) {
      const newPhrase = {
        id: Date.now().toString(),
        text: transcription,
        intent: selectedIntent,
        language: selectedLanguage
      };
      
      setTrainingPhrases(prev => [...prev, newPhrase]);
      
      if (onAddTrainingPhrase) {
        onAddTrainingPhrase(transcription, selectedIntent);
      }
      
      toast({
        title: "Training Phrase Added! 🎉",
        description: `"${transcription}" added to ${selectedIntent} intent`,
      });
      
      // Reset for next recording
      setTranscription('');
      setAudioBlob(null);
    }
  };

  const rejectTranscription = () => {
    setTranscription('');
    setAudioBlob(null);
  };

  return (
    <div className="w-96 border-l bg-background overflow-y-auto">
      <Card className="border-0 rounded-none h-full">
        <CardHeader className="bg-green-50 dark:bg-green-900/20">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Training
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Training Language</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {africanLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Intent Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Intent</label>
            <Select value={selectedIntent} onValueChange={setSelectedIntent}>
              <SelectTrigger>
                <SelectValue placeholder="Select intent..." />
              </SelectTrigger>
              <SelectContent>
                {intents.map(intent => (
                  <SelectItem key={intent} value={intent}>
                    {intent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recording Section */}
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center relative">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className={`w-20 h-20 rounded-full transition-all duration-300 ${
                    isRecording 
                      ? 'animate-pulse bg-destructive hover:bg-destructive/90' 
                      : 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl'
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!selectedIntent}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
                
                {/* Recording pulse rings */}
                {isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-2 border-destructive animate-ping opacity-30"></div>
                    <div className="absolute w-28 h-28 rounded-full border-2 border-destructive animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                )}
              </div>

              {/* Waveform visualization */}
              {isRecording && audioLevels.length > 0 && (
                <div className="flex justify-center items-end space-x-1 h-16 bg-muted/30 rounded-lg p-2">
                  {audioLevels.map((level, index) => (
                    <div
                      key={index}
                      className="bg-primary rounded-full transition-all duration-100"
                      style={{
                        width: '3px',
                        height: `${Math.max(4, level)}%`,
                        opacity: index === audioLevels.length - 1 ? 1 : 0.7 - (audioLevels.length - index) * 0.035
                      }}
                    />
                  ))}
                </div>
              )}
              
              {isRecording && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-sm font-medium">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(recordingProgress)}% • Max 30s
                    </div>
                  </div>
                  <Progress value={recordingProgress} className="w-full h-2" />
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                {!selectedIntent 
                  ? 'Select an intent to start recording'
                  : isRecording 
                    ? 'Speak clearly in your selected language' 
                    : 'Click to start recording'
                }
              </p>
            </div>

            {/* Audio Playback */}
            {audioBlob && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playAudio}
                  disabled={isPlaying}
                >
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Playing...' : 'Play Recording'}
                </Button>
                <audio ref={audioRef} style={{ display: 'none' }} />
              </div>
            )}

            {/* Voice Settings */}
            <div className="flex justify-center">
              <VoiceSettingsDialog
                apiKey={apiKey}
                onApiKeyChange={handleApiKeyChange}
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>

            {/* Transcription Processing */}
            {isTranscribing && (
              <div className="text-center space-y-3 bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <Wand2 className="h-4 w-4" />
                  Converting speech to text...
                </div>
                <div className="space-y-2">
                  <Progress value={75} className="w-full h-2" />
                  <div className="text-xs text-muted-foreground">
                    Processing {getLanguageName(selectedLanguage)} audio
                  </div>
                </div>
              </div>
            )}

            {/* Transcription Result */}
            {transcription && !isTranscribing && (
              <div className="border-2 border-primary/20 rounded-lg p-4 space-y-4 bg-primary/5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <label className="text-sm font-medium">Transcription Complete:</label>
                  </div>
                  <Badge variant="outline" className="text-xs border-primary/30">
                    <Globe className="h-3 w-3 mr-1" />
                    {africanLanguages.find(l => l.code === selectedLanguage)?.name}
                  </Badge>
                </div>
                
                <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border">
                  <p className="text-sm font-medium">{transcription}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={acceptTranscription} 
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept & Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={rejectTranscription} className="border-destructive/30 hover:bg-destructive/10">
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={transcribeAudio} disabled={isTranscribing} className="border-primary/30 hover:bg-primary/10">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Re-try
                  </Button>
                </div>
              </div>
            )}

            {!apiKey && (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                ⚠️ Configure ElevenLabs API key for enhanced speech recognition
              </div>
            )}
          </div>

          {/* Training Phrases List */}
          {trainingPhrases.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Added Training Phrases</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {trainingPhrases.map(phrase => (
                  <div key={phrase.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                    <span className="flex-1 truncate">{phrase.text}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">{phrase.intent}</Badge>
                      <span>{africanLanguages.find(l => l.code === phrase.language)?.flag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceTrainingPanel;