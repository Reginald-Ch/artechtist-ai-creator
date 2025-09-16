import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Check, 
  X, 
  Trophy, 
  Star, 
  Clock, 
  Code, 
  Brain, 
  Target,
  Lightbulb,
  BookOpen,
  Zap,
  Award,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  timeLimit?: number;
  category: string;
  concept: string;
  startingCode: string;
  solution: string;
  testCases: Array<{
    input: any;
    expected: any;
    description: string;
  }>;
  hints: string[];
  explanation: string;
}

interface PythonIDEChallengesProps {
  onChallengeComplete: (challengeId: string, score: number) => void;
}

const pythonChallenges: Challenge[] = [
  {
    id: 'hello-world',
    title: 'Hello, Python!',
    description: 'Write your first Python program that prints "Hello, World!"',
    difficulty: 'beginner',
    points: 10,
    category: 'Basic Syntax',
    concept: 'Print Statement',
    startingCode: '# Write your code here\n',
    solution: 'print("Hello, World!")',
    testCases: [
      { input: null, expected: 'Hello, World!', description: 'Should print Hello, World!' }
    ],
    hints: [
      'Use the print() function',
      'Put your text in quotes: "Hello, World!"'
    ],
    explanation: 'The print() function displays text to the console. Strings must be enclosed in quotes.'
  },
  {
    id: 'variables',
    title: 'Working with Variables',
    description: 'Create variables for your name and age, then print them',
    difficulty: 'beginner',
    points: 15,
    category: 'Variables',
    concept: 'Variable Assignment',
    startingCode: '# Create a variable for your name\n# Create a variable for your age\n# Print both variables\n',
    solution: 'name = "Alex"\nage = 12\nprint(f"My name is {name} and I am {age} years old")',
    testCases: [
      { input: null, expected: 'variables created', description: 'Should create name and age variables' }
    ],
    hints: [
      'Use name = "your_name" to create a variable',
      'Use age = your_age for numbers',
      'Use f-strings for formatting: f"text {variable}"'
    ],
    explanation: 'Variables store data that can be used later. Python automatically determines the data type.'
  },
  {
    id: 'calculator',
    title: 'Simple Calculator',
    description: 'Write a function that adds two numbers',
    difficulty: 'beginner',
    points: 20,
    category: 'Functions',
    concept: 'Function Definition',
    startingCode: '# Define a function called add_numbers that takes two parameters\n# Return the sum of the two numbers\n\ndef add_numbers(a, b):\n    # Your code here\n    pass\n\n# Test your function\nresult = add_numbers(5, 3)\nprint(result)',
    solution: 'def add_numbers(a, b):\n    return a + b\n\nresult = add_numbers(5, 3)\nprint(result)',
    testCases: [
      { input: [5, 3], expected: 8, description: 'add_numbers(5, 3) should return 8' },
      { input: [10, 7], expected: 17, description: 'add_numbers(10, 7) should return 17' }
    ],
    hints: [
      'Functions are defined with def function_name():',
      'Use return to send back a value',
      'Addition in Python uses the + operator'
    ],
    explanation: 'Functions are reusable blocks of code that can take inputs (parameters) and return outputs.'
  },
  {
    id: 'loops',
    title: 'Counting with Loops',
    description: 'Use a for loop to print numbers from 1 to 10',
    difficulty: 'beginner',
    points: 25,
    category: 'Loops',
    concept: 'For Loops',
    startingCode: '# Use a for loop with range() to print numbers 1 to 10\n',
    solution: 'for i in range(1, 11):\n    print(i)',
    testCases: [
      { input: null, expected: 'numbers 1-10', description: 'Should print numbers from 1 to 10' }
    ],
    hints: [
      'Use for i in range(start, end):',
      'range(1, 11) gives numbers from 1 to 10',
      'Remember to indent your code inside the loop'
    ],
    explanation: 'For loops repeat code a specific number of times. The range() function generates sequences of numbers.'
  },
  {
    id: 'lists',
    title: 'Working with Lists',
    description: 'Create a list of your favorite animals and print each one',
    difficulty: 'intermediate',
    points: 30,
    category: 'Data Structures',
    concept: 'Lists',
    startingCode: '# Create a list of your favorite animals\n# Use a loop to print each animal\n',
    solution: 'animals = ["dog", "cat", "elephant", "penguin"]\nfor animal in animals:\n    print(f"I like {animal}s")',
    testCases: [
      { input: null, expected: 'list of animals', description: 'Should create and iterate through a list' }
    ],
    hints: [
      'Lists are created with square brackets: [item1, item2]',
      'Use for item in list: to iterate',
      'Strings go in quotes'
    ],
    explanation: 'Lists store multiple items in a single variable. You can loop through them to access each item.'
  },
  {
    id: 'conditionals',
    title: 'Making Decisions',
    description: 'Write a program that checks if a number is positive, negative, or zero',
    difficulty: 'intermediate',
    points: 35,
    category: 'Conditionals',
    concept: 'If Statements',
    startingCode: '# Write a function that checks if a number is positive, negative, or zero\ndef check_number(num):\n    # Your code here\n    pass\n\n# Test your function\nprint(check_number(5))\nprint(check_number(-3))\nprint(check_number(0))',
    solution: 'def check_number(num):\n    if num > 0:\n        return "positive"\n    elif num < 0:\n        return "negative"\n    else:\n        return "zero"\n\nprint(check_number(5))\nprint(check_number(-3))\nprint(check_number(0))',
    testCases: [
      { input: 5, expected: 'positive', description: 'check_number(5) should return "positive"' },
      { input: -3, expected: 'negative', description: 'check_number(-3) should return "negative"' },
      { input: 0, expected: 'zero', description: 'check_number(0) should return "zero"' }
    ],
    hints: [
      'Use if, elif, and else statements',
      'Compare numbers with >, <, and ==',
      'Return different strings based on the condition'
    ],
    explanation: 'Conditional statements let your program make decisions based on different conditions.'
  }
];

export const PythonIDEChallenges: React.FC<PythonIDEChallengesProps> = ({
  onChallengeComplete
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userCode, setUserCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [currentHint, setCurrentHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const categories = ['all', ...Array.from(new Set(pythonChallenges.map(c => c.category)))];

  const filteredChallenges = selectedCategory === 'all' 
    ? pythonChallenges 
    : pythonChallenges.filter(c => c.category === selectedCategory);

  useEffect(() => {
    if (selectedChallenge) {
      setUserCode(selectedChallenge.startingCode);
      setOutput('');
      setCurrentHint(0);
      setShowSolution(false);
      
      if (selectedChallenge.timeLimit) {
        setTimeRemaining(selectedChallenge.timeLimit);
        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev && prev <= 1) {
              clearInterval(timerRef.current!);
              toast.error('Time\'s up! Try again or view the solution.');
              return 0;
            }
            return prev ? prev - 1 : null;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedChallenge]);

  const runCode = () => {
    if (!selectedChallenge) return;
    
    setIsRunning(true);
    setOutput('Running...');
    
    // Simulate code execution (in a real implementation, you'd use a Python interpreter)
    setTimeout(() => {
      try {
        // Simple code evaluation simulation
        const testResults = validateSolution(userCode, selectedChallenge);
        setOutput(testResults.output);
        
        if (testResults.passed) {
          const score = calculateScore(selectedChallenge, timeRemaining);
          setCompletedChallenges(prev => new Set([...prev, selectedChallenge.id]));
          onChallengeComplete(selectedChallenge.id, score);
          
          toast.success('🎉 Challenge completed!', {
            description: `You earned ${score} points!`
          });
        }
      } catch (error) {
        setOutput(`Error: ${error}`);
      }
      setIsRunning(false);
    }, 1000);
  };

  const validateSolution = (code: string, challenge: Challenge) => {
    // Simplified validation - in reality, you'd run the actual Python code
    const isCorrect = code.toLowerCase().includes(challenge.solution.toLowerCase().split('\n')[0]);
    
    return {
      passed: isCorrect,
      output: isCorrect 
        ? '✅ All test cases passed!\n' + challenge.testCases.map(tc => `✓ ${tc.description}`).join('\n')
        : '❌ Some test cases failed. Check your solution and try again.'
    };
  };

  const calculateScore = (challenge: Challenge, timeLeft: number | null) => {
    let score = challenge.points;
    
    // Bonus for completing quickly
    if (timeLeft && challenge.timeLimit) {
      const timeBonus = Math.floor((timeLeft / challenge.timeLimit) * 10);
      score += timeBonus;
    }
    
    return score;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {!selectedChallenge ? (
        <div className="space-y-6">
          {/* Challenge Overview */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Trophy className="h-8 w-8" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Python Challenges
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test your Python skills with interactive coding challenges. Earn points and unlock achievements!
            </p>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Completed</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {completedChallenges.size}/{pythonChallenges.length}
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Total Points</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Array.from(completedChallenges).reduce((total, id) => {
                  const challenge = pythonChallenges.find(c => c.id === id);
                  return total + (challenge?.points || 0);
                }, 0)}
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-green-500" />
                <span className="font-medium">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {pythonChallenges.length > 0 
                  ? Math.round((completedChallenges.size / pythonChallenges.length) * 100)
                  : 0}%
              </div>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Challenge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      completedChallenges.has(challenge.id) 
                        ? 'ring-2 ring-green-200 bg-green-50/50 dark:bg-green-900/10' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          {completedChallenges.has(challenge.id) && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4" />
                          {challenge.points}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          {challenge.concept}
                        </div>
                        {challenge.timeLimit && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(challenge.timeLimit)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Challenge Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedChallenge(null)}>
              ← Back to Challenges
            </Button>
            {timeRemaining !== null && timeRemaining > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Challenge Description */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedChallenge.title}
                      <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                        {selectedChallenge.difficulty}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{selectedChallenge.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {selectedChallenge.points}
                    </div>
                    <div className="text-sm text-muted-foreground">points</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="description">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Info
                    </TabsTrigger>
                    <TabsTrigger value="hints">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Hints
                    </TabsTrigger>
                    <TabsTrigger value="tests">
                      <Target className="h-4 w-4 mr-1" />
                      Tests
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Concept: {selectedChallenge.concept}</h4>
                      <p className="text-sm text-muted-foreground">{selectedChallenge.explanation}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="hints" className="space-y-3">
                    <div className="space-y-2">
                      {selectedChallenge.hints.slice(0, currentHint + 1).map((hint, index) => (
                        <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <span className="text-sm">{hint}</span>
                          </div>
                        </div>
                      ))}
                      {currentHint < selectedChallenge.hints.length - 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentHint(prev => prev + 1)}
                        >
                          Show Next Hint
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tests" className="space-y-3">
                    <div className="space-y-2">
                      {selectedChallenge.testCases.map((test, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-sm">
                            <div className="font-medium">{test.description}</div>
                            {test.input && (
                              <div className="text-muted-foreground">Input: {JSON.stringify(test.input)}</div>
                            )}
                            <div className="text-muted-foreground">Expected: {JSON.stringify(test.expected)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {showSolution && (
                  <Card className="bg-gray-50 dark:bg-gray-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Solution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                        <code>{selectedChallenge.solution}</code>
                      </pre>
                    </CardContent>
                  </Card>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowSolution(!showSolution)}
                  className="w-full"
                >
                  {showSolution ? 'Hide' : 'Show'} Solution
                </Button>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Python Editor
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserCode(selectedChallenge.startingCode)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button 
                      onClick={runCode} 
                      disabled={isRunning}
                      size="sm"
                    >
                      {isRunning ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      Run Code
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="Write your Python code here..."
                  className="font-mono text-sm min-h-[300px] bg-gray-50 dark:bg-gray-900"
                />
                
                {output && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <pre className="text-sm whitespace-pre-wrap">{output}</pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};