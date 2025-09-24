import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  BookOpen, 
  Brain,
  Sparkles,
  MessageCircle,
  HelpCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface Message {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  suggestions?: string[];
  relatedTopics?: string[];
}

interface TutorPersonality {
  id: string;
  name: string;
  avatar: string;
  description: string;
  specialties: string[];
  voiceStyle: 'friendly' | 'professional' | 'encouraging' | 'enthusiastic';
}

interface AITutorIntegrationProps {
  currentLesson?: string;
  studentLevel: 'little-explorers' | 'young-builders' | 'ai-ambassadors';
  onTopicSuggestion: (topic: string) => void;
  onLessonRecommendation: (lessonId: string) => void;
}

export const AITutorIntegration: React.FC<AITutorIntegrationProps> = ({
  currentLesson,
  studentLevel,
  onTopicSuggestion,
  onLessonRecommendation
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorPersonality | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { speak, stop, isPlaying } = useSpeechSynthesis();

  // AI Tutor Personalities
  const tutorPersonalities: TutorPersonality[] = [
    {
      id: 'aiko',
      name: 'AI-ko',
      avatar: '🤖',
      description: 'Your friendly AI learning companion',
      specialties: ['AI Basics', 'Machine Learning', 'Programming'],
      voiceStyle: 'friendly'
    },
    {
      id: 'professor-wise',
      name: 'Professor Wise',
      avatar: '👨‍🏫',
      description: 'Expert in advanced AI concepts',
      specialties: ['Neural Networks', 'Deep Learning', 'Ethics'],
      voiceStyle: 'professional'
    },
    {
      id: 'spark',
      name: 'Spark',
      avatar: '⚡',
      description: 'Enthusiastic coding mentor',
      specialties: ['Programming', 'Projects', 'Problem Solving'],
      voiceStyle: 'enthusiastic'
    },
    {
      id: 'gentle-guide',
      name: 'Gentle Guide',
      avatar: '🌟',
      description: 'Patient and encouraging tutor',
      specialties: ['Beginner Concepts', 'Confidence Building', 'Step-by-step Learning'],
      voiceStyle: 'encouraging'
    }
  ];

  // Initialize default tutor based on student level
  useEffect(() => {
    if (!selectedTutor) {
      const defaultTutor = 
        studentLevel === 'little-explorers' ? tutorPersonalities.find(t => t.id === 'gentle-guide') :
        studentLevel === 'young-builders' ? tutorPersonalities.find(t => t.id === 'aiko') :
        tutorPersonalities.find(t => t.id === 'professor-wise');
      
      setSelectedTutor(defaultTutor || tutorPersonalities[0]);
    }
  }, [selectedTutor, studentLevel]);

  // Setup speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition error. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (selectedTutor && messages.length === 0) {
      const greeting = generateGreeting();
      addTutorMessage(greeting);
    }
  }, [selectedTutor]);

  const generateGreeting = () => {
    const greetings = {
      'little-explorers': [
        "Hi there, little explorer! 🌟 I'm here to help you discover amazing things about AI!",
        "Welcome to our AI adventure! 🚀 What would you like to learn about today?",
        "Hello, bright star! ⭐ Ready to explore the wonderful world of artificial intelligence?"
      ],
      'young-builders': [
        "Hey there, young builder! 🔧 Ready to learn how to create amazing AI projects?",
        "Welcome to AI building camp! 🏗️ What AI creation are you excited to build?",
        "Hi, future innovator! 💡 Let's dive into some cool AI concepts together!"
      ],
      'ai-ambassadors': [
        "Greetings, future AI ambassador! 🎓 Ready to explore advanced AI concepts?",
        "Welcome to advanced AI studies! 🧠 What complex topic would you like to tackle today?",
        "Hello, AI pioneer! 🚀 Let's discuss the cutting-edge world of artificial intelligence!"
      ]
    };

    const levelGreetings = greetings[studentLevel] || greetings['young-builders'];
    return levelGreetings[Math.floor(Math.random() * levelGreetings.length)];
  };

  const addTutorMessage = (content: string, suggestions?: string[], relatedTopics?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'tutor',
      content,
      timestamp: new Date(),
      suggestions,
      relatedTopics
    };

    setMessages(prev => [...prev, message]);

    // Speak the message if audio is enabled
    if (audioEnabled && selectedTutor) {
      speak(content);
    }
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
  };

  const generateTutorResponse = (userInput: string): { response: string; suggestions?: string[]; relatedTopics?: string[] } => {
    const input = userInput.toLowerCase();
    
    // Context-aware responses based on current lesson and student level
    const responses = {
      'little-explorers': {
        'what is ai': {
          response: "Great question! 🤖 AI stands for Artificial Intelligence. It's like giving computers a brain so they can help us with cool things! AI is in your favorite apps, games, and even helps your voice assistant understand you!",
          suggestions: ["Tell me more about AI helpers", "How does AI learn?", "Can I build AI?"],
          relatedTopics: ["AI in daily life", "Smart helpers", "Voice assistants"]
        },
        'how does ai learn': {
          response: "AI learns just like you do! 📚 When you practice riding a bike, you get better each time. AI practices with lots of examples - like looking at thousands of cat pictures to learn what cats look like! The more it practices, the smarter it gets! ✨",
          suggestions: ["What examples does AI use?", "Can AI make mistakes?", "How long does AI take to learn?"],
          relatedTopics: ["Pattern recognition", "Training data", "Machine learning basics"]
        }
      },
      'young-builders': {
        'machine learning': {
          response: "Machine Learning is super cool! 🚀 It's a way to train computers to find patterns and make predictions. Think of it like teaching a computer to recognize your drawings - you show it lots of examples, and it learns to identify new ones! There are different types like supervised, unsupervised, and reinforcement learning.",
          suggestions: ["What's supervised learning?", "How do I start building ML models?", "What tools can I use?"],
          relatedTopics: ["Neural networks", "Training datasets", "Model evaluation"]
        },
        'neural networks': {
          response: "Neural networks are inspired by how our brains work! 🧠 They have layers of connected 'neurons' that process information. Each connection has a weight that determines how much influence it has. When training, these weights adjust to help the network make better predictions!",
          suggestions: ["How many layers do I need?", "What's backpropagation?", "Can I build one myself?"],
          relatedTopics: ["Deep learning", "Activation functions", "Gradient descent"]
        }
      },
      'ai-ambassadors': {
        'ethics': {
          response: "AI ethics is crucial for responsible development! ⚖️ We must consider bias in training data, fairness across different groups, privacy protection, and transparency in decision-making. Key principles include accountability, explainability, and ensuring AI augments rather than replaces human judgment in critical decisions.",
          suggestions: ["How do we detect bias?", "What's explainable AI?", "How can I build ethical AI?"],
          relatedTopics: ["Algorithmic fairness", "Bias detection", "Responsible AI frameworks"]
        },
        'future careers': {
          response: "The AI field offers incredible career opportunities! 🚀 From ML engineers and data scientists to AI researchers and ethics specialists. Key skills include programming (Python, R), mathematics, problem-solving, and understanding of human behavior. The field is rapidly evolving with new roles emerging regularly!",
          suggestions: ["What skills should I focus on?", "Which universities have good AI programs?", "How can I build a portfolio?"],
          relatedTopics: ["Computer science education", "Portfolio projects", "Industry trends"]
        }
      }
    };

    const levelResponses = responses[studentLevel];
    
    // Find matching response
    for (const [key, data] of Object.entries(levelResponses)) {
      if (input.includes(key.replace(/ /g, '')) || key.split(' ').some(word => input.includes(word))) {
        return data;
      }
    }

    // Default responses based on level
    const defaultResponses = {
      'little-explorers': "That's a wonderful question! 🌟 Let me think about that... AI is all around us helping make life easier and more fun! What specific part would you like to explore together?",
      'young-builders': "Great question! 🔧 That's exactly the kind of thinking that leads to amazing AI projects. Let me help you understand this concept better!",
      'ai-ambassadors': "Excellent inquiry! 🎓 This touches on some fascinating aspects of AI development. Let's dive deeper into this topic."
    };

    return {
      response: defaultResponses[studentLevel],
      suggestions: ["Tell me more", "Can you give an example?", "How does this work?"],
      relatedTopics: ["AI fundamentals", "Real-world applications", "Getting started"]
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    addUserMessage(inputMessage);
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const { response, suggestions, relatedTopics } = generateTutorResponse(inputMessage);
      addTutorMessage(response, suggestions, relatedTopics);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);

    setInputMessage('');
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const handleTopicClick = (topic: string) => {
    onTopicSuggestion(topic);
    toast.success(`Exploring topic: ${topic}`);
  };

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      {/* Tutor Selection */}
      <Card className="comic-card mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Choose Your AI Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tutorPersonalities.map(tutor => (
              <motion.button
                key={tutor.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTutor(tutor)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedTutor?.id === tutor.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-1">{tutor.avatar}</div>
                <div className="text-sm font-medium">{tutor.name}</div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="comic-card flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{selectedTutor?.avatar}</div>
              <div>
                <CardTitle className="text-lg">{selectedTutor?.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedTutor?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {selectedTutor && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedTutor.specialties.map(specialty => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-lg rounded-br-none'
                      : 'bg-muted rounded-lg rounded-bl-none'
                  } p-3`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs opacity-75">Suggestions:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Topics */}
                    {message.relatedTopics && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs opacity-75 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          Related Topics:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {message.relatedTopics.map((topic, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTopicClick(topic)}
                              className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full transition-colors"
                            >
                              {topic}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-lg rounded-bl-none p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {selectedTutor?.name} is thinking...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about AI..."
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                  isListening ? 'text-red-500' : 'text-muted-foreground'
                }`}
                disabled={!recognitionRef.current}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { icon: HelpCircle, text: "Help me understand", query: "Can you help me understand this concept better?" },
              { icon: Lightbulb, text: "Give me an example", query: "Can you give me a real-world example?" },
              { icon: Zap, text: "What's next?", query: "What should I learn next?" },
              { icon: BookOpen, text: "Recommend lesson", query: "Can you recommend a good lesson for me?" }
            ].map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setInputMessage(action.query);
                  handleSendMessage();
                }}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
              >
                <action.icon className="h-3 w-3" />
                {action.text}
              </motion.button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AITutorIntegration;