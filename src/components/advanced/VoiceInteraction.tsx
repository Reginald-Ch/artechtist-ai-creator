import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Headphones,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface VoiceCommand {
  command: string;
  response: string;
  action?: () => void;
  confidence?: number;
}

interface VoiceSettings {
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  language: string;
  voice: string;
  listenOnWake: boolean;
  wakeWord: string;
}

interface VoiceInteractionProps {
  onCommand: (command: string, confidence: number) => void;
  onNavigate: (destination: string) => void;
  currentContext?: string;
  availableCommands?: VoiceCommand[];
}

export const VoiceInteraction: React.FC<VoiceInteractionProps> = ({
  onCommand,
  onNavigate,
  currentContext,
  availableCommands = []
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isWakeListening, setIsWakeListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    speechRate: 1,
    speechPitch: 1,
    speechVolume: 0.8,
    language: 'en-US',
    voice: 'default',
    listenOnWake: true,
    wakeWord: 'hey tutor'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([]);

  const recognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const { speak, stop, isPlaying } = useSpeechSynthesis();

  // Default voice commands
  const defaultCommands: VoiceCommand[] = [
    {
      command: 'start lesson',
      response: 'Starting your next lesson!',
      action: () => onNavigate('lessons')
    },
    {
      command: 'quiz me',
      response: 'Let\'s test your knowledge!',
      action: () => onNavigate('quiz')
    },
    {
      command: 'show progress',
      response: 'Here\'s your learning progress!',
      action: () => onNavigate('progress')
    },
    {
      command: 'help',
      response: 'I can help you navigate lessons, take quizzes, check progress, or answer questions about AI!',
    },
    {
      command: 'what can you do',
      response: 'I can help you learn AI through voice commands! Try saying "start lesson", "quiz me", "show progress", or ask me any AI question!',
    },
    {
      command: 'repeat',
      response: 'Let me repeat that for you.',
      action: () => speak(lastCommand)
    }
  ];

  const allCommands = [...defaultCommands, ...availableCommands];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      // Main recognition for commands
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceSettings.language;

      recognition.onresult = (event: any) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        const transcript = lastResult[0].transcript;
        const confidence = lastResult[0].confidence;

        setTranscript(transcript);
        setConfidence(confidence);

        if (lastResult.isFinal) {
          processVoiceCommand(transcript, confidence);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };

      recognitionRef.current = recognition;

      // Wake word recognition
      if (voiceSettings.listenOnWake) {
        const wakeRecognition = new (window as any).webkitSpeechRecognition();
        wakeRecognition.continuous = true;
        wakeRecognition.interimResults = false;
        wakeRecognition.lang = voiceSettings.language;

        wakeRecognition.onresult = (event: any) => {
          const lastResult = event.results[event.results.length - 1];
          const transcript = lastResult[0].transcript.toLowerCase();
          
          if (transcript.includes(voiceSettings.wakeWord.toLowerCase())) {
            toast.success('Wake word detected!');
            startListening();
          }
        };

        wakeRecognition.onerror = () => {
          // Silently restart wake word listening
          setTimeout(() => {
            if (voiceSettings.listenOnWake && !isListening) {
              wakeRecognition.start();
            }
          }, 1000);
        };

        wakeRecognitionRef.current = wakeRecognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (wakeRecognitionRef.current) {
        wakeRecognitionRef.current.stop();
      }
    };
  }, [voiceSettings]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Setup wake word listening
  useEffect(() => {
    if (voiceSettings.listenOnWake && wakeRecognitionRef.current && !isListening) {
      try {
        wakeRecognitionRef.current.start();
        setIsWakeListening(true);
      } catch (error) {
        console.warn('Wake word listening failed:', error);
      }
    } else if (wakeRecognitionRef.current) {
      wakeRecognitionRef.current.stop();
      setIsWakeListening(false);
    }

    return () => {
      if (wakeRecognitionRef.current) {
        wakeRecognitionRef.current.stop();
        setIsWakeListening(false);
      }
    };
  }, [voiceSettings.listenOnWake, isListening]);

  // Setup audio visualization
  const setupAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateWaveform = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioWaveform(Array.from(dataArray.slice(0, 32)));
          requestAnimationFrame(updateWaveform);
        }
      };

      if (isListening) {
        updateWaveform();
      }
    } catch (error) {
      console.error('Audio visualization setup failed:', error);
    }
  }, [isListening]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setupAudioVisualization();
      toast.success('🎤 Listening...');
    } catch (error) {
      console.error('Speech recognition start failed:', error);
      toast.error('Failed to start listening');
    }
  }, [isListening, setupAudioVisualization]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setAudioWaveform([]);
  }, []);

  const processVoiceCommand = useCallback((transcript: string, confidence: number) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    setLastCommand(transcript);
    
    // Find matching command
    const matchedCommand = allCommands.find(cmd => 
      normalizedTranscript.includes(cmd.command.toLowerCase()) ||
      cmd.command.toLowerCase().includes(normalizedTranscript)
    );

    if (matchedCommand) {
      // Execute the command
      speak(matchedCommand.response);
      
      if (matchedCommand.action) {
        setTimeout(() => {
          matchedCommand.action!();
        }, 1000);
      }
      
      toast.success(`Command recognized: ${matchedCommand.command}`);
    } else {
      // Pass to parent for processing
      onCommand(transcript, confidence);
      
      // Generic response
      speak(`I heard "${transcript}". Let me help you with that.`);
    }
  }, [allCommands, speak, onCommand]);

  const speakText = useCallback((text: string) => {
    // Apply voice settings
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.speechRate;
      utterance.pitch = voiceSettings.speechPitch;
      utterance.volume = voiceSettings.speechVolume;
      utterance.lang = voiceSettings.language;
      
      if (voiceSettings.voice !== 'default') {
        const voice = availableVoices.find(v => v.name === voiceSettings.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      speechSynthesis.speak(utterance);
    }
  }, [voiceSettings, availableVoices]);

  const toggleWakeListening = useCallback(() => {
    setVoiceSettings(prev => ({
      ...prev,
      listenOnWake: !prev.listenOnWake
    }));
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Main Voice Control */}
      <Card className="comic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Voice Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Control Button */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startListening}
              disabled={isListening}
              className={`relative w-24 h-24 rounded-full border-4 transition-all ${
                isListening 
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                  : 'border-primary bg-primary/10 hover:bg-primary/20'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {isListening ? (
                  <MicOff className="h-8 w-8 text-red-600" />
                ) : (
                  <Mic className="h-8 w-8 text-primary" />
                )}
              </div>
              
              {/* Audio Waveform Visualization */}
              {isListening && audioWaveform.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-16">
                    {audioWaveform.slice(0, 12).map((value, index) => (
                      <motion.div
                        key={index}
                        className="w-1 bg-red-500 rounded-full"
                        style={{ height: `${(value / 255) * 100}%` }}
                        animate={{ height: `${(value / 255) * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Listening Pulse Animation */}
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-red-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>

            <div className="mt-3">
              <Badge variant={isListening ? "destructive" : "outline"}>
                {isListening ? 'Listening...' : 'Tap to speak'}
              </Badge>
              {isWakeListening && !isListening && (
                <Badge variant="secondary" className="ml-2">
                  Wake word active
                </Badge>
              )}
            </div>
          </div>

          {/* Live Transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-3 bg-muted rounded-lg"
              >
                <div className="text-sm text-muted-foreground mb-1">You said:</div>
                <div className="font-medium">{transcript}</div>
                {confidence > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Confidence:</span>
                      <Progress value={confidence * 100} className="h-1 flex-1" />
                      <span>{Math.round(confidence * 100)}%</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakText("Voice assistant is ready to help you learn AI!")}
              disabled={isPlaying}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleWakeListening}
            >
              {voiceSettings.listenOnWake ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="comic-card">
              <CardHeader>
                <CardTitle className="text-lg">Voice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Speech Rate */}
                <div>
                  <label className="text-sm font-medium">Speech Rate</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Slow</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.speechRate}
                      onChange={(e) => setVoiceSettings(prev => ({
                        ...prev,
                        speechRate: parseFloat(e.target.value)
                      }))}
                      className="flex-1"
                    />
                    <span className="text-xs">Fast</span>
                  </div>
                </div>

                {/* Speech Pitch */}
                <div>
                  <label className="text-sm font-medium">Speech Pitch</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Low</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.speechPitch}
                      onChange={(e) => setVoiceSettings(prev => ({
                        ...prev,
                        speechPitch: parseFloat(e.target.value)
                      }))}
                      className="flex-1"
                    />
                    <span className="text-xs">High</span>
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <label className="text-sm font-medium">Volume</label>
                  <div className="flex items-center gap-2 mt-1">
                    <VolumeX className="h-4 w-4" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceSettings.speechVolume}
                      onChange={(e) => setVoiceSettings(prev => ({
                        ...prev,
                        speechVolume: parseFloat(e.target.value)
                      }))}
                      className="flex-1"
                    />
                    <Volume2 className="h-4 w-4" />
                  </div>
                </div>

                {/* Voice Selection */}
                <div>
                  <label className="text-sm font-medium">Voice</label>
                  <select
                    value={voiceSettings.voice}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      voice: e.target.value
                    }))}
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                  >
                    <option value="default">Default</option>
                    {availableVoices.map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wake Word */}
                <div>
                  <label className="text-sm font-medium">Wake Word</label>
                  <input
                    type="text"
                    value={voiceSettings.wakeWord}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      wakeWord: e.target.value
                    }))}
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                    placeholder="e.g., hey tutor"
                  />
                </div>

                <Button
                  onClick={() => speakText("Voice settings updated!")}
                  className="w-full"
                >
                  Test Voice Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available Commands */}
      <Card className="comic-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Voice Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allCommands.slice(0, 6).map((command, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">"{command.command}"</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground text-center">
            Say "{voiceSettings.wakeWord}" to activate voice control
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;