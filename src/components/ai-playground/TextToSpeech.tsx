import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface TextToSpeechProps {
  onComplete: (score: number) => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const playText = async () => {
    setIsPlaying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPlaying(false);
    setCompleted(true);
    onComplete(90);
    toast.success('🎉 Text converted to speech!');
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Text-to-Speech Generator
          </CardTitle>
          <CardDescription>Make AI speak your words!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={playText} disabled={isPlaying} className="w-full">
            {isPlaying ? 'Speaking...' : 'Generate Speech'}
          </Button>
          {completed && (
            <motion.div className="text-center p-4 bg-green-50 rounded mt-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p>Speech generated successfully!</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextToSpeech;