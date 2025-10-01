import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Bot, 
  Plus, 
  X, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Mic,
  MicOff
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface IntentTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intentData: {
    id: string;
    label: string;
    trainingPhrases: string[];
    responses: string[];
  };
  onSave: (data: { trainingPhrases: string[]; responses: string[] }) => void;
}

export const IntentTrainingDialog = ({ 
  open, 
  onOpenChange, 
  intentData, 
  onSave 
}: IntentTrainingDialogProps) => {
  const [trainingPhrases, setTrainingPhrases] = useState<string[]>(
    intentData.trainingPhrases || []
  );
  const [responses, setResponses] = useState<string[]>(
    intentData.responses || []
  );
  const [newPhrase, setNewPhrase] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [isListeningPhrase, setIsListeningPhrase] = useState(false);
  const [isListeningResponse, setIsListeningResponse] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  const startVoiceInput = (type: 'phrase' | 'response') => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }

    const isPhrase = type === 'phrase';
    isPhrase ? setIsListeningPhrase(true) : setIsListeningResponse(true);

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (isPhrase) {
        setNewPhrase(transcript);
      } else {
        setNewResponse(transcript);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListeningPhrase(false);
      setIsListeningResponse(false);
    };

    recognitionRef.current.onerror = () => {
      setIsListeningPhrase(false);
      setIsListeningResponse(false);
      toast({
        title: "Voice recognition error",
        description: "Could not recognize speech",
        variant: "destructive"
      });
    };

    recognitionRef.current.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningPhrase(false);
      setIsListeningResponse(false);
    }
  };

  const addTrainingPhrase = () => {
    if (newPhrase.trim()) {
      setTrainingPhrases([...trainingPhrases, newPhrase.trim()]);
      setNewPhrase('');
    }
  };

  const removeTrainingPhrase = (index: number) => {
    setTrainingPhrases(trainingPhrases.filter((_, i) => i !== index));
  };

  const addResponse = () => {
    if (newResponse.trim()) {
      setResponses([...responses, newResponse.trim()]);
      setNewResponse('');
    }
  };

  const removeResponse = (index: number) => {
    setResponses(responses.filter((_, i) => i !== index));
  };

  const handleTrainAI = async () => {
    if (trainingPhrases.length === 0 || responses.length === 0) {
      toast({
        title: "Missing Training Data",
        description: "Please add at least one training phrase and one response.",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingComplete(false);

    // Simulate training progress
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      // Simulate AI training process (replace with actual AI training logic)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setTrainingProgress(100);
      setTrainingComplete(true);
      setIsTraining(false);
      
      // Save the data
      onSave({ trainingPhrases, responses });
      
      toast({
        title: "Training Complete!",
        description: `Successfully trained ${intentData.label} intent with ${trainingPhrases.length} phrases and ${responses.length} responses.`,
      });

      // Auto-close after success
      setTimeout(() => {
        onOpenChange(false);
        setTrainingComplete(false);
        setTrainingProgress(0);
      }, 2000);
      
    } catch (error) {
      setIsTraining(false);
      setTrainingProgress(0);
      toast({
        title: "Training Failed",
        description: "There was an error training the AI. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Train Intent: {intentData.label}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Training Phrases Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <Label className="text-base font-semibold">Training Phrases</Label>
              <Badge variant="secondary">{trainingPhrases.length}</Badge>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Enter a training phrase..."
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTrainingPhrase()}
                className="flex-1"
                disabled={isListeningPhrase}
              />
              <Button 
                onClick={isListeningPhrase ? stopVoiceInput : () => startVoiceInput('phrase')} 
                size="sm"
                variant="outline"
                className={isListeningPhrase ? 'bg-red-50 border-red-200' : ''}
              >
                {isListeningPhrase ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={addTrainingPhrase} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {trainingPhrases.map((phrase, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                  <span className="text-sm">{phrase}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrainingPhrase(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {trainingPhrases.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No training phrases yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Responses Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-green-500" />
              <Label className="text-base font-semibold">Bot Responses</Label>
              <Badge variant="secondary">{responses.length}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Enter a bot response..."
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="flex-1 min-h-[60px]"
                  disabled={isListeningResponse}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addResponse();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={isListeningResponse ? stopVoiceInput : () => startVoiceInput('response')} 
                  size="sm"
                  variant="outline"
                  className={isListeningResponse ? 'bg-red-50 border-red-200' : ''}
                >
                  {isListeningResponse ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={addResponse} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {responses.map((response, index) => (
                <div key={index} className="flex items-start justify-between bg-muted/50 rounded-md p-2">
                  <span className="text-sm flex-1">{response}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResponse(index)}
                    className="h-6 w-6 p-0 flex-shrink-0 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {responses.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No responses yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Training Section - Enhanced for kids with cool animations */}
        <div className="border-t pt-6 mt-6">
          {isTraining && (
            <div className="space-y-6 mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-center space-y-4">
                {/* Animated Robot Training */}
                <div className="relative">
                  <div className="text-6xl animate-bounce">🤖</div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <Brain className="h-5 w-5 animate-pulse text-purple-500" />
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Training Your AI Brain...
                  </span>
                  <Brain className="h-5 w-5 animate-pulse text-blue-500" />
                </div>
                
                {/* Enhanced Progress Bar with Sparkles */}
                <div className="relative">
                  <Progress value={trainingProgress} className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white mix-blend-difference">{Math.round(trainingProgress)}%</span>
                  </div>
                  {/* Animated sparkles */}
                  <div className="absolute -top-1 left-0 w-full h-6 overflow-hidden">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping absolute top-1" style={{ left: `${trainingProgress}%`, animationDelay: '0s' }}>✨</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="animate-pulse">🧠</span>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    Teaching {trainingPhrases.length} phrases & {responses.length} responses
                  </span>
                  <span className="animate-pulse">⚡</span>
                </div>
              </div>
            </div>
          )}

          {trainingComplete && (
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-center space-y-4">
                {/* Celebration Animation */}
                <div className="relative">
                  <div className="text-6xl animate-bounce">🎉</div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                    <div className="text-2xl animate-pulse">✨</div>
                  </div>
                  <div className="absolute top-0 right-1/4 transform translate-x-1/2 -translate-y-2">
                    <div className="text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌟</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 animate-pulse" />
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    AI Training Complete!
                  </span>
                  <CheckCircle className="h-6 w-6 text-green-600 animate-pulse" />
                </div>
                
                <p className="text-green-700 dark:text-green-300 font-medium">
                  🚀 Your chatbot is now super smart and ready to chat!
                </p>
                
                <div className="flex justify-center items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <span>🎯</span>
                  <span>Trained with {trainingPhrases.length} examples</span>
                  <span>•</span>
                  <span>{responses.length} response options</span>
                  <span>🎯</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTrainAI}
              disabled={isTraining || trainingPhrases.length === 0 || responses.length === 0}
              className="min-w-[120px]"
            >
              {isTraining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Training...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Train AI
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};