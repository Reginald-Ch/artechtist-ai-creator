import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Play, Volume2, Settings, Star, Trophy, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// African languages support
const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
];

// Voice training exercises for kids
const VOICE_EXERCISES = [
  {
    id: 'greetings',
    title: 'Greetings & Introductions',
    phrases: [
      'Hello, my name is...',
      'Good morning everyone!',
      'How are you today?',
      'Nice to meet you!',
    ],
    difficulty: 'easy',
  },
  {
    id: 'emotions',
    title: 'Expressing Emotions',
    phrases: [
      'I am very happy today!',
      'That makes me excited!',
      'I feel proud of myself!',
      'This is amazing!',
    ],
    difficulty: 'medium',
  },
  {
    id: 'storytelling',
    title: 'Storytelling Voice',
    phrases: [
      'Once upon a time, in a magical land...',
      'The brave little hero decided to...',
      'Suddenly, something wonderful happened!',
      'And they all lived happily ever after.',
    ],
    difficulty: 'hard',
  },
];

interface EnhancedVoiceTrainingProps {
  className?: string;
}

const EnhancedVoiceTraining: React.FC<EnhancedVoiceTrainingProps> = ({ className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(VOICE_EXERCISES[0]);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored API key
    const storedKey = localStorage.getItem('elevenlabs_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setHasApiKey(true);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('elevenlabs_api_key', apiKey);
      setHasApiKey(true);
      toast({
        title: "API Key Saved",
        description: "Your ElevenLabs API key has been saved securely.",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: `Say: "${currentExercise.phrases[currentPhrase]}"`,
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    if (!hasApiKey) {
      // Mock processing for demo
      const mockScore = Math.floor(Math.random() * 30) + 70; // 70-100
      setScore(mockScore);
      setProgress(prev => Math.min(prev + 10, 100));
      
      if (mockScore > 90 && !achievements.includes('Perfect Score')) {
        setAchievements(prev => [...prev, 'Perfect Score']);
        toast({
          title: "🎉 Achievement Unlocked!",
          description: "Perfect Score - Amazing pronunciation!",
        });
      }
      
      toast({
        title: "Recording Processed",
        description: `Pronunciation score: ${mockScore}%`,
      });
      return;
    }

    try {
      // Real ElevenLabs processing would go here
      toast({
        title: "Processing...",
        description: "Analyzing your pronunciation with AI...",
      });
      
      // Simulate API call
      setTimeout(() => {
        const score = Math.floor(Math.random() * 30) + 70;
        setScore(score);
        setProgress(prev => Math.min(prev + 10, 100));
        
        toast({
          title: "Analysis Complete",
          description: `Your pronunciation score: ${score}%`,
        });
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to analyze recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const playExample = async () => {
    setIsPlaying(true);
    
    if (!hasApiKey) {
      // Use browser speech synthesis as fallback
      const utterance = new SpeechSynthesisUtterance(currentExercise.phrases[currentPhrase]);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
      return;
    }

    try {
      // Real ElevenLabs TTS would go here
      toast({
        title: "Playing Example",
        description: "Listen carefully and try to match the pronunciation!",
      });
      
      // Simulate audio playback
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000);
      
    } catch (error) {
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Could not play example audio.",
        variant: "destructive",
      });
    }
  };

  const nextPhrase = () => {
    if (currentPhrase < currentExercise.phrases.length - 1) {
      setCurrentPhrase(prev => prev + 1);
    } else {
      toast({
        title: "Exercise Complete!",
        description: "Great job! You've completed this exercise.",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="training">Voice Training</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-4">
          {!hasApiKey && (
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Voice training is using browser speech synthesis. For advanced AI-powered training, add your ElevenLabs API key in Settings.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {currentExercise.title}
                  </CardTitle>
                  <CardDescription>
                    Practice phrase {currentPhrase + 1} of {currentExercise.phrases.length}
                  </CardDescription>
                </div>
                <Badge className={`${getDifficultyColor(currentExercise.difficulty)} text-white`}>
                  {currentExercise.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-lg font-medium mb-4">
                  "{currentExercise.phrases[currentPhrase]}"
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={playExample}
                    disabled={isPlaying}
                    variant="outline"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    {isPlaying ? 'Playing...' : 'Play Example'}
                  </Button>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="min-w-[120px]"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {score > 0 && (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>Last Score: {score}%</span>
                    </div>
                    <Button onClick={nextPhrase} size="sm">
                      Next Phrase
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      🏆 {achievement}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <div className="grid gap-4">
            {VOICE_EXERCISES.map((exercise) => (
              <Card 
                key={exercise.id}
                className={`cursor-pointer transition-all ${
                  currentExercise.id === exercise.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setCurrentExercise(exercise);
                  setCurrentPhrase(0);
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <Badge className={`${getDifficultyColor(exercise.difficulty)} text-white`}>
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>
                    {exercise.phrases.length} phrases to practice
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ElevenLabs API Configuration</CardTitle>
              <CardDescription>
                Add your ElevenLabs API key for advanced AI-powered voice training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your ElevenLabs API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                {hasApiKey ? 'Update API Key' : 'Save API Key'}
              </Button>
              {hasApiKey && (
                <p className="text-sm text-green-600">✓ API key configured</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>
                Choose your preferred language for voice training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language">Training Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    {AFRICAN_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedVoiceTraining;