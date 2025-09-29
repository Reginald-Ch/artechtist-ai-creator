import { useState } from 'react';
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
  Loader2 
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
              />
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
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter a bot response..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                className="flex-1 min-h-[60px]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addResponse();
                  }
                }}
              />
              <Button onClick={addResponse} size="sm" className="self-end">
                <Plus className="h-4 w-4" />
              </Button>
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

        {/* Training Section */}
        <div className="border-t pt-6 mt-6">
          {isTraining && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Training AI Model...</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Processing {trainingPhrases.length} training phrases and {responses.length} responses
              </p>
            </div>
          )}

          {trainingComplete && (
            <div className="flex items-center gap-2 mb-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Training Complete!</p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Intent successfully trained and ready to use
                </p>
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