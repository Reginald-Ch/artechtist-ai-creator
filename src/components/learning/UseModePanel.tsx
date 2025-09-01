import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Eye, MessageSquare, Lightbulb, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UseModePanelProps {
  onSwitchToModify: () => void;
  onSwitchToCreate: () => void;
}

const sampleBots = [
  {
    id: 'weather-bot',
    name: 'Weather Helper',
    description: 'Ask me about weather in any city!',
    avatar: '🌤️',
    category: 'Utility',
    difficulty: 'Beginner',
    sampleQueries: ['What\'s the weather in Lagos?', 'Will it rain tomorrow?', 'Is it sunny in Nairobi?'],
    intents: ['weather-query', 'forecast-request', 'location-weather'],
    responses: [
      'Let me check the weather for you! It\'s sunny and 28°C in Lagos today.',
      'The forecast shows some rain expected tomorrow afternoon.',
      'Nairobi is enjoying beautiful sunny weather today!'
    ]
  },
  {
    id: 'greeting-bot',
    name: 'Friendly Greeter',
    description: 'A warm, multilingual greeting bot',
    avatar: '👋',
    category: 'Social',
    difficulty: 'Beginner',
    sampleQueries: ['Hello', 'Sawubona', 'Bonjour', 'Good morning'],
    intents: ['greeting', 'goodbye', 'how-are-you'],
    responses: [
      'Hello there! Nice to meet you!',
      'Sawubona! How are you today?',
      'Bonjour! Comment allez-vous?',
      'Good morning! Hope you have a wonderful day!'
    ]
  },
  {
    id: 'math-tutor',
    name: 'Math Helper',
    description: 'I can help with basic math problems',
    avatar: '🔢',
    category: 'Education',
    difficulty: 'Intermediate',
    sampleQueries: ['What is 15 + 27?', 'Help me with fractions', 'Solve 2x + 5 = 15'],
    intents: ['addition', 'subtraction', 'equation-solving'],
    responses: [
      '15 + 27 equals 42! Here\'s how: 15 + 27 = 42',
      'Fractions can be tricky! Let me break it down for you...',
      'To solve 2x + 5 = 15, first subtract 5 from both sides: 2x = 10, then divide by 2: x = 5'
    ]
  }
];

export const UseModePanel = ({ onSwitchToModify, onSwitchToCreate }: UseModePanelProps) => {
  const [selectedBot, setSelectedBot] = useState(sampleBots[0]);
  const [currentQuery, setCurrentQuery] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{text: string, sender: 'user' | 'bot', intent?: string}>>([]);

  const tryQuery = (query: string) => {
    // Simulate bot response
    const response = selectedBot.responses[Math.floor(Math.random() * selectedBot.responses.length)];
    const matchedIntent = selectedBot.intents[Math.floor(Math.random() * selectedBot.intents.length)];
    
    setChatHistory(prev => [
      ...prev,
      { text: query, sender: 'user' },
      { text: response, sender: 'bot', intent: matchedIntent }
    ]);

    toast({
      title: "Query Processed! 🤖",
      description: `Intent matched: ${matchedIntent}`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🎯 Use Mode: Try Existing Bots</h2>
        <p className="text-muted-foreground">
          Explore how AI bots work by chatting with pre-built examples
        </p>
      </div>

      {/* Bot Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {sampleBots.map((bot) => (
          <Card 
            key={bot.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedBot.id === bot.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedBot(bot)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-2xl">{bot.avatar}</div>
                <Badge className={getDifficultyColor(bot.difficulty)}>
                  {bot.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{bot.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{bot.description}</p>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-xs">
                {bot.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Bot Interaction */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary-glow/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">{selectedBot.avatar}</span>
            <div>
              <h3>{selectedBot.name}</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Try these sample questions to see how it works!
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Queries */}
          <div className="grid grid-cols-1 gap-2">
            {selectedBot.sampleQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto p-3"
                onClick={() => tryQuery(query)}
              >
                <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                <span>"{query}"</span>
              </Button>
            ))}
          </div>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <Card className="bg-background/50">
              <CardHeader className="pb-2">
                <h4 className="text-sm font-medium">Conversation</h4>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`text-sm p-2 rounded ${
                        msg.sender === 'user' 
                          ? 'bg-primary/10 text-right' 
                          : 'bg-muted/50'
                      }`}>
                        <div className="font-medium text-xs text-muted-foreground mb-1">
                          {msg.sender === 'user' ? 'You' : selectedBot.name}
                          {msg.intent && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {msg.intent}
                            </Badge>
                          )}
                        </div>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Explanation Toggle */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showExplanation ? 'Hide' : 'Show'} How This Works
          </Button>

          {showExplanation && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <strong>Intent Recognition:</strong> When you type a message, the bot matches it to one of its trained intents: {selectedBot.intents.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <strong>Response Generation:</strong> Based on the matched intent, the bot selects an appropriate response from its training data.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <strong>Learning Opportunity:</strong> Notice how similar questions trigger the same intent but may get different responses!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onSwitchToModify} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Modify This Bot
            </Button>
            <Button variant="outline" onClick={onSwitchToCreate} className="flex-1">
              Create From Scratch
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};