import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MessageSquare, 
  Target, 
  Zap, 
  Users, 
  Layers,
  PlayCircle,
  BookOpen,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface ConceptExplainerProps {
  concept: string;
  onClose?: () => void;
  interactive?: boolean;
}

const conceptData = {
  intent: {
    title: 'Understanding Intents',
    icon: Target,
    difficulty: 'Beginner',
    description: 'An intent represents what a user wants to accomplish when they interact with your AI bot.',
    realWorldExample: 'When you call a restaurant, your intent might be "make a reservation", "check hours", or "place an order".',
    technicalExample: {
      userInput: '"I want to book a table for two"',
      identifiedIntent: 'restaurant.reservation',
      explanation: 'The AI recognizes this as a reservation intent, not a question about menu or hours.'
    },
    practiceExercise: {
      question: 'What intent would these user messages trigger?',
      scenarios: [
        { message: '"Cancel my appointment"', intent: 'appointment.cancel' },
        { message: '"What time do you close?"', intent: 'business.hours' },
        { message: '"I need help with my order"', intent: 'support.order' }
      ]
    },
    tips: [
      'Start with 3-5 main intents for your bot',
      'Name intents clearly (e.g., "greeting", "book.flight", "get.help")',
      'Each intent should represent one clear user goal'
    ]
  },
  training: {
    title: 'Training Phrases Power',
    icon: MessageSquare,
    difficulty: 'Beginner',
    description: 'Training phrases are different ways users might express the same intent. They teach your AI to recognize variations.',
    realWorldExample: 'All these mean "hello": "Hi", "Hey there", "Good morning", "What\'s up?", "Greetings"',
    technicalExample: {
      userInput: 'Various ways to say goodbye',
      identifiedIntent: 'farewell',
      explanation: 'Training phrases: "Bye", "See you later", "Goodbye", "Take care", "Until next time"'
    },
    practiceExercise: {
      question: 'Add 3 more training phrases for booking a flight:',
      scenarios: [
        { message: '"I need a ticket to Paris"', intent: 'flight.booking' },
        { message: '"Book me a flight"', intent: 'flight.booking' },
        { message: '"Reserve airline seat"', intent: 'flight.booking' }
      ]
    },
    tips: [
      'Include formal and informal ways of saying the same thing',
      'Add common misspellings and abbreviations',
      'Use 5-10 training phrases per intent for best results'
    ]
  },
  responses: {
    title: 'Crafting Bot Responses',
    icon: Brain,
    difficulty: 'Beginner',
    description: 'Responses are what your bot says back to users. Good responses feel natural and helpful.',
    realWorldExample: 'Instead of "FLIGHT_BOOKING_INITIATED", say "I\'d love to help you book a flight! Where would you like to go?"',
    technicalExample: {
      userInput: '"Book a flight"',
      identifiedIntent: 'flight.booking',
      explanation: 'Bot responds: "Great! I can help with that. What\'s your destination city?"'
    },
    practiceExercise: {
      question: 'Which response sounds more natural?',
      scenarios: [
        { 
          message: 'User: "I need help"', 
          response1: 'HELP_INTENT_TRIGGERED', 
          response2: 'I\'m here to help! What can I assist you with today?',
          correct: 'response2'
        }
      ]
    },
    tips: [
      'Write like you\'re talking to a friend',
      'Ask follow-up questions when you need more info',
      'Use the user\'s name when possible'
    ]
  },
  entities: {
    title: 'Extracting Information (Entities)',
    icon: Zap,
    difficulty: 'Intermediate',
    description: 'Entities are specific pieces of information extracted from user messages, like dates, names, or locations.',
    realWorldExample: 'From "Book a flight to Paris on Friday" → Extract: Destination="Paris", Date="Friday"',
    technicalExample: {
      userInput: '"Reserve a table for 4 people at 7pm"',
      identifiedIntent: 'restaurant.reservation',
      explanation: 'Extracted entities: Party_size=4, Time=7pm'
    },
    practiceExercise: {
      question: 'What entities can you extract from: "Send $50 to John tomorrow"?',
      scenarios: [
        { entity: 'Amount', value: '$50' },
        { entity: 'Recipient', value: 'John' },
        { entity: 'Date', value: 'tomorrow' }
      ]
    },
    tips: [
      'Common entities: dates, times, numbers, names, locations',
      'Use entities to personalize responses',
      'Validate extracted entities (is "tomorrow" a valid date?)'
    ]
  }
};

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({
  concept,
  onClose,
  interactive = true
}) => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [showAnswer, setShowAnswer] = useState(false);
  
  const conceptInfo = conceptData[concept as keyof typeof conceptData];
  
  if (!conceptInfo) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Concept not found</p>
      </Card>
    );
  }

  const IconComponent = conceptInfo.icon;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{conceptInfo.title}</span>
                <Badge variant={conceptInfo.difficulty === 'Beginner' ? 'default' : 'secondary'}>
                  {conceptInfo.difficulty}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {conceptInfo.description}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="example">Example</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Real-World Analogy</h4>
              </div>
              <p className="text-sm leading-relaxed">
                {conceptInfo.realWorldExample}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h5 className="font-medium mb-2 flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Why It Matters</span>
                </h5>
                <p className="text-sm text-muted-foreground">
                  Understanding this concept helps your AI bot become more intelligent and respond appropriately to user needs.
                </p>
              </Card>
              
              <Card className="p-4">
                <h5 className="font-medium mb-2 flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Building Blocks</span>
                </h5>
                <p className="text-sm text-muted-foreground">
                  This is a fundamental concept that supports more advanced AI features like context awareness and personalization.
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="example" className="mt-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <span>See It In Action</span>
              </h4>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">User Input</Badge>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {conceptInfo.technicalExample.userInput}
                    </span>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">AI Identifies</Badge>
                    <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                      {conceptInfo.technicalExample.identifiedIntent}
                    </span>
                  </div>
                  
                  <div className="mt-3 p-3 bg-muted/50 rounded">
                    <p className="text-sm">
                      <strong>Explanation:</strong> {conceptInfo.technicalExample.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="practice" className="mt-6">
            {interactive && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Interactive Practice</span>
                </h4>
                
                <div className="p-4 rounded-lg border bg-card">
                  <p className="font-medium mb-4">{conceptInfo.practiceExercise.question}</p>
                  
                  <div className="space-y-3">
                    {conceptInfo.practiceExercise.scenarios.map((scenario, index) => (
                      <div key={index} className="p-3 rounded border hover:border-primary/50 transition-colors">
                        <p className="text-sm">
                          <strong>Message:</strong> {scenario.message}
                        </p>
                        {showAnswer && (
                          <p className="text-sm text-primary mt-2">
                            <strong>Intent:</strong> {scenario.intent}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="mt-4"
                  >
                    {showAnswer ? 'Hide Answers' : 'Show Answers'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tips" className="mt-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span>Pro Tips</span>
              </h4>
              
              <div className="space-y-3">
                {conceptInfo.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-primary/5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};