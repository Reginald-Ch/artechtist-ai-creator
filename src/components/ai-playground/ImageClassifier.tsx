import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Brain, Star, Play, Info, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { LearningObjectives } from './LearningObjectives';
import { ErrorRecoveryDialog } from './ErrorRecoveryDialog';
import { ExplanatoryFeedback } from './ExplanatoryFeedback';

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
  const [step, setStep] = useState<'intro' | 'setup' | 'data' | 'training' | 'testing' | 'play'>('intro');
  const [categories, setCategories] = useState<string[]>(['cats', 'dogs']);
  const [newCategory, setNewCategory] = useState('');
  const [trainingImages, setTrainingImages] = useState<TrainingImage[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [testImage, setTestImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [score, setScore] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorType, setErrorType] = useState<'file' | 'training' | 'general'>('general');
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
    
    if (files.length === 0) return;

    let validCount = 0;
    let invalidCount = 0;

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          invalidCount++;
          return;
        }

        const preview = URL.createObjectURL(file);
        const newImage: TrainingImage = {
          id: Date.now() + Math.random().toString(),
          file,
          preview,
          label: category
        };
        setTrainingImages(prev => [...prev, newImage]);
        validCount++;
      } else {
        invalidCount++;
      }
    });

    if (validCount > 0) {
      toast.success(`✅ Added ${validCount} image${validCount > 1 ? 's' : ''} to ${category}!`);
    }
    if (invalidCount > 0) {
      toast.error(`❌ Couldn't add ${invalidCount} file${invalidCount > 1 ? 's' : ''} (too large or wrong format)`);
      setErrorType('file');
      setShowErrorDialog(true);
    }
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

    // Check if all categories have images
    const categoriesWithImages = categories.filter(cat => getImagesPerCategory(cat) >= 2);
    if (categoriesWithImages.length < categories.length) {
      toast.error('Each category needs at least 2 images!');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setStep('training');

    // Simulate more realistic training with varied speeds
    const stages = [
      { progress: 20, delay: 800, message: 'Loading your images...' },
      { progress: 40, delay: 1000, message: 'Finding patterns in colors and shapes...' },
      { progress: 60, delay: 1200, message: 'Learning differences between categories...' },
      { progress: 80, delay: 900, message: 'Fine-tuning recognition...' },
      { progress: 100, delay: 600, message: 'Training complete!' }
    ];

    let currentStage = 0;
    const processStage = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setTrainingProgress(stage.progress);
        
        if (stage.progress === 100) {
          setIsTraining(false);
          setStep('testing');
          toast.success('🎉 Model training complete! Now let\'s test it!');
        } else {
          setTimeout(processStage, stage.delay);
        }
        currentStage++;
      }
    };

    processStage();
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
          setStep('play');
          onComplete(finalScore);
        }, 2000);
      }, 1000);
    }
  };

  const getImagesPerCategory = (category: string) => {
    return trainingImages.filter(img => img.label === category).length;
  };

  const renderIntro = () => (
    <div className="space-y-6">
      <LearningObjectives
        title="Image Classifier"
        difficulty="beginner"
        estimatedTime="5-10 min"
        objectives={[
          { text: 'How AI recognizes objects in pictures', icon: '👁️' },
          { text: 'Why AI needs training data (examples to learn from)', icon: '📚' },
          { text: 'How to test if your AI model works well', icon: '🧪' },
          { text: 'What makes a good training dataset', icon: '✨' }
        ]}
        realWorldApplications={[
          'Face filters on Snapchat and Instagram recognize your face',
          'Google Photos automatically organizes pictures by people and places',
          'Self-driving cars identify pedestrians, traffic lights, and other vehicles',
          'Medical apps help doctors identify diseases from X-ray images'
        ]}
        prerequisites={[]}
      />

      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Ready to Build Your Image Classifier? 📸</CardTitle>
          <CardDescription className="text-lg">
            You'll teach AI to recognize different things in pictures, just like how you learned to tell cats from dogs!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setStep('setup')} className="w-full gap-2" size="lg">
            <Sparkles className="h-5 w-5" />
            Let's Get Started! →
          </Button>
        </CardContent>
      </Card>
    </div>
  );

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
        <Card className="bg-blue-50 border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">💡 Pro Tip:</p>
              <p className="text-xs text-blue-800">
                Choose categories that look very different from each other. For example, "cats vs. dogs" works great, 
                but "golden retrievers vs. labrador retrievers" might be too similar for a beginner model!
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-semibold mb-3">What do you want to classify?</h3>
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg transition-all hover:shadow-md">
                <span className="font-medium capitalize">{category}</span>
                {categories.length > 2 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeCategory(category)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="new-category">Add New Category (Optional)</Label>
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

        <Button onClick={() => setStep('data')} className="w-full gap-2" size="lg">
          <Upload className="h-5 w-5" />
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
        <Card className="bg-green-50 border-green-200 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-900">🎯 Data Quality Tips:</p>
              <ul className="text-xs text-green-800 space-y-1 ml-4 list-disc">
                <li>Use clear, well-lit photos</li>
                <li>Include variety: different angles, backgrounds, lighting</li>
                <li>Make sure the main object is clearly visible</li>
                <li>Aim for 5+ images per category for best results</li>
              </ul>
            </div>
          </div>
        </Card>
        {categories.map(category => {
          const imageCount = getImagesPerCategory(category);
          const hasEnough = imageCount >= 2;
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold capitalize flex items-center gap-2">
                  {category}
                  {imageCount >= 5 && <span className="text-green-500">✓</span>}
                </h3>
                <Badge variant={hasEnough ? "default" : "secondary"} className={hasEnough ? "bg-green-500" : ""}>
                  {imageCount} image{imageCount !== 1 ? 's' : ''}
                  {imageCount < 2 && ` (need ${2 - imageCount} more)`}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {trainingImages
                  .filter(img => img.label === category)
                  .map(image => (
                    <div key={image.id} className="relative group animate-scale-in">
                      <img 
                        src={image.preview} 
                        alt={`Training ${category}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-border transition-all group-hover:border-primary"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0 rounded-full"
                        onClick={() => removeImage(image.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 hover:border-primary transition-all">
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="text-xs text-muted-foreground mt-1">Add Images</span>
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
          );
        })}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('setup')}>
            ← Back
          </Button>
          <Button 
            onClick={startTraining} 
            className="flex-1 gap-2"
            disabled={trainingImages.length < 4}
          >
            <Brain className="h-5 w-5" />
            Train My AI Model! →
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTraining = () => {
    const getTrainingMessage = () => {
      if (trainingProgress < 20) return {
        title: 'Loading your images...',
        detail: 'AI is opening and preparing all your training pictures'
      };
      if (trainingProgress < 40) return {
        title: 'Finding patterns in colors and shapes...',
        detail: 'AI is looking at what makes each category unique'
      };
      if (trainingProgress < 60) return {
        title: 'Learning differences between categories...',
        detail: 'AI is figuring out how to tell your categories apart'
      };
      if (trainingProgress < 80) return {
        title: 'Fine-tuning recognition...',
        detail: 'AI is practicing and improving its accuracy'
      };
      return {
        title: 'Almost done!',
        detail: 'AI is finishing up the training process'
      };
    };

    const message = getTrainingMessage();

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-glow-pulse">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Training Your AI Model 🧠</CardTitle>
          <CardDescription>
            Watch your AI learn in real-time!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Training Progress</span>
              <span className="font-bold text-primary">{trainingProgress}%</span>
            </div>
            <Progress value={trainingProgress} className="h-4" />
          </div>
          
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 p-4">
            <div className="space-y-2 text-center">
              <p className="font-semibold text-blue-900">{message.title}</p>
              <p className="text-sm text-blue-700">{message.detail}</p>
            </div>
          </Card>

          <Card className="bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">What's happening?</p>
                <p className="text-xs text-muted-foreground">
                  The AI is analyzing every pixel in your images, finding patterns like colors, edges, and shapes. 
                  It's building a "mental model" to recognize what makes each category special!
                </p>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    );
  };

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
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 border-2">
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-4xl mb-2">
                  {prediction.confidence >= 80 ? '🎯' : prediction.confidence >= 60 ? '👍' : '🤔'}
                </div>
                <h3 className="text-2xl font-bold text-green-700 capitalize">
                  {prediction.label}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Level</span>
                    <span className="font-bold text-green-700">{prediction.confidence}%</span>
                  </div>
                  <Progress value={prediction.confidence} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <ExplanatoryFeedback 
              score={prediction.confidence}
              category={prediction.label}
              context="testing"
              showTips={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 border-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-scale-in">
            <Star className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl text-green-700">
            🎉 Congratulations! You Did It!
          </CardTitle>
          <CardDescription className="text-lg">
            You've successfully trained your own image classifier AI!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-5xl font-bold text-green-600">{score}%</h3>
            <p className="text-lg text-green-700 font-medium">Final Accuracy Score</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-white border-2">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Images Trained</p>
                <p className="text-3xl font-bold text-blue-600">{trainingImages.length}</p>
              </div>
            </Card>
            <Card className="p-4 bg-white border-2">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-3xl font-bold text-purple-600">{categories.length}</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <ExplanatoryFeedback 
        score={score}
        category={categories.join(', ')}
        context="complete"
        showTips={true}
      />

      <div className="flex gap-3">
        <Button onClick={() => {
          setStep('intro');
          setCategories(['cats', 'dogs']);
          setTrainingImages([]);
          setTestImage(null);
          setPrediction(null);
          setScore(0);
          setTrainingProgress(0);
        }} className="flex-1 gap-2" size="lg" variant="outline">
          <RefreshCw className="h-5 w-5" />
          Start New Model
        </Button>
        <Button onClick={() => {
          toast.success('🎉 Model saved to My Models!');
        }} className="flex-1 gap-2" size="lg">
          <Star className="h-5 w-5" />
          Save Model
        </Button>
      </div>
    </div>
  );

  // Render step indicator
  const renderStepIndicator = () => {
    if (step === 'intro') return null;
    
    const steps = [
      { key: 'setup', icon: '⚙️', label: 'Setup' },
      { key: 'data', icon: '📂', label: 'Data' },
      { key: 'training', icon: '🧠', label: 'Training' },
      { key: 'testing', icon: '🧪', label: 'Testing' },
      { key: 'play', icon: '🎉', label: 'Complete' }
    ];

    const currentIndex = steps.findIndex(s => s.key === step);

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-2 md:space-x-4">
          {steps.map((stepItem, index) => (
            <div key={stepItem.key} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition-all
                ${step === stepItem.key 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                  : currentIndex > index 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {stepItem.icon}
              </div>
              <span className={`ml-2 text-xs md:text-sm font-medium transition-colors ${
                step === stepItem.key ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {stepItem.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`
                  w-6 md:w-12 h-1 mx-2 md:mx-4 rounded-full transition-colors
                  ${currentIndex > index ? 'bg-green-500' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ErrorRecoveryDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorType={errorType}
        errorMessage={
          errorType === 'file' 
            ? 'Some files couldn\'t be added. Make sure they\'re images and under 5MB.' 
            : 'Something went wrong during training.'
        }
        recoverySteps={
          errorType === 'file'
            ? [
                {
                  title: 'Check File Type',
                  description: 'Only image files (JPG, PNG, GIF, WEBP) are supported.',
                  icon: '📁'
                },
                {
                  title: 'Check File Size',
                  description: 'Each image must be under 5MB. Try compressing large images.',
                  icon: '📏'
                },
                {
                  title: 'Try Again',
                  description: 'Upload different images that meet the requirements.',
                  icon: '🔄'
                }
              ]
            : [
                {
                  title: 'Refresh the Page',
                  description: 'Sometimes a quick refresh fixes the issue.',
                  icon: '🔄'
                }
              ]
        }
        onRetry={() => setShowErrorDialog(false)}
      />

      {renderStepIndicator()}
      {step === 'intro' && renderIntro()}
      {step === 'setup' && renderSetup()}
      {step === 'data' && renderUpload()}
      {step === 'training' && renderTraining()}
      {step === 'testing' && renderTest()}
      {step === 'play' && renderComplete()}
    </div>
  );
};

export default ImageClassifier;