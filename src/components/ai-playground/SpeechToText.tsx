import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Star, Play } from 'lucide-react';
import { toast } from 'sonner';

interface SpeechToTextProps {
  onComplete: (score: number) => void;
}

const SAMPLE_PHRASES = [
  "Hello, my name is Alex!",
  "I love learning about artificial intelligence!",
  "This speech-to-text model is amazing!",
  "Technology makes learning so much fun!",
  "I can speak and the AI understands me!"
];

const SpeechToText: React.FC<SpeechToTextProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'setup' | 'practice' | 'complete'>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [accuracy, setAccuracy] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      // Check if browser supports speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        // Fallback to simple recording without recognition
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          // Simulate transcription
          simulateTranscription();
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        toast.success('Recording started! Say the phrase clearly.');
        return;
      }

      // Use Web Speech API if available
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('Listening... Say the phrase clearly!');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscribedText(transcript);
        calculateAccuracy(transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
        toast.error('Recognition error. Using simulation mode.');
        simulateTranscription();
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
      
    } catch (error) {
      toast.error('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const simulateTranscription = () => {
    // Simulate speech recognition with some variations
    const originalPhrase = SAMPLE_PHRASES[currentPhrase];
    const variations = [
      originalPhrase,
      originalPhrase.toLowerCase(),
      originalPhrase.replace(/!/g, '.'),
      originalPhrase.replace(/artificial intelligence/i, 'AI'),
    ];
    
    const transcribed = variations[Math.floor(Math.random() * variations.length)];
    setTranscribedText(transcribed);
    calculateAccuracy(transcribed);
  };

  const calculateAccuracy = (transcribed: string) => {
    const original = SAMPLE_PHRASES[currentPhrase].toLowerCase();
    const transcribedLower = transcribed.toLowerCase();
    
    // Simple word-based accuracy calculation
    const originalWords = original.split(' ');
    const transcribedWords = transcribedLower.split(' ');
    
    let matches = 0;
    originalWords.forEach(word => {
      if (transcribedWords.some(tWord => tWord.includes(word.replace(/[^\w]/g, '')))) {
        matches++;
      }
    });
    
    const accuracyPercent = Math.round((matches / originalWords.length) * 100);
    setAccuracy(prev => [...prev, accuracyPercent]);
    
    toast.success(`Accuracy: ${accuracyPercent}%`);
  };

  const nextPhrase = () => {
    if (currentPhrase < SAMPLE_PHRASES.length - 1) {
      setCurrentPhrase(prev => prev + 1);
      setTranscribedText('');
    } else {
      // Complete the exercise
      const avgAccuracy = accuracy.reduce((sum, acc) => sum + acc, 0) / accuracy.length;
      setFinalScore(Math.round(avgAccuracy));
      setStep('complete');
      onComplete(Math.round(avgAccuracy));
    }
  };

  const playExample = () => {
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(SAMPLE_PHRASES[currentPhrase]);
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const renderSetup = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <Mic className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Speech-to-Text Playground 🎤</CardTitle>
        <CardDescription className="text-lg">
          Convert your voice into text using AI! Practice with sample phrases.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">How it works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-3xl mb-2">🎤</div>
              <h4 className="font-medium">Speak</h4>
              <p className="text-sm text-muted-foreground">Say the phrase clearly</p>
            </Card>
            <Card className="p-4">
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-medium">AI Processes</h4>
              <p className="text-sm text-muted-foreground">AI converts speech to text</p>
            </Card>
            <Card className="p-4">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-medium">Text Output</h4>
              <p className="text-sm text-muted-foreground">See the transcribed text</p>
            </Card>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Practice Phrases ({SAMPLE_PHRASES.length} total)</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {SAMPLE_PHRASES.map((phrase, index) => (
              <div key={index} className="text-sm p-2 bg-muted rounded">
                {phrase}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => setStep('practice')} className="w-full" size="lg">
          Start Speech Practice! 🎤
        </Button>
      </CardContent>
    </Card>
  );

  const renderPractice = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          Speech-to-Text Practice
        </CardTitle>
        <CardDescription>
          Phrase {currentPhrase + 1} of {SAMPLE_PHRASES.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Say this phrase:</h3>
          <p className="text-xl font-medium text-blue-700 mb-4">
            "{SAMPLE_PHRASES[currentPhrase]}"
          </p>
          <Button
            onClick={playExample}
            disabled={isPlaying}
            variant="outline"
            className="mb-4"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            {isPlaying ? 'Playing...' : 'Play Example'}
          </Button>
        </div>

        <div className="text-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className="w-32 h-32 rounded-full text-lg"
          >
            {isRecording ? (
              <>
                <MicOff className="h-8 w-8 mb-2" />
                <div>Stop</div>
              </>
            ) : (
              <>
                <Mic className="h-8 w-8 mb-2" />
                <div>Record</div>
              </>
            )}
          </Button>
          {isRecording && (
            <div className="mt-4 text-red-600 font-medium animate-pulse">
              🔴 Recording... Speak now!
            </div>
          )}
        </div>

        {transcribedText && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-700 mb-2">AI Transcription:</h4>
              <p className="text-lg">{transcribedText}</p>
              {accuracy.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <Badge className="bg-green-500 text-white">
                    Accuracy: {accuracy[accuracy.length - 1]}%
                  </Badge>
                  <Button onClick={nextPhrase}>
                    {currentPhrase < SAMPLE_PHRASES.length - 1 ? 'Next Phrase' : 'Finish'} →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {accuracy.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Progress</h4>
            <div className="grid grid-cols-5 gap-2">
              {SAMPLE_PHRASES.map((_, index) => (
                <div
                  key={index}
                  className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                    index < accuracy.length
                      ? 'bg-green-500 text-white'
                      : index === currentPhrase
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < accuracy.length ? `${accuracy[index]}%` : index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <Star className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-green-700">
          🎉 Speech-to-Text Complete!
        </CardTitle>
        <CardDescription className="text-lg">
          You've mastered speech-to-text conversion!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-green-600">{finalScore}%</h3>
          <p className="text-green-700">Average Accuracy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Phrases Completed</h4>
            <p className="text-2xl font-bold text-blue-600">{accuracy.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Best Accuracy</h4>
            <p className="text-2xl font-bold text-purple-600">
              {accuracy.length > 0 ? Math.max(...accuracy) : 0}%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Individual Results</h4>
          <div className="grid grid-cols-5 gap-2">
            {accuracy.map((acc, index) => (
              <div key={index} className="p-2 bg-white rounded border text-center">
                <div className="text-xs text-muted-foreground">#{index + 1}</div>
                <div className="font-bold text-green-600">{acc}%</div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => {
          setStep('setup');
          setCurrentPhrase(0);
          setTranscribedText('');
          setAccuracy([]);
          setFinalScore(0);
        }} className="w-full" size="lg">
          Practice Again 🔄
        </Button>
      </CardContent>
    </Card>
  );

  switch (step) {
    case 'setup': return renderSetup();
    case 'practice': return renderPractice();
    case 'complete': return renderComplete();
    default: return renderSetup();
  }
};

export default SpeechToText;