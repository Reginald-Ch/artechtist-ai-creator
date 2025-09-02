import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VoiceTrainingExercise {
  id: string;
  title: string;
  phrases: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
}

interface ElevenLabsVoiceTrainingProps {
  exercise: VoiceTrainingExercise;
  onComplete: (score: number) => void;
  onNext: () => void;
}

const ElevenLabsVoiceTraining: React.FC<ElevenLabsVoiceTrainingProps> = ({
  exercise,
  onComplete,
  onNext
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load ElevenLabs API key from localStorage
    const storedApiKey = localStorage.getItem('elevenlabs_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const currentPhrase = exercise.phrases[currentPhraseIndex];
  const progress = ((currentPhraseIndex + 1) / exercise.phrases.length) * 100;

  const playExample = async () => {
    if (!apiKey) {
      toast.error('Please configure your ElevenLabs API key first');
      return;
    }

    setIsPlaying(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: currentPhrase,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing example:', error);
      toast.error('Failed to play example audio');
    } finally {
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        analyzeRecording(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started. Speak the phrase clearly.');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const analyzeRecording = async (audioBlob: Blob) => {
    // Simulate analysis - in a real implementation, you would:
    // 1. Convert audio to text using speech recognition
    // 2. Compare with the target phrase
    // 3. Calculate pronunciation accuracy
    
    const randomScore = Math.floor(Math.random() * 40) + 60; // 60-100%
    setScore(randomScore);
    
    const feedbackMessages = {
      excellent: "Excellent pronunciation! Great job!",
      good: "Good pronunciation with minor areas for improvement.",
      fair: "Fair pronunciation. Try speaking more clearly.",
      poor: "Needs improvement. Focus on clarity and pace."
    };

    let feedbackKey: keyof typeof feedbackMessages;
    if (randomScore >= 90) feedbackKey = 'excellent';
    else if (randomScore >= 75) feedbackKey = 'good';
    else if (randomScore >= 60) feedbackKey = 'fair';
    else feedbackKey = 'poor';

    setFeedback(feedbackMessages[feedbackKey]);

    // Save progress to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('voice_training_progress').upsert({
          user_id: user.id,
          exercise_id: exercise.id,
          language_code: exercise.language,
          completed_phrases: currentPhraseIndex + 1,
          total_phrases: exercise.phrases.length,
          accuracy_score: randomScore
        });
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }

    toast.success(`Score: ${randomScore}%`);
  };

  const nextPhrase = () => {
    if (currentPhraseIndex < exercise.phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setScore(0);
      setFeedback('');
    } else {
      onComplete(score);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{exercise.title}</CardTitle>
          <Badge className={getDifficultyColor(exercise.difficulty)}>
            {exercise.difficulty}
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">
          Phrase {currentPhraseIndex + 1} of {exercise.phrases.length}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Practice this phrase:</h3>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xl font-medium">{currentPhrase}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={playExample}
            disabled={isPlaying}
            variant="outline"
            size="lg"
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Play Example
          </Button>

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
          >
            {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isRecording ? 'Stop Recording' : 'Record'}
          </Button>
        </div>

        {score > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">Score: {score}%</div>
                <Progress value={score} className="w-full" />
                <p className="text-sm text-muted-foreground">{feedback}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {score > 0 && (
          <div className="flex justify-center">
            <Button onClick={nextPhrase} size="lg">
              {currentPhraseIndex < exercise.phrases.length - 1 ? (
                <>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Next Phrase
                </>
              ) : (
                'Complete Exercise'
              )}
            </Button>
          </div>
        )}

        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      </CardContent>
    </Card>
  );
};

export default ElevenLabsVoiceTraining;