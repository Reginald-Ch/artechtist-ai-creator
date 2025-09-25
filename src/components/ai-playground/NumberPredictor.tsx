import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface NumberPredictorProps {
  onComplete: (score: number) => void;
}

const NumberPredictor: React.FC<NumberPredictorProps> = ({ onComplete }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);

  const trainModel = async () => {
    setIsTraining(true);
    await new Promise(resolve => setTimeout(resolve, 4000));
    setIsTraining(false);
    setModelTrained(true);
    onComplete(87);
    toast.success('🎉 Number predictor trained!');
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Number Predictor AI
          </CardTitle>
          <CardDescription>Train AI to predict numbers from patterns!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={trainModel} disabled={isTraining} className="w-full">
            {isTraining ? 'Training...' : 'Train Predictor'}
          </Button>
          {modelTrained && (
            <motion.div className="text-center p-4 bg-green-50 rounded mt-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p>Predictor model ready!</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NumberPredictor;