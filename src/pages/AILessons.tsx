import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, Play, CheckCircle, Clock, Star, Sparkles, Zap, GraduationCap, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ComicLesson } from "@/components/ai-tutor/ComicLesson";
import { FlashcardQuiz } from "@/components/FlashcardQuiz";
import { InteractiveQuiz } from "@/components/ai-tutor/InteractiveQuiz";
import { enhancedComicLessons } from "@/data/enhancedComicLessons";

const AILessons = () => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showInteractiveQuiz, setShowInteractiveQuiz] = useState(false);

  // Enhanced AI Learning Data
  const aiTopics = [
    'Intro to AI',
    'Intro to AI and ML', 
    'Intro to Data',
    'Intro to Bias',
    'Intro to Chatbots',
    'Intro to Intents',
    'Intro to Special-intents',
    'Intro to Follow-Up intents',
    'Conversational design',
    'Chatbot personality design',
    'Design thinking'
  ];

  // Enhanced AI Lessons with flashcards for each topic
  const aiLessonsData = aiTopics.map((topic, index) => ({
    id: `lesson-${index + 1}`,
    title: topic,
    description: getTopicDescription(topic),
    flashcards: getFlashcardsForTopic(topic),
    duration: '10-15 mins',
    difficulty: index < 3 ? 'Beginner' : index < 7 ? 'Intermediate' : 'Advanced',
    isComplete: completedLessons.has(`lesson-${index + 1}`)
  }));

  function getTopicDescription(topic: string): string {
    const descriptions: Record<string, string> = {
      'Intro to AI': 'Learn the fundamentals of artificial intelligence and its applications',
      'Intro to AI and ML': 'Understand the relationship between AI and machine learning',
      'Intro to Data': 'Explore how data drives AI systems and decision making',
      'Intro to Bias': 'Understand bias in AI systems and ethical considerations',
      'Intro to Chatbots': 'Learn the basics of conversational AI and chatbot technology',
      'Intro to Intents': 'Master the concept of intents in chatbot development',
      'Intro to Special-intents': 'Explore special system intents and their purposes',
      'Intro to Follow-Up intents': 'Learn about context and follow-up conversations',
      'Conversational design': 'Design natural and engaging chatbot conversations',
      'Chatbot personality design': 'Create compelling personalities for your AI assistants',
      'Design thinking': 'Apply design thinking principles to AI development'
    };
    return descriptions[topic] || 'Interactive lesson with hands-on examples';
  }

  function getFlashcardsForTopic(topic: string) {
    const flashcardSets: Record<string, any[]> = {
      'Intro to AI': [
        { question: 'What does AI stand for?', answer: 'Artificial Intelligence - the simulation of human intelligence in machines' },
        { question: 'Name three types of AI applications', answer: 'Natural language processing, computer vision, and machine learning' },
        { question: 'What is the goal of AI?', answer: 'To create machines that can think, learn, and make decisions like humans' }
      ],
      'Intro to AI and ML': [
        { question: 'What is machine learning?', answer: 'A subset of AI where computers learn patterns from data without being explicitly programmed' },
        { question: 'What is the difference between AI and ML?', answer: 'AI is the broader concept of machines thinking like humans, while ML is a specific approach to achieve AI' },
        { question: 'Name three types of machine learning', answer: 'Supervised learning, unsupervised learning, and reinforcement learning' }
      ],
      'Intro to Data': [
        { question: 'Why is data important for AI?', answer: 'Data provides the information AI systems need to learn patterns and make predictions' },
        { question: 'What is training data?', answer: 'The dataset used to teach machine learning models how to make decisions' },
        { question: 'What makes good training data?', answer: 'Large, diverse, accurate, and representative datasets' }
      ],
      'Intro to Bias': [
        { question: 'What is bias in AI systems?', answer: 'Systematic errors or unfairness in AI decisions due to prejudiced training data or algorithms' },
        { question: 'How can bias be introduced into AI?', answer: 'Through biased training data, algorithm design, or human prejudices in development' },
        { question: 'Why is addressing bias important?', answer: 'To ensure fair, ethical, and inclusive AI systems for all users' }
      ],
      'Intro to Chatbots': [
        { question: 'What is a chatbot?', answer: 'A computer program designed to simulate conversation with human users' },
        { question: 'What are training phrases in chatbots?', answer: 'Different ways users might express the same intent or request to the bot' },
        { question: 'Name two types of chatbots', answer: 'Rule-based chatbots and AI-powered chatbots' }
      ],
      'Intro to Intents': [
        { question: 'What is an intent in chatbots?', answer: 'The goal or purpose behind a user\'s message to the chatbot' },
        { question: 'Why are intents important?', answer: 'Intents help the bot understand what the user wants to accomplish' },
        { question: 'Give an example of an intent', answer: 'Booking a flight, checking weather, or asking for help' }
      ],
      'Intro to Special-intents': [
        { question: 'What are special intents?', answer: 'Pre-built intents for common functions like greetings, cancellation, and help requests' },
        { question: 'Name three special intents', answer: 'Welcome intent, fallback intent, and goodbye intent' },
        { question: 'When would you use a fallback intent?', answer: 'When the bot doesn\'t understand the user\'s input' }
      ],
      'Intro to Follow-Up intents': [
        { question: 'What are follow-up intents?', answer: 'Intents that maintain context from previous conversation turns' },
        { question: 'Why are follow-ups important?', answer: 'They enable more natural, contextual conversations' },
        { question: 'Give an example of a follow-up', answer: 'After asking about pizza size, following up with toppings' }
      ],
      'Conversational design': [
        { question: 'What is conversational design?', answer: 'The practice of designing intuitive, human-like interactions between users and chatbots' },
        { question: 'What makes good conversation flow?', answer: 'Clear, natural, contextual, and helpful exchanges' },
        { question: 'Name a key principle of conversational design', answer: 'Keep responses concise and actionable' }
      ],
      'Chatbot personality design': [
        { question: 'Why is personality important for chatbots?', answer: 'It makes interactions more engaging and builds user trust' },
        { question: 'Name three personality traits for chatbots', answer: 'Helpful, friendly, and professional' },
        { question: 'How do you maintain consistent personality?', answer: 'Through consistent tone, language, and response style' }
      ],
      'Design thinking': [
        { question: 'What is design thinking?', answer: 'A human-centered approach to innovation and problem solving' },
        { question: 'Name the five stages of design thinking', answer: 'Empathize, Define, Ideate, Prototype, and Test' },
        { question: 'How does design thinking apply to AI?', answer: 'It ensures AI solutions are user-focused and solve real problems' }
      ]
    };
    return flashcardSets[topic] || [];
  }

  // Interactive Quiz Questions (Kahoot-style)
  const quizQuestions = [
    {
      id: '1',
      question: 'What does AI stand for?',
      options: ['Automated Intelligence', 'Artificial Intelligence', 'Advanced Interface', 'Algorithmic Integration'],
      correctAnswer: 1,
      explanation: 'AI stands for Artificial Intelligence - the simulation of human intelligence processes by machines.',
      difficulty: 'easy' as const,
      points: 10
    },
    {
      id: '2',
      question: 'Which of these is NOT a type of machine learning?',
      options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Emotional Learning'],
      correctAnswer: 3,
      explanation: 'Emotional Learning is not a recognized type of machine learning. The three main types are supervised, unsupervised, and reinforcement learning.',
      difficulty: 'medium' as const,
      points: 15
    },
    {
      id: '3',
      question: 'What is the main purpose of training data in machine learning?',
      options: ['To confuse the algorithm', 'To teach the algorithm patterns', 'To slow down processing', 'To increase storage needs'],
      correctAnswer: 1,
      explanation: 'Training data is used to teach machine learning algorithms to recognize patterns and make predictions.',
      difficulty: 'easy' as const,
      points: 10
    },
    {
      id: '4',
      question: 'Which of these is an example of AI bias?',
      options: ['A chatbot that works 24/7', 'A facial recognition system that works poorly on darker skin tones', 'An AI that processes data quickly', 'A recommendation system that suggests products'],
      correctAnswer: 1,
      explanation: 'AI bias occurs when systems make unfair or discriminatory decisions, often due to biased training data.',
      difficulty: 'hard' as const,
      points: 20
    },
    {
      id: '5',
      question: 'What is an intent in chatbot design?',
      options: ['A programming language', 'A user\'s goal or purpose', 'A type of database', 'A chatbot personality'],
      correctAnswer: 1,
      explanation: 'An intent represents what the user wants to accomplish when they interact with the chatbot.',
      difficulty: 'medium' as const,
      points: 15
    },
    {
      id: '6',
      question: 'What are training phrases in chatbot development?',
      options: ['Commands for the developer', 'Different ways users might express the same intent', 'Error messages', 'Programming instructions'],
      correctAnswer: 1,
      explanation: 'Training phrases are various ways users might express the same intent, helping the chatbot understand different phrasings.',
      difficulty: 'medium' as const,
      points: 15
    },
    {
      id: '7',
      question: 'What is a special intent in chatbots?',
      options: ['A broken intent', 'A pre-built intent for common functions', 'An intent that costs money', 'An intent only for developers'],
      correctAnswer: 1,
      explanation: 'Special intents are pre-built intents that handle common user requests like greetings, help, and cancellation.',
      difficulty: 'medium' as const,
      points: 15
    },
    {
      id: '8',
      question: 'What are follow-up intents used for?',
      options: ['Ending conversations', 'Continuing conversations based on context', 'Starting new conversations', 'Deleting conversations'],
      correctAnswer: 1,
      explanation: 'Follow-up intents allow chatbots to maintain context and continue conversations naturally.',
      difficulty: 'hard' as const,
      points: 20
    },
    {
      id: '9',
      question: 'What is the main goal of conversational design?',
      options: ['Making conversations longer', 'Creating natural, helpful interactions', 'Using complex vocabulary', 'Avoiding user questions'],
      correctAnswer: 1,
      explanation: 'Conversational design aims to create natural, intuitive, and helpful interactions between users and chatbots.',
      difficulty: 'medium' as const,
      points: 15
    },
    {
      id: '10',
      question: 'Why is chatbot personality important?',
      options: ['It makes chatbots expensive', 'It helps users connect and trust the bot', 'It slows down responses', 'It complicates development'],
      correctAnswer: 1,
      explanation: 'A well-designed personality helps users feel more comfortable and builds trust in the chatbot interaction.',
      difficulty: 'easy' as const,
      points: 10
    }
  ];

  const handleLessonComplete = (lessonId: string, score: number) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    setSelectedLesson(null);
    console.log(`Lesson ${lessonId} completed with score: ${score}`);
  };

  const handleLessonProgress = (lessonId: string, panelIndex: number) => {
    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: panelIndex
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (selectedLesson && enhancedComicLessons[selectedLesson as keyof typeof enhancedComicLessons]) {
    const lesson = enhancedComicLessons[selectedLesson as keyof typeof enhancedComicLessons];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedLesson(null)}
              className="mb-4"
            >
              ← Back to Lessons
            </Button>
          </div>
          
          <ComicLesson
            lessonId={lesson.id}
            title={lesson.title}
            character={lesson.character}
            panels={lesson.panels}
            onComplete={handleLessonComplete}
            onProgress={handleLessonProgress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl comic-float">🌟</div>
        <div className="absolute top-20 right-20 text-3xl comic-float" style={{animationDelay: '1s'}}>🚀</div>
        <div className="absolute bottom-20 left-20 text-4xl comic-float" style={{animationDelay: '2s'}}>⚡</div>
        <div className="absolute bottom-10 right-10 text-3xl comic-float" style={{animationDelay: '3s'}}>🎯</div>
      </div>

      {/* Header */}
      <header className="relative border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 text-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                AI Learning Hub
              </h1>
              <p className="text-sm text-muted-foreground">🌟 Learn AI Through Interactive Lessons!</p>
            </div>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" className="border-2 border-primary/20 hover:border-primary">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="speech-bubble inline-block mb-6 comic-bounce">
            <p className="text-lg font-comic text-primary font-semibold">
              Hi there! Ready to learn about AI? 🤖✨
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 text-6xl bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full flex items-center justify-center border-4 border-primary/20 animate-pulse">
              🤖
            </div>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Choose Your
            <br />
            <span className="text-6xl">AI Learning Path</span>
          </h2>
          <p className="text-xl font-comic text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Embark on exciting comic adventures that make AI concepts easy to understand and fun to learn! 
            Meet diverse African characters and explore the amazing world of artificial intelligence.
          </p>
          
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <Badge className="text-sm px-4 py-2 bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4 mr-1" />
              Learn AI Concepts
            </Badge>
            <Badge className="text-sm px-4 py-2 bg-secondary text-secondary-foreground">
              <Zap className="h-4 w-4 mr-1" />
              Interactive Stories
            </Badge>
            <Badge className="text-sm px-4 py-2 bg-muted text-muted-foreground">
              <Star className="h-4 w-4 mr-1" />
              Kid-Friendly
            </Badge>
            <Button
              onClick={() => setShowFlashcards(true)}
              className="text-sm px-4 py-2 bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300 mr-2"
            >
              <GraduationCap className="h-4 w-4 mr-1" />
              Flashcards 📚
            </Button>
            <Button
              onClick={() => setShowInteractiveQuiz(true)}
              className="text-sm px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transition-all duration-300"
            >
              <Brain className="h-4 w-4 mr-1" />
              Interactive Quiz 🎯
            </Button>
          </div>
        </div>

        {/* Learning Adventures Section */}
        <div className="mb-12">
            <div className="text-center mb-8">
            <Badge className="text-base px-6 py-2 mb-4 bg-gradient-to-r from-primary to-primary-glow text-white animate-glow-pulse">
              <Sparkles className="h-4 w-4 mr-2" />
              🎓 Learning Adventures
            </Badge>
            <h3 className="text-3xl font-bold text-foreground mb-2 animate-slide-in-left">
              Your AI Learning Journey
            </h3>
            <p className="text-muted-foreground animate-fade-in">
              Track your progress as you master AI concepts through fun adventures!
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                🧠 Critical Thinking
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-secondary text-secondary-foreground">
                🔬 Problem Solving
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-muted text-muted-foreground">
                🎨 Creative Learning
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center relative group">
              <div className="comic-card rounded-2xl p-6 h-24 flex flex-col justify-center hover:scale-105 transition-all duration-300 cursor-pointer group-hover:shadow-xl">
                <div className="text-4xl font-bold font-fredoka text-blue-600 group-hover:scale-110 transition-transform">{completedLessons.size}</div>
                <div className="text-sm font-comic text-muted-foreground">Adventures Completed</div>
                {completedLessons.size > 0 && <div className="progress-starburst"></div>}
              </div>
            </div>
            <div className="text-center group">
              <div className="comic-card rounded-2xl p-6 h-24 flex flex-col justify-center hover:scale-105 transition-all duration-300 cursor-pointer group-hover:shadow-xl">
                <div className="text-4xl font-bold font-fredoka text-purple-600 group-hover:scale-110 transition-transform">{Object.keys(enhancedComicLessons).length}</div>
                <div className="text-sm font-comic text-muted-foreground">Total Adventures</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="comic-card rounded-2xl p-6 h-24 flex flex-col justify-center hover:scale-105 transition-all duration-300 cursor-pointer group-hover:shadow-xl">
                <div className="text-4xl font-bold font-fredoka text-green-600 group-hover:scale-110 transition-transform">
                  {Math.round((completedLessons.size / Object.keys(enhancedComicLessons).length) * 100)}%
                </div>
                <div className="text-sm font-comic text-muted-foreground">Progress Made</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="comic-card rounded-2xl p-6 h-24 flex flex-col justify-center hover:scale-105 transition-all duration-300 cursor-pointer group-hover:shadow-xl">
                <div className="text-4xl font-bold font-fredoka text-orange-600 group-hover:scale-110 transition-transform">
                  {Object.values(lessonProgress).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm font-comic text-muted-foreground">Panels Explored</div>
              </div>
            </div>
          </div>
          
          {/* Learning Path Visualization */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-green-950/20 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="font-comic text-sm text-muted-foreground">Beginner</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="font-comic text-sm text-muted-foreground">Intermediate</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-green-500"></div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" style={{animationDelay: '1s'}}></div>
                <span className="font-comic text-sm text-muted-foreground">Advanced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Adventures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(enhancedComicLessons).map(([lessonId, lesson], index) => {
            const isCompleted = completedLessons.has(lessonId);
            const progress = lessonProgress[lessonId] || 0;
            const totalPanels = lesson.panels?.length || 0;
            
            return (
              <Card 
                key={lessonId} 
                className={`comic-card rounded-3xl cursor-pointer border-0 overflow-hidden comic-bounce ${
                  isCompleted ? 'ring-2 ring-green-400' : ''
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => setSelectedLesson(lessonId)}
              >
                <CardHeader className="relative p-6">
                  {/* Character Avatar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="character-avatar">
                      {lesson.character === 'AI-ko' ? '🤖' : 
                       lesson.character === 'Student Amara' ? '👩🏾‍🎓' :
                       lesson.character === 'Teacher Kwame' ? '👨🏿‍🏫' :
                       lesson.character === 'Elder Fatima' ? '👵🏾' :
                       lesson.character === 'Inventor Zuberi' ? '👨🏾‍💻' :
                       lesson.character === 'Market Vendor Asha' ? '👩🏾‍💼' :
                       lesson.character === 'Village Chief' ? '👴🏿' : '🧙🏾‍♂️'}
                    </div>
                    {isCompleted && (
                      <div className="relative">
                        <CheckCircle className="h-8 w-8 text-green-500 comic-pulse" />
                        <div className="absolute -top-1 -right-1 text-xl">🏆</div>
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl font-fredoka font-bold mb-3 text-foreground leading-tight">
                    {lesson.title}
                  </CardTitle>
                  <CardDescription className="font-comic text-base mb-4 leading-relaxed text-muted-foreground">
                    {lesson.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge 
                      className={`font-comic font-semibold px-3 py-1 ${
                        lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        lesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}
                    >
                      ⭐ {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline" className="font-comic flex items-center gap-1 px-3 py-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </Badge>
                    <Badge variant="outline" className="font-comic px-3 py-1">
                      📖 {totalPanels} panels
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-0">
                  {progress > 0 && !isCompleted && totalPanels > 0 && (
                    <div className="mb-6 comic-card rounded-2xl p-4">
                      <div className="flex justify-between text-sm font-comic text-muted-foreground mb-2">
                        <span>Adventure Progress</span>
                        <span>{progress}/{totalPanels} panels</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${(progress / totalPanels) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className={`w-full h-14 text-lg font-comic font-semibold rounded-2xl transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:scale-105'
                    }`}
                    variant="default"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Review Adventure 🔄
                      </>
                    ) : progress > 0 ? (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Continue Adventure ▶️
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Start Adventure 🚀
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Achievement Section */}
        {completedLessons.size > 0 && (
          <div className="mt-16 text-center relative">
            <div className="comic-card rounded-3xl p-12 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 text-white overflow-hidden relative">
              {/* Floating celebration elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-8 text-4xl comic-float">🎉</div>
                <div className="absolute top-8 right-12 text-3xl comic-float" style={{animationDelay: '0.5s'}}>⭐</div>
                <div className="absolute bottom-8 left-12 text-4xl comic-float" style={{animationDelay: '1s'}}>🏆</div>
                <div className="absolute bottom-4 right-8 text-3xl comic-float" style={{animationDelay: '1.5s'}}>🌟</div>
              </div>
              
              <div className="relative z-10">
                <div className="character-avatar w-20 h-20 text-6xl mx-auto mb-6 bg-white/20">
                  🤖
                </div>
                <h3 className="text-4xl font-fredoka font-bold mb-4">Awesome Progress! 🎊</h3>
                <p className="text-xl font-comic opacity-95 mb-6 max-w-2xl mx-auto">
                  Amazing work! You've completed <strong>{completedLessons.size}</strong> out of <strong>{Object.keys(enhancedComicLessons).length}</strong> AI adventures. 
                  Keep exploring the fascinating world of artificial intelligence!
                </p>
                
                {completedLessons.size === Object.keys(enhancedComicLessons).length && (
                  <div className="comic-bounce">
                    <div className="speech-bubble bg-white text-purple-600 font-comic text-xl font-bold mb-6 inline-block">
                      🏆 Congratulations! You're now an AI Master! 🏆
                    </div>
                    <div>
                      <Link to="/builder">
                        <Button 
                          size="lg" 
                          className="font-comic font-bold text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100 rounded-2xl hover:scale-105 transition-all"
                        >
                          Build Your First AI Bot 🤖
                          <Brain className="ml-2 h-6 w-6" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flashcard Quiz Modal */}
      {showFlashcards && (
        <FlashcardQuiz
          cards={aiLessonsData.flatMap(lesson => lesson.flashcards.map(card => ({
            id: card.question,
            question: card.question,
            answer: card.answer,
            category: lesson.title,
            difficulty: lesson.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
          })))}
          onComplete={(score) => {
            console.log('Quiz completed with score:', score);
            setShowFlashcards(false);
          }}
          onClose={() => setShowFlashcards(false)}
        />
      )}

      {/* Interactive Quiz Modal */}
      {showInteractiveQuiz && (
        <InteractiveQuiz
          title="AI Learning Quiz"
          questions={quizQuestions}
          onComplete={(score) => {
            console.log('Interactive quiz completed with score:', score);
            setShowInteractiveQuiz(false);
          }}
          onClose={() => setShowInteractiveQuiz(false)}
        />
      )}
    </div>
  );
};

export default AILessons;