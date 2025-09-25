import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Brain, Star, Smile, Frown, Angry } from 'lucide-react';
import { toast } from 'sonner';

interface TextClassifierProps {
  onComplete: (score: number) => void;
}

interface TrainingText {
  id: string;
  text: string;
  emotion: string;
}

const EMOTIONS = [
  { label: 'Happy', value: 'happy', icon: '😊', color: 'bg-green-500' },
  { label: 'Sad', value: 'sad', icon: '😢', color: 'bg-blue-500' },
  { label: 'Angry', value: 'angry', icon: '😠', color: 'bg-red-500' },
];

const SAMPLE_TEXTS = {
  happy: [
    "I'm so excited for the weekend!",
    "This is the best day ever!",
    "I love spending time with my friends",
    "That movie was amazing!"
  ],
  sad: [
    "I'm feeling really down today",
    "I miss my pet so much",
    "This homework is too hard",
    "I wish I could see my grandparents"
  ],
  angry: [
    "That's not fair at all!",
    "I'm so frustrated with this",
    "Why won't anyone listen to me?",
    "This makes me really mad"
  ]
};

const TextClassifier: React.FC<TextClassifierProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'data' | 'training' | 'testing' | 'play'>('data');
  const [trainingTexts, setTrainingTexts] = useState<TrainingText[]>([]);
  const [newText, setNewText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [testText, setTestText] = useState('');
  const [prediction, setPrediction] = useState<{ emotion: string; confidence: number } | null>(null);
  const [score, setScore] = useState(0);

  const addTrainingText = () => {
    if (newText.trim() && selectedEmotion) {
      const newTraining: TrainingText = {
        id: Date.now().toString(),
        text: newText.trim(),
        emotion: selectedEmotion
      };
      setTrainingTexts([...trainingTexts, newTraining]);
      setNewText('');
      setSelectedEmotion('');
      toast.success('Training text added!');
    }
  };

  const removeTrainingText = (id: string) => {
    setTrainingTexts(trainingTexts.filter(t => t.id !== id));
  };

  const addSampleTexts = () => {
    const sampleTrainingTexts: TrainingText[] = [];
    
    EMOTIONS.forEach(emotion => {
      SAMPLE_TEXTS[emotion.value as keyof typeof SAMPLE_TEXTS].forEach((text, index) => {
        sampleTrainingTexts.push({
          id: `${emotion.value}-${index}`,
          text,
          emotion: emotion.value
        });
      });
    });

    setTrainingTexts(sampleTrainingTexts);
    toast.success('Sample training texts added!');
  };

  const startTraining = async () => {
    if (trainingTexts.length < 6) {
      toast.error('Add at least 2 texts per emotion to start training!');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setStep('training');

    // Simulate training process
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + 12;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setStep('testing');
          toast.success('🎉 Text classifier trained! Now test it with your own text!');
          return 100;
        }
        return newProgress;
      });
    }, 600);
  };

  const testModel = () => {
    if (!testText.trim()) {
      toast.error('Please enter some text to test!');
      return;
    }

    // Simulate prediction based on keywords
    const text = testText.toLowerCase();
    let predictedEmotion = 'happy';
    let confidence = 70;

    if (text.includes('sad') || text.includes('down') || text.includes('miss') || text.includes('hard') || text.includes('difficult')) {
      predictedEmotion = 'sad';
      confidence = Math.floor(Math.random() * 20) + 75;
    } else if (text.includes('angry') || text.includes('mad') || text.includes('frustrated') || text.includes('fair') || text.includes('hate')) {
      predictedEmotion = 'angry';
      confidence = Math.floor(Math.random() * 20) + 80;
    } else if (text.includes('happy') || text.includes('excited') || text.includes('love') || text.includes('amazing') || text.includes('best')) {
      predictedEmotion = 'happy';
      confidence = Math.floor(Math.random() * 20) + 85;
    } else {
      confidence = Math.floor(Math.random() * 30) + 60;
    }

    setPrediction({ emotion: predictedEmotion, confidence });
    
    const finalScore = confidence + Math.floor(Math.random() * 15);
    setScore(finalScore);
    
    setTimeout(() => {
      setStep('play');
      onComplete(finalScore);
    }, 2000);
  };

  const getTextsPerEmotion = (emotion: string) => {
    return trainingTexts.filter(t => t.emotion === emotion).length;
  };

  const getEmotionData = (emotion: string) => {
    return EMOTIONS.find(e => e.value === emotion);
  };

  const renderSetup = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Text Emotion Classifier 💬</CardTitle>
        <CardDescription className="text-lg">
          Train AI to understand emotions in text: happy, sad, or angry!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EMOTIONS.map(emotion => (
            <Card key={emotion.value} className="text-center">
              <CardContent className="p-4">
                <div className="text-3xl mb-2">{emotion.icon}</div>
                <h3 className="font-semibold">{emotion.label}</h3>
                <Badge variant="secondary" className="mt-2">
                  {getTextsPerEmotion(emotion.value)} texts
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add Training Texts</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="training-text">Text</Label>
              <Textarea
                id="training-text"
                placeholder="Write a sentence that shows an emotion..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label>Emotion</Label>
              <div className="flex gap-2 mt-2">
                {EMOTIONS.map(emotion => (
                  <Button
                    key={emotion.value}
                    variant={selectedEmotion === emotion.value ? "default" : "outline"}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className="flex items-center gap-2"
                  >
                    <span>{emotion.icon}</span>
                    {emotion.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button onClick={addTrainingText} disabled={!newText.trim() || !selectedEmotion}>
              Add Training Text
            </Button>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-2">Don't want to write your own? Use our examples!</p>
            <Button variant="outline" onClick={addSampleTexts}>
              Use Sample Texts 📝
            </Button>
          </div>
        </div>

        {trainingTexts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Training Texts ({trainingTexts.length})</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {trainingTexts.map(text => {
                const emotionData = getEmotionData(text.emotion);
                return (
                  <div key={text.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">{emotionData?.icon}</span>
                      <span className="text-sm">{text.text}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrainingText(text.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button 
          onClick={startTraining} 
          className="w-full" 
          size="lg"
          disabled={trainingTexts.length < 6}
        >
          Start Training AI! 🧠
        </Button>
      </CardContent>
    </Card>
  );

  const renderTraining = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Training Your Text Classifier 🧠</CardTitle>
        <CardDescription>
          The AI is learning to understand emotions in text...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Training Progress</span>
            <span>{trainingProgress}%</span>
          </div>
          <Progress value={trainingProgress} className="h-3" />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            {trainingProgress < 30 && "Analyzing text patterns..."}
            {trainingProgress >= 30 && trainingProgress < 60 && "Learning emotional keywords..."}
            {trainingProgress >= 60 && trainingProgress < 90 && "Understanding context..."}
            {trainingProgress >= 90 && "Finalizing the model!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderTest = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Test Your Emotion Classifier! 🧪</CardTitle>
        <CardDescription>
          Write any text and see what emotion the AI detects!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="test-text">Test Text</Label>
          <Textarea
            id="test-text"
            placeholder="Write something that expresses an emotion..."
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={4}
          />
          <Button onClick={testModel} className="w-full" disabled={!testText.trim()}>
            Analyze Emotion 🔍
          </Button>
        </div>

        {prediction && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="mb-3">
                {getEmotionData(prediction.emotion) && (
                  <span className="text-4xl">{getEmotionData(prediction.emotion)?.icon}</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Detected Emotion: {prediction.emotion.charAt(0).toUpperCase() + prediction.emotion.slice(1)}
              </h3>
              <p className="text-green-600 mb-3">
                Confidence: {prediction.confidence}%
              </p>
              <Progress value={prediction.confidence} className="h-2" />
            </CardContent>
          </Card>
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
          🎉 Text Classifier Complete!
        </CardTitle>
        <CardDescription className="text-lg">
          Your AI can now understand emotions in text!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-green-600">{score}%</h3>
          <p className="text-green-700">Accuracy Score</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Training Texts</h4>
            <p className="text-2xl font-bold text-blue-600">{trainingTexts.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Emotions Learned</h4>
            <p className="text-2xl font-bold text-purple-600">{EMOTIONS.length}</p>
          </div>
        </div>

        <Button onClick={() => {
          setStep('data');
          setTrainingTexts([]);
          setTestText('');
          setPrediction(null);
          setScore(0);
          setTrainingProgress(0);
        }} className="w-full" size="lg">
          Train Another Model 🔄
        </Button>
      </CardContent>
    </Card>
  );

  switch (step) {
    case 'data': return renderSetup();
    case 'training': return renderTraining();
    case 'testing': return renderTest();
    case 'play': return renderComplete();
    default: return renderSetup();
  }
};

export default TextClassifier;