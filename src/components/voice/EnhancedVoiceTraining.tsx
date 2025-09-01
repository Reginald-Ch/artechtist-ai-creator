import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VoiceToText } from './VoiceToText';
import { Mic, Volume2, Plus, X, Edit, Save, Brain, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceTrainingProps {
  selectedNode?: any;
  onUpdateNode?: (nodeId: string, data: any) => void;
  onClose?: () => void;
}

export const EnhancedVoiceTraining = ({ selectedNode, onUpdateNode, onClose }: VoiceTrainingProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('phrases');
  const [trainingPhrases, setTrainingPhrases] = useState<string[]>(selectedNode?.data?.trainingPhrases || []);
  const [responses, setResponses] = useState<string[]>(selectedNode?.data?.responses || []);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState<{ [key: string]: boolean }>({});

  const handleVoicePhrase = useCallback((text: string) => {
    if (text.trim()) {
      setCurrentPhrase(text);
      toast({
        title: "Voice Captured",
        description: `Added: "${text}"`,
      });
    }
  }, [toast]);

  const handleVoiceResponse = useCallback((text: string) => {
    if (text.trim()) {
      setCurrentResponse(text);
      toast({
        title: "Response Captured",
        description: `Added: "${text}"`,
      });
    }
  }, [toast]);

  const addTrainingPhrase = () => {
    if (currentPhrase.trim() && !trainingPhrases.includes(currentPhrase.trim())) {
      const newPhrases = [...trainingPhrases, currentPhrase.trim()];
      setTrainingPhrases(newPhrases);
      setCurrentPhrase('');
      
      // Mark as voice-trained
      setVoiceProgress(prev => ({
        ...prev,
        [currentPhrase.trim()]: true
      }));
    }
  };

  const removeTrainingPhrase = (index: number) => {
    const phrase = trainingPhrases[index];
    setTrainingPhrases(trainingPhrases.filter((_, i) => i !== index));
    
    // Remove from voice progress
    setVoiceProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[phrase];
      return newProgress;
    });
  };

  const addResponse = () => {
    if (currentResponse.trim() && !responses.includes(currentResponse.trim())) {
      setResponses([...responses, currentResponse.trim()]);
      setCurrentResponse('');
    }
  };

  const removeResponse = (index: number) => {
    setResponses(responses.filter((_, i) => i !== index));
  };

  const trainModel = async () => {
    if (trainingPhrases.length < 3) {
      toast({
        title: "Insufficient Training Data",
        description: "Please add at least 3 training phrases for better accuracy.",
        variant: "destructive",
      });
      return;
    }

    setIsTraining(true);
    
    try {
      // Simulate training process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Training Complete",
        description: `Model trained with ${trainingPhrases.length} phrases and ${responses.length} responses.`,
      });
    } catch (error) {
      toast({
        title: "Training Failed",
        description: "Could not train the model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const saveChanges = () => {
    if (selectedNode && onUpdateNode) {
      onUpdateNode(selectedNode.id, {
        ...selectedNode.data,
        trainingPhrases,
        responses,
      });
      
      toast({
        title: "Changes Saved",
        description: "Intent has been updated with new training data.",
      });
    }
  };

  const playResponse = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.play();
      
      toast({
        title: "Playing Response",
        description: "Listen to how the AI will respond",
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: "Playback Failed",
        description: "Could not play audio response.",
        variant: "destructive",
      });
    }
  };

  if (!selectedNode) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium text-muted-foreground">No Intent Selected</p>
            <p className="text-sm text-muted-foreground">Select an intent to start voice training</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto glassmorphism">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mic className="h-6 w-6 text-primary" />
            Voice Training: {selectedNode.data.label}
          </CardTitle>
          <p className="text-muted-foreground mt-1">
            Train your AI with voice input and test responses
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveChanges} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="phrases" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Training Phrases
            </TabsTrigger>
            <TabsTrigger value="responses">
              <Volume2 className="h-4 w-4 mr-2" />
              Responses
            </TabsTrigger>
            <TabsTrigger value="training">
              <Brain className="h-4 w-4 mr-2" />
              Model Training
            </TabsTrigger>
          </TabsList>

          {/* Training Phrases Tab */}
          <TabsContent value="phrases" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Voice Input */}
              <div>
                <VoiceToText
                  onTranscription={handleVoicePhrase}
                  placeholder="Record training phrases with voice"
                />
              </div>
              
              {/* Manual Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phrase-input">Or type manually:</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="phrase-input"
                      value={currentPhrase}
                      onChange={(e) => setCurrentPhrase(e.target.value)}
                      placeholder="Enter training phrase..."
                      onKeyPress={(e) => e.key === 'Enter' && addTrainingPhrase()}
                    />
                    <Button onClick={addTrainingPhrase} disabled={!currentPhrase.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Tips for better training:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Use natural, conversational phrases</li>
                    <li>Add at least 5-10 variations</li>
                    <li>Include different ways to ask the same thing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Current Phrases */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Training Phrases ({trainingPhrases.length})</h3>
                <Badge variant={trainingPhrases.length >= 5 ? "default" : "secondary"}>
                  {trainingPhrases.length >= 5 ? "Good Coverage" : "Needs More Phrases"}
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {trainingPhrases.map((phrase, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{phrase}</span>
                      {voiceProgress[phrase] && (
                        <Badge variant="outline" className="text-xs">
                          <Mic className="h-3 w-3 mr-1" />
                          Voice
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTrainingPhrase(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {trainingPhrases.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>No training phrases yet. Add some to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Voice Input */}
              <div>
                <VoiceToText
                  onTranscription={handleVoiceResponse}
                  placeholder="Record responses with voice"
                />
              </div>
              
              {/* Manual Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="response-input">Or type manually:</Label>
                  <div className="flex gap-2 mt-2">
                    <Textarea
                      id="response-input"
                      value={currentResponse}
                      onChange={(e) => setCurrentResponse(e.target.value)}
                      placeholder="Enter response text..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={addResponse} 
                    disabled={!currentResponse.trim()}
                    className="mt-2 w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Response
                  </Button>
                </div>
              </div>
            </div>

            {/* Current Responses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Responses ({responses.length})</h3>
                <Badge variant={responses.length >= 2 ? "default" : "secondary"}>
                  {responses.length >= 2 ? "Good Variety" : "Add More Responses"}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {responses.map((response, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                  >
                    <span className="text-sm flex-1">{response}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playResponse(response)}
                        className="h-8 w-8 p-0"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeResponse(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {responses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Volume2 className="h-8 w-8 mx-auto mb-2" />
                    <p>No responses yet. Add some to complete your intent!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Model Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-muted/50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Training Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Training Phrases</p>
                    <p className="text-2xl font-bold text-primary">{trainingPhrases.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Responses</p>
                    <p className="text-2xl font-bold text-primary">{responses.length}</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={trainModel}
                disabled={isTraining || trainingPhrases.length < 3}
                size="lg"
                className="w-full max-w-md"
              >
                <Brain className="h-5 w-5 mr-2" />
                {isTraining ? "Training Model..." : "Train AI Model"}
              </Button>
              
              {trainingPhrases.length < 3 && (
                <p className="text-sm text-muted-foreground">
                  Add at least 3 training phrases to begin training
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};