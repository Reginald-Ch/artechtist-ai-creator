import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Brain, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ImageClassifierProps {
  onComplete: (score: number) => void;
}

const ImageClassifier: React.FC<ImageClassifierProps> = ({ onComplete }) => {
  const [images, setImages] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>(['cat', 'dog']);
  const [isTraining, setIsTraining] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const trainModel = async () => {
    setIsTraining(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsTraining(false);
    setModelTrained(true);
    onComplete(85);
    toast.success('🎉 Image classifier trained!');
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Image Classifier Trainer
          </CardTitle>
          <CardDescription>
            Teach AI to recognize objects in pictures!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={trainModel} disabled={isTraining} className="w-full">
            {isTraining ? 'Training...' : 'Train AI Model'}
          </Button>
          {isTraining && <Progress value={50} />}
          {modelTrained && (
            <motion.div className="text-center p-4 bg-green-50 rounded">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p>Model trained successfully!</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageClassifier;