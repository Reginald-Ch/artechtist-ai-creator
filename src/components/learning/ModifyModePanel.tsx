import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, Trash2, Save, TestTube, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ModifyModePanelProps {
  onSwitchToCreate: () => void;
  onApplyChanges: (modifiedBot: any) => void;
}

const templateBot = {
  id: 'school-helper',
  name: 'School Helper Bot',
  description: 'I help students with school-related questions',
  avatar: '🎓',
  intents: [
    {
      name: 'homework-help',
      trainingPhrases: [
        'I need help with homework',
        'Can you help me with my assignment',
        'I have homework questions'
      ],
      responses: [
        'I\'d be happy to help with your homework! What subject are you working on?',
        'Let me assist you with your assignment. What do you need help with?'
      ]
    },
    {
      name: 'schedule-info',
      trainingPhrases: [
        'What time is lunch',
        'When does school start',
        'What\'s my schedule'
      ],
      responses: [
        'School starts at 8:00 AM and lunch is at 12:30 PM!',
        'Let me check the schedule for you...'
      ]
    }
  ]
};

export const ModifyModePanel = ({ onSwitchToCreate, onApplyChanges }: ModifyModePanelProps) => {
  const [modifiedBot, setModifiedBot] = useState(templateBot);
  const [activeTab, setActiveTab] = useState('basic');
  const [newPhrase, setNewPhrase] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [selectedIntentIndex, setSelectedIntentIndex] = useState(0);
  const [changes, setChanges] = useState<string[]>([]);

  const trackChange = (changeDescription: string) => {
    setChanges(prev => [...prev, changeDescription]);
    toast({
      title: "Change Tracked! ✏️",
      description: changeDescription,
    });
  };

  const updateBotName = (name: string) => {
    setModifiedBot(prev => ({ ...prev, name }));
    trackChange(`Changed bot name to "${name}"`);
  };

  const updateBotDescription = (description: string) => {
    setModifiedBot(prev => ({ ...prev, description }));
    trackChange(`Updated bot description`);
  };

  const addTrainingPhrase = () => {
    if (!newPhrase.trim()) return;
    
    setModifiedBot(prev => ({
      ...prev,
      intents: prev.intents.map((intent, index) => 
        index === selectedIntentIndex
          ? { ...intent, trainingPhrases: [...intent.trainingPhrases, newPhrase.trim()] }
          : intent
      )
    }));
    
    trackChange(`Added training phrase: "${newPhrase}"`);
    setNewPhrase('');
  };

  const removeTrainingPhrase = (intentIndex: number, phraseIndex: number) => {
    const phrase = modifiedBot.intents[intentIndex].trainingPhrases[phraseIndex];
    setModifiedBot(prev => ({
      ...prev,
      intents: prev.intents.map((intent, index) => 
        index === intentIndex
          ? { 
              ...intent, 
              trainingPhrases: intent.trainingPhrases.filter((_, i) => i !== phraseIndex)
            }
          : intent
      )
    }));
    
    trackChange(`Removed training phrase: "${phrase}"`);
  };

  const addResponse = () => {
    if (!newResponse.trim()) return;
    
    setModifiedBot(prev => ({
      ...prev,
      intents: prev.intents.map((intent, index) => 
        index === selectedIntentIndex
          ? { ...intent, responses: [...intent.responses, newResponse.trim()] }
          : intent
      )
    }));
    
    trackChange(`Added response: "${newResponse.substring(0, 30)}..."`);
    setNewResponse('');
  };

  const removeResponse = (intentIndex: number, responseIndex: number) => {
    const response = modifiedBot.intents[intentIndex].responses[responseIndex];
    setModifiedBot(prev => ({
      ...prev,
      intents: prev.intents.map((intent, index) => 
        index === intentIndex
          ? { 
              ...intent, 
              responses: intent.responses.filter((_, i) => i !== responseIndex)
            }
          : intent
      )
    }));
    
    trackChange(`Removed response: "${response.substring(0, 30)}..."`);
  };

  const testModification = () => {
    toast({
      title: "Testing Modified Bot! 🧪",
      description: "Your changes are working great!",
    });
  };

  const applyChanges = () => {
    onApplyChanges(modifiedBot);
    toast({
      title: "Changes Applied! 🎉",
      description: `${changes.length} modifications saved successfully`,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">✏️ Modify Mode: Customize a Template</h2>
        <p className="text-muted-foreground">
          Learn by modifying an existing bot - see how your changes affect behavior
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Modification Progress</h3>
              <p className="text-sm text-muted-foreground">
                {changes.length} changes made
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              {changes.length > 0 ? 'Modified' : 'Original'}
            </Badge>
          </div>
          {changes.length > 0 && (
            <div className="mt-3 text-xs space-y-1">
              <strong>Recent changes:</strong>
              {changes.slice(-3).map((change, index) => (
                <div key={index} className="text-muted-foreground">• {change}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bot Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">{modifiedBot.avatar}</span>
            <div className="flex-1">
              <Input
                value={modifiedBot.name}
                onChange={(e) => updateBotName(e.target.value)}
                className="text-lg font-semibold border-none bg-transparent px-0"
              />
              <Textarea
                value={modifiedBot.description}
                onChange={(e) => updateBotDescription(e.target.value)}
                className="text-sm text-muted-foreground border-none bg-transparent px-0 resize-none"
                rows={2}
              />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Modification Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="intents">Training Data</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎨 Customize Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bot Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {['🎓', '📚', '🤖', '🧠', '💡', '🎯'].map(emoji => (
                    <Button
                      key={emoji}
                      variant={modifiedBot.avatar === emoji ? "default" : "outline"}
                      className="text-lg h-12"
                      onClick={() => {
                        setModifiedBot(prev => ({ ...prev, avatar: emoji }));
                        trackChange(`Changed avatar to ${emoji}`);
                      }}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Personality Traits</label>
                <div className="flex flex-wrap gap-2">
                  {['Friendly', 'Professional', 'Encouraging', 'Patient', 'Enthusiastic'].map(trait => (
                    <Badge
                      key={trait}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => trackChange(`Added personality trait: ${trait}`)}
                    >
                      + {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 Intent Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {modifiedBot.intents.map((intent, index) => (
                  <Button
                    key={index}
                    variant={selectedIntentIndex === index ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => setSelectedIntentIndex(index)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{intent.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {intent.trainingPhrases.length} phrases, {intent.responses.length} responses
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Training Phrases Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💬 Training Phrases</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add examples of what users might say to trigger this intent
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newPhrase}
                  onChange={(e) => setNewPhrase(e.target.value)}
                  placeholder="Type a new training phrase..."
                  onKeyPress={(e) => e.key === 'Enter' && addTrainingPhrase()}
                />
                <Button onClick={addTrainingPhrase} disabled={!newPhrase.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {modifiedBot.intents[selectedIntentIndex]?.trainingPhrases.map((phrase, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <span className="flex-1 text-sm">{phrase}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTrainingPhrase(selectedIntentIndex, index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Responses Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎙️ Bot Responses</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define how the bot should respond when this intent is triggered
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Type a new response..."
                  rows={2}
                />
                <Button onClick={addResponse} disabled={!newResponse.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {modifiedBot.intents[selectedIntentIndex]?.responses.map((response, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                    <span className="flex-1 text-sm">{response}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeResponse(selectedIntentIndex, index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={testModification} variant="outline" className="flex-1">
          <TestTube className="h-4 w-4 mr-2" />
          Test Changes
        </Button>
        <Button onClick={applyChanges} className="flex-1" disabled={changes.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Apply Changes ({changes.length})
        </Button>
        <Button onClick={onSwitchToCreate} variant="outline" className="flex-1">
          <ArrowRight className="h-4 w-4 mr-2" />
          Create Your Own
        </Button>
      </div>
    </div>
  );
};