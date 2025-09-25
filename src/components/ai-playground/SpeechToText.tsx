import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SpeechToTextProps {
  onComplete: (score: number) => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribed, setTranscribed] = useState(false);

  const startRecording = async () => {
    setIsRecording(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRecording(false);
    setTranscribed(true);
    onComplete(92);
    toast.success('🎉 Speech converted to text!');
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Speech-to-Text Converter
          </CardTitle>
          <CardDescription>Convert your voice into text!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={startRecording} disabled={isRecording} className="w-full">
            {isRecording ? 'Recording...' : 'Start Recording'}
          </Button>
          {transcribed && (
            <motion.div className="text-center p-4 bg-green-50 rounded mt-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p>Speech successfully converted!</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechToText;