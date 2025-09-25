import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface TextClassifierProps {
  onComplete: (score: number) => void;
}

const TextClassifier: React.FC<TextClassifierProps> = ({ onComplete }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);

  const trainModel = async () => {
    setIsTraining(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsTraining(false);
    setModelTrained(true);
    onComplete(88);
    toast.success('🎉 Text classifier trained!');
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Text Sentiment Classifier
          </CardTitle>
          <CardDescription>Teach AI to understand emotions in text!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={trainModel} disabled={isTraining} className="w-full">
            {isTraining ? 'Training...' : 'Train Text Classifier'}
          </Button>
          {modelTrained && (
            <motion.div className="text-center p-4 bg-green-50 rounded mt-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p>Text classifier ready!</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextClassifier;