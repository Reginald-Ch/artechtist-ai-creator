import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Globe, Award, Target, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

interface AdvancedVoiceTrainingProps {
  nodes: any[];
  onTrainingUpdate: (nodeId: string, voiceData: any) => void;
}

export const AdvancedVoiceTraining: React.FC<AdvancedVoiceTrainingProps> = ({ 
  nodes, 
  onTrainingUpdate 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedIntent, setSelectedIntent] = useState<string>('');
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [voiceAccuracy, setVoiceAccuracy] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [trainingData, setTrainingData] = useState<Record<string, any>>({});
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const africanLanguages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪' },
    { code: 'yo-NG', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'zu-ZA', name: 'Zulu', flag: '🇿🇦' },
    { code: 'am-ET', name: 'Amharic', flag: '🇪🇹' },
    { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬' },
    { code: 'ig-NG', name: 'Igbo', flag: '🇳🇬' },
    { code: 'ff-SN', name: 'Fulfulde', flag: '🇸🇳' }
  ];

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        handleSpeechResult(transcript, confidence);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Recognition Error",
          description: "Voice recognition failed. Please try again.",
          variant: "destructive",
        });
      };
    }
  }, []);

  const handleSpeechResult = (transcript: string, confidence: number) => {
    if (selectedIntent && nodes.find(n => n.id === selectedIntent)) {
      const accuracy = Math.round(confidence * 100);
      setVoiceAccuracy(accuracy);
      
      // Update training data
      const updatedData = {
        ...trainingData[selectedIntent],
        voiceTraining: {
          transcript,
          confidence,
          language: selectedLanguage,
          timestamp: new Date().toISOString()
        }
      };
      
      setTrainingData(prev => ({
        ...prev,
        [selectedIntent]: updatedData
      }));
      
      onTrainingUpdate(selectedIntent, updatedData);
      
      // Update session score
      setSessionScore(prev => Math.min(100, prev + accuracy / 10));
      
      toast({
        title: "Voice Training Complete",
        description: `Recognized: "${transcript}" with ${accuracy}% confidence`,
      });
    }
  };

  const startRecording = async () => {
    if (!selectedIntent) {
      toast({
        title: "Select Intent",
        description: "Please select an intent to train first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Here you would typically upload the audio for processing
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
      }
      
      // Simulate recording progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        setRecordingProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
          stopRecording();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingProgress(0);
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const testVoiceResponse = () => {
    if (!selectedIntent) return;
    
    const selectedNode = nodes.find(n => n.id === selectedIntent);
    if (!selectedNode || !selectedNode.data.responses?.length) return;
    
    const response = selectedNode.data.responses[0];
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = selectedLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const getAccuracyColor = () => {
    if (voiceAccuracy >= 80) return 'text-green-600';
    if (voiceAccuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSessionLevel = () => {
    if (sessionScore < 25) return { level: 'Novice', color: 'bg-gray-500' };
    if (sessionScore < 50) return { level: 'Learning', color: 'bg-blue-500' };
    if (sessionScore < 75) return { level: 'Skilled', color: 'bg-green-500' };
    return { level: 'Expert', color: 'bg-purple-500' };
  };

  const sessionLevel = getSessionLevel();

  return (
    <div className="space-y-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Advanced Voice Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language & Intent Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {africanLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Intent to Train</label>
              <Select value={selectedIntent} onValueChange={setSelectedIntent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intent" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Training Session</span>
              <Badge className={`${sessionLevel.color} text-white`}>
                {sessionLevel.level}
              </Badge>
            </div>
            <Progress value={sessionScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Session Score: {Math.round(sessionScore)}/100
            </p>
          </div>

          {/* Voice Accuracy */}
          {voiceAccuracy > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Recognition</span>
                <span className={`text-sm font-bold ${getAccuracyColor()}`}>
                  {voiceAccuracy}% Accuracy
                </span>
              </div>
              <Progress value={voiceAccuracy} className="h-2" />
            </div>
          )}

          {/* Recording Progress */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-600">Recording...</span>
              </div>
              <Progress value={recordingProgress} className="h-2" />
            </div>
          )}

          {/* Training Controls */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!selectedIntent}
              className={`flex items-center gap-2 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Record
                </>
              )}
            </Button>
            
            <Button
              onClick={testVoiceResponse}
              disabled={!selectedIntent || isPlaying}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  Playing...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Test Voice
                </>
              )}
            </Button>
            
            <Button
              onClick={() => {
                setVoiceAccuracy(0);
                setSessionScore(0);
                setTrainingData({});
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Training Tips */}
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Training Tips:</strong> Speak clearly and naturally. Try different accents and speaking speeds to improve your bot's recognition accuracy across diverse users.
            </AlertDescription>
          </Alert>

          {/* Achievements */}
          {sessionScore > 75 && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-700">Achievement Unlocked!</span>
              </div>
              <p className="text-sm text-purple-600">
                🎉 Voice Training Expert! You've mastered multi-language AI training.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};