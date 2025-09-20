import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Brain, Star, Play } from 'lucide-react';
import { toast } from 'sonner';

interface ImageClassifierProps {
  onComplete: (score: number) => void;
}

interface TrainingImage {
  id: string;
  file: File;
  preview: string;
  label: string;
}

const ImageClassifier: React.FC<ImageClassifierProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'setup' | 'upload' | 'train' | 'test' | 'complete'>('setup');
  const [categories, setCategories] = useState<string[]>(['cats', 'dogs']);
  const [newCategory, setNewCategory] = useState('');
  const [trainingImages, setTrainingImages] = useState<TrainingImage[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [testImage, setTestImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [score, setScore] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    if (categories.length > 2) {
      setCategories(categories.filter(c => c !== category));
      setTrainingImages(trainingImages.filter(img => img.label !== category));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        const newImage: TrainingImage = {
          id: Date.now() + Math.random().toString(),
          file,
          preview,
          label: category
        };
        setTrainingImages(prev => [...prev, newImage]);
      }
    });
  };

  const removeImage = (imageId: string) => {
    setTrainingImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const startTraining = async () => {
    if (trainingImages.length < 4) {
      toast.error('Upload at least 2 images per category to start training!');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setStep('train');

    // Simulate training process
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setStep('test');
          toast.success('🎉 Model training complete! Now let\'s test it!');
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const testModel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setTestImage(preview);
      
      // Simulate prediction
      setTimeout(() => {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
        setPrediction({ label: randomCategory, confidence });
        
        const finalScore = confidence + Math.floor(Math.random() * 20);
        setScore(finalScore);
        
        setTimeout(() => {
          setStep('complete');
          onComplete(finalScore);
        }, 2000);
      }, 1000);
    }
  };

  const getImagesPerCategory = (category: string) => {
    return trainingImages.filter(img => img.label === category).length;
  };

  const renderSetup = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Camera className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Image Classifier Setup 📸</CardTitle>
        <CardDescription className="text-lg">
          Let's teach AI to recognize different things in pictures!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">What do you want to classify?</h3>
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium capitalize">{category}</span>
                {categories.length > 2 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeCategory(category)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="new-category">Add New Category</Label>
          <div className="flex gap-2">
            <Input
              id="new-category"
              placeholder="e.g., birds, cars, flowers"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <Button onClick={addCategory} disabled={!newCategory.trim()}>
              Add
            </Button>
          </div>
        </div>

        <Button onClick={() => setStep('upload')} className="w-full" size="lg">
          Next: Upload Training Images →
        </Button>
      </CardContent>
    </Card>
  );

  const renderUpload = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Upload className="h-6 w-6" />
          Upload Training Images
        </CardTitle>
        <CardDescription>
          Upload at least 2 images for each category. More images = better AI!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold capitalize">{category}</h3>
              <Badge variant={getImagesPerCategory(category) >= 2 ? "default" : "secondary"}>
                {getImagesPerCategory(category)} images
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {trainingImages
                .filter(img => img.label === category)
                .map(image => (
                  <div key={image.id} className="relative group">
                    <img 
                      src={image.preview} 
                      alt={`Training ${category}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                      onClick={() => removeImage(image.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Add Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, category)}
                />
              </label>
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('setup')}>
            ← Back
          </Button>
          <Button 
            onClick={startTraining} 
            className="flex-1"
            disabled={trainingImages.length < 4}
          >
            Start Training AI! 🧠
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTraining = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Training Your AI Model 🧠</CardTitle>
        <CardDescription>
          The AI is learning to recognize your categories...
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
            {trainingProgress < 30 && "Analyzing your images..."}
            {trainingProgress >= 30 && trainingProgress < 60 && "Learning patterns..."}
            {trainingProgress >= 60 && trainingProgress < 90 && "Fine-tuning the model..."}
            {trainingProgress >= 90 && "Almost done!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderTest = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Test Your AI Model! 🧪</CardTitle>
        <CardDescription>
          Upload a test image to see how well your AI can classify it!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <label className="inline-flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:bg-primary/5 mx-auto">
            {testImage ? (
              <img src={testImage} alt="Test" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <>
                <Upload className="h-12 w-12 text-primary mb-2" />
                <span className="text-lg font-medium">Upload Test Image</span>
                <span className="text-sm text-muted-foreground">Choose any image to test</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={testModel}
              ref={fileInputRef}
            />
          </label>
        </div>

        {prediction && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Prediction: {prediction.label}
              </h3>
              <p className="text-green-600">
                Confidence: {prediction.confidence}%
              </p>
              <div className="mt-3">
                <Progress value={prediction.confidence} className="h-2" />
              </div>
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
          🎉 Congratulations! Model Complete!
        </CardTitle>
        <CardDescription className="text-lg">
          You've successfully trained an image classifier!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-green-600">{score}%</h3>
          <p className="text-green-700">Final Accuracy Score</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Images Trained</h4>
            <p className="text-2xl font-bold text-blue-600">{trainingImages.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Categories</h4>
            <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
          </div>
        </div>

        <Button onClick={() => {
          setStep('setup');
          setTrainingImages([]);
          setTestImage(null);
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
    case 'setup': return renderSetup();
    case 'upload': return renderUpload();
    case 'train': return renderTraining();
    case 'test': return renderTest();
    case 'complete': return renderComplete();
    default: return renderSetup();
  }
};

export default ImageClassifier;