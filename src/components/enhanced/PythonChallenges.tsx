import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Code, 
  Trophy, 
  Clock, 
  Star, 
  CheckCircle, 
  Play,
  Lightbulb,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  timeLimit: number; // in minutes
  category: string;
  prompt: string;
  solution: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  hints: string[];
}

const pythonChallenges: Challenge[] = [
  {
    id: 'calculator',
    title: 'Simple Calculator',
    description: 'Build a calculator that can add, subtract, multiply, and divide',
    difficulty: 'beginner',
    points: 100,
    timeLimit: 15,
    category: 'basics',
    prompt: `Create a simple calculator program that:
1. Asks the user for two numbers
2. Asks for an operation (+, -, *, /)
3. Performs the calculation and shows the result

Make sure to handle division by zero!`,
    solution: `# Simple Calculator
num1 = float(input("Enter first number: "))
operation = input("Enter operation (+, -, *, /): ")
num2 = float(input("Enter second number: "))

if operation == "+":
    result = num1 + num2
elif operation == "-":
    result = num1 - num2
elif operation == "*":
    result = num1 * num2
elif operation == "/":
    if num2 != 0:
        result = num1 / num2
    else:
        print("Error: Cannot divide by zero!")
        exit()
else:
    print("Error: Invalid operation!")
    exit()

print(f"Result: {num1} {operation} {num2} = {result}")`,
    testCases: [
      { input: "5 + 3", expectedOutput: "8" },
      { input: "10 - 4", expectedOutput: "6" },
      { input: "6 * 7", expectedOutput: "42" }
    ],
    hints: [
      "Use input() to get user input",
      "Convert strings to numbers with float()",
      "Use if/elif statements for different operations"
    ]
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    description: 'Create a secure random password generator',
    difficulty: 'intermediate',
    points: 200,
    timeLimit: 25,
    category: 'projects',
    prompt: `Build a password generator that:
1. Asks the user for password length
2. Includes uppercase, lowercase, numbers, and symbols
3. Generates a random secure password
4. Shows the password strength

Use the 'random' and 'string' modules for this challenge!`,
    solution: `import random
import string

def generate_password(length):
    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    symbols = "!@#$%^&*"
    
    # Ensure password has at least one of each type
    password = [
        random.choice(lowercase),
        random.choice(uppercase),
        random.choice(digits),
        random.choice(symbols)
    ]
    
    # Fill the rest randomly
    all_chars = lowercase + uppercase + digits + symbols
    for i in range(length - 4):
        password.append(random.choice(all_chars))
    
    # Shuffle the password
    random.shuffle(password)
    return ''.join(password)

def check_strength(password):
    score = 0
    if len(password) >= 8: score += 1
    if any(c.islower() for c in password): score += 1
    if any(c.isupper() for c in password): score += 1
    if any(c.isdigit() for c in password): score += 1
    if any(c in "!@#$%^&*" for c in password): score += 1
    
    if score >= 4: return "Strong"
    elif score >= 3: return "Medium"
    else: return "Weak"

# Main program
length = int(input("Enter password length (minimum 8): "))
if length < 8:
    print("Password should be at least 8 characters long!")
    length = 8

password = generate_password(length)
strength = check_strength(password)

print(f"Generated password: {password}")
print(f"Password strength: {strength}")`,
    testCases: [
      { input: "8", expectedOutput: "Password with 8 characters" },
      { input: "12", expectedOutput: "Password with 12 characters" }
    ],
    hints: [
      "Import 'random' and 'string' modules",
      "Use random.choice() to pick random characters",
      "Ensure password has different character types"
    ]
  },
  {
    id: 'guess-number',
    title: 'Number Guessing Game',
    description: 'Create a fun number guessing game with hints',
    difficulty: 'beginner',
    points: 150,
    timeLimit: 20,
    category: 'games',
    prompt: `Create a number guessing game that:
1. Generates a random number between 1-100
2. Gives the player 7 attempts to guess
3. Provides "too high" or "too low" hints
4. Congratulates on correct guess or reveals answer`,
    solution: `import random

def number_guessing_game():
    secret_number = random.randint(1, 100)
    attempts = 7
    
    print("🎮 Welcome to the Number Guessing Game!")
    print("I'm thinking of a number between 1 and 100.")
    print(f"You have {attempts} attempts to guess it!")
    
    for attempt in range(1, attempts + 1):
        try:
            guess = int(input(f"\\nAttempt {attempt}: Enter your guess: "))
            
            if guess == secret_number:
                print(f"🎉 Congratulations! You guessed it in {attempt} attempts!")
                print(f"The number was {secret_number}")
                return
            elif guess < secret_number:
                print("📈 Too low! Try a higher number.")
            else:
                print("📉 Too high! Try a lower number.")
                
            remaining = attempts - attempt
            if remaining > 0:
                print(f"You have {remaining} attempts left.")
                
        except ValueError:
            print("Please enter a valid number!")
            
    print(f"\\n😔 Game Over! The number was {secret_number}")
    print("Better luck next time!")

# Start the game
number_guessing_game()`,
    testCases: [
      { input: "50", expectedOutput: "Higher or lower hint" },
      { input: "Random guess", expectedOutput: "Appropriate feedback" }
    ],
    hints: [
      "Use random.randint(1, 100) for the secret number",
      "Use a for loop for the attempts",
      "Compare guess with secret_number for hints"
    ]
  }
];

interface PythonChallengesProps {
  onChallengeComplete: (challengeId: string, score: number) => void;
}

export const PythonChallenges: React.FC<PythonChallengesProps> = ({
  onChallengeComplete
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [userCode, setUserCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setUserCode('# Write your solution here!\n');
    setTimeRemaining(challenge.timeLimit * 60); // Convert to seconds
    setShowSolution(false);
    setShowHints(false);
    setIsRunning(true);
  };

  const submitSolution = () => {
    if (!selectedChallenge) return;
    
    // Simulate code testing
    const score = Math.floor(Math.random() * 30) + 70; // 70-100%
    setCompletedChallenges(prev => new Set([...prev, selectedChallenge.id]));
    onChallengeComplete(selectedChallenge.id, score);
    setIsRunning(false);
    
    toast.success(`🎉 Challenge completed! Score: ${score}%`);
  };

  // Timer effect would go here in a real implementation
  React.useEffect(() => {
    if (!isRunning || timeRemaining === null || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          setIsRunning(false);
          toast.error('⏰ Time\'s up! Challenge ended.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedChallenge) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="h-8 w-8" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Python Challenges
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test your Python skills with real-world coding challenges. Build projects, solve problems, and earn points!
          </p>
        </div>

        {/* Challenge Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Challenges</TabsTrigger>
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {pythonChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        completedChallenges.has(challenge.id) 
                          ? 'ring-2 ring-green-200 bg-green-50/50 dark:bg-green-900/10' 
                          : 'hover:scale-105'
                      }`}
                      onClick={() => startChallenge(challenge)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{challenge.timeLimit}m</span>
                            {completedChallenges.has(challenge.id) && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{challenge.points} points</span>
                          </div>
                          <Button size="sm" variant={completedChallenges.has(challenge.id) ? "outline" : "default"}>
                            {completedChallenges.has(challenge.id) ? 'Retry' : 'Start'}
                            <Play className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Filter by category tabs would be implemented similarly */}
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedChallenge(null)}>
          ← Back to Challenges
        </Button>
        <div className="flex items-center gap-4">
          <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
            {selectedChallenge.difficulty}
          </Badge>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Challenge Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instructions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {selectedChallenge.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {selectedChallenge.points} points
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedChallenge.timeLimit} minutes
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {selectedChallenge.prompt}
                </pre>
              </div>
            </ScrollArea>
            
            <div className="mt-4 space-y-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHints(!showHints)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showHints ? 'Hide' : 'Show'} Hints
              </Button>
              
              {showHints && (
                <div className="space-y-2">
                  {selectedChallenge.hints.map((hint, index) => (
                    <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                      💡 {hint}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Code Editor Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Your Solution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="Write your Python solution here..."
              className="w-full h-64 p-4 text-sm font-mono bg-muted border rounded-lg resize-none"
            />
            
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={submitSolution}
                disabled={!isRunning || userCode.trim().length < 10}
                className="flex-1"
              >
                Submit Solution
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? 'Hide' : 'Show'} Solution
              </Button>
            </div>
            
            {showSolution && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Solution:</h4>
                <ScrollArea className="h-32">
                  <pre className="text-xs font-mono text-green-800 dark:text-green-200">
                    {selectedChallenge.solution}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};