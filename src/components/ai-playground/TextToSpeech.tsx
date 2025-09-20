import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Star, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface TextToSpeechProps {
  onComplete: (score: number) => void;
}

const SAMPLE_TEXTS = [
  "Hello everyone! Welcome to our AI playground!",
  "Artificial intelligence is amazing and full of possibilities!",
  "I love learning about technology and how it helps people!",
  "Speech synthesis makes computers sound more human!",
  "This text-to-speech model is really cool!"
];

const VOICE_OPTIONS = [
  { value: 'default', name: 'Default Voice', gender: 'neutral' },
  { value: 'male-1', name: 'Friendly Male', gender: 'male' },
  { value: 'female-1', name: 'Cheerful Female', gender: 'female' },
  { value: 'child', name: 'Kid Voice', gender: 'child' },
];

const TextToSpeech: React.FC<TextToSpeechProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'setup' | 'customize' | 'complete'>('setup');
  const [selectedText, setSelectedText] = useState(SAMPLE_TEXTS[0]);
  const [customText, setCustomText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [speechRate, setSpeechRate] = useState([1]);
  const [speechPitch, setSpeechPitch] = useState([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [completedSamples, setCompletedSamples] = useState<number>(0);
  const [finalScore, setFinalScore] = useState(0);

  const getTextToSpeak = () => {
    return customText.trim() || selectedText;
  };

  const speakText = () => {
    if (isPlaying) {
      // Stop current speech
      speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentUtterance(null);
      return;
    }

    const text = getTextToSpeak();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = speechRate[0];
    utterance.pitch = speechPitch[0];
    utterance.volume = 1;
    
    // Try to use a specific voice if available
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      switch (selectedVoice) {
        case 'male-1':
          const maleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('alex')
          );
          if (maleVoice) utterance.voice = maleVoice;
          break;
        case 'female-1':
          const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('karen')
          );
          if (femaleVoice) utterance.voice = femaleVoice;
          break;
        case 'child':
          // Use higher pitch for child-like voice
          utterance.pitch = Math.min(speechPitch[0] * 1.5, 2);
          utterance.rate = speechRate[0] * 1.1;
          break;
      }
    }
    
    utterance.onstart = () => {
      setIsPlaying(true);
      toast.success('Speaking... Listen to the AI voice!');
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentUtterance(null);
      setCompletedSamples(prev => prev + 1);
      toast.success('Speech complete! Try different settings or text.');
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentUtterance(null);
      toast.error('Speech error. Please try again.');
    };
    
    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  const completeExercise = () => {
    const score = Math.min(completedSamples * 20 + 60, 100); // Base 60 + 20 per sample
    setFinalScore(score);
    setStep('complete');
    onComplete(score);
  };

  const renderSetup = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Volume2 className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Text-to-Speech Playground 🔊</CardTitle>
        <CardDescription className="text-lg">
          Make AI speak your words with different voices and settings!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose Text to Speak</h3>
          
          <div className="space-y-3">
            <Label>Sample Texts</Label>
            <Select value={selectedText} onValueChange={setSelectedText}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a sample text" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_TEXTS.map((text, index) => (
                  <SelectItem key={index} value={text}>
                    {text.substring(0, 50)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="custom-text">Or Write Your Own</Label>
            <Textarea
              id="custom-text"
              placeholder="Type anything you want the AI to say..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
            />
          </div>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold mb-2">Preview Text:</h4>
            <p className="text-sm italic">"{getTextToSpeak()}"</p>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setStep('customize')} className="flex-1" size="lg">
            Customize Voice Settings →
          </Button>
          <Button onClick={speakText} variant="outline" size="lg">
            <Volume2 className="h-4 w-4 mr-2" />
            Quick Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCustomize = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Customize Your AI Voice 🎛️</CardTitle>
        <CardDescription>
          Experiment with different voice settings and hear the difference!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h4 className="font-semibold mb-2">Current Text:</h4>
          <p className="text-sm italic">"{getTextToSpeak()}"</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Voice Type</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map(voice => (
                    <SelectItem key={voice.value} value={voice.value}>
                      {voice.name} ({voice.gender})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Speaking Speed: {speechRate[0].toFixed(1)}x</Label>
              <Slider
                value={speechRate}
                onValueChange={setSpeechRate}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Voice Pitch: {speechPitch[0].toFixed(1)}</Label>
              <Slider
                value={speechPitch}
                onValueChange={setSpeechPitch}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-4 text-center">
              <h4 className="font-semibold mb-4">Voice Preview</h4>
              <Button
                onClick={speakText}
                size="lg"
                className={`w-32 h-32 rounded-full ${isPlaying ? 'bg-red-500 hover:bg-red-600' : ''}`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-8 w-8 mb-2" />
                    <div>Stop</div>
                  </>
                ) : (
                  <>
                    <Play className="h-8 w-8 mb-2" />
                    <div>Speak</div>
                  </>
                )}
              </Button>
              
              {isPlaying && (
                <div className="mt-4 text-red-600 font-medium animate-pulse">
                  🔊 Speaking...
                </div>
              )}
            </Card>

            <Card className="p-3 text-center bg-green-50 border-green-200">
              <h5 className="font-medium text-green-700">Samples Tried</h5>
              <p className="text-2xl font-bold text-green-600">{completedSamples}</p>
              <p className="text-xs text-green-600">Try different settings!</p>
            </Card>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('setup')}>
            ← Change Text
          </Button>
          <Button 
            onClick={completeExercise} 
            className="flex-1"
            disabled={completedSamples < 1}
          >
            Complete Exercise 🎉
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Star className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-purple-700">
          🎉 Text-to-Speech Master!
        </CardTitle>
        <CardDescription className="text-lg">
          You've learned how to make AI speak with different voices!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-purple-600">{finalScore}%</h3>
          <p className="text-purple-700">Achievement Score</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Voice Samples</h4>
            <p className="text-2xl font-bold text-blue-600">{completedSamples}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Voices Tried</h4>
            <p className="text-2xl font-bold text-green-600">{VOICE_OPTIONS.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Settings Explored</h4>
            <p className="text-2xl font-bold text-purple-600">Multiple</p>
          </div>
        </div>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-700 mb-2">🎓 What You Learned</h4>
          <ul className="text-left text-sm text-yellow-700 space-y-1">
            <li>• How to make computers speak text</li>
            <li>• Different voice types and settings</li>
            <li>• Speed and pitch control</li>
            <li>• Real applications of text-to-speech</li>
          </ul>
        </Card>

        <Button onClick={() => {
          setStep('setup');
          setCustomText('');
          setSelectedText(SAMPLE_TEXTS[0]);
          setCompletedSamples(0);
          setFinalScore(0);
          setSpeechRate([1]);
          setSpeechPitch([1]);
          setSelectedVoice('default');
        }} className="w-full" size="lg">
          Try Different Texts 🔄
        </Button>
      </CardContent>
    </Card>
  );

  switch (step) {
    case 'setup': return renderSetup();
    case 'customize': return renderCustomize();
    case 'complete': return renderComplete();
    default: return renderSetup();
  }
};

export default TextToSpeech;