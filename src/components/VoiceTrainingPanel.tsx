import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, Play, Pause, RotateCcw, Check, X, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

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
    };
  }, []);

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
        
        // Simulate transcription (in real app, would use speech-to-text API)
        simulateTranscription();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingProgress(0);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setRecordingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            stopRecording();
            return 100;
          }
          return prev + 2;
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
    setIsRecording(false);
    setRecordingProgress(0);
  };

  const simulateTranscription = () => {
    // Simulate transcription based on selected language
    const samplePhrases = {
      'en-US': ['Hello there!', 'How are you?', 'Can you help me?', 'Good morning!'],
      'sw-KE': ['Hujambo!', 'Habari yako?', 'Unaweza kunisaidia?', 'Habari za asubuhi!'],
      'zu-ZA': ['Sawubona!', 'Kunjani?', 'Ungangisiza?', 'Sawubona ekuseni!'],
      'fr-SN': ['Bonjour!', 'Comment allez-vous?', 'Pouvez-vous m\'aider?', 'Bonjour du matin!'],
    };
    
    const phrases = samplePhrases[selectedLanguage as keyof typeof samplePhrases] || samplePhrases['en-US'];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    setTimeout(() => {
      setTranscription(randomPhrase);
    }, 1000);
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
              <div className="flex justify-center">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className={`w-20 h-20 rounded-full ${isRecording ? '' : 'bg-green-500 hover:bg-green-600'}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!selectedIntent}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>
              
              {isRecording && (
                <div className="space-y-2">
                  <Progress value={recordingProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">Recording... {Math.round(recordingProgress)}%</p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                {isRecording ? 'Speak clearly in your selected language' : 'Click to start recording'}
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

            {/* Transcription Result */}
            {transcription && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Transcription:</label>
                  <Badge variant="outline" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    {africanLanguages.find(l => l.code === selectedLanguage)?.name}
                  </Badge>
                </div>
                <p className="text-sm bg-muted p-2 rounded">{transcription}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" onClick={acceptTranscription} className="flex-1">
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={rejectTranscription}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </div>
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