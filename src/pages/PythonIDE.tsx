import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  RotateCcw, 
  Save, 
  Code, 
  Brain, 
  Lightbulb, 
  BookOpen,
  Zap,
  Trophy,
  Star,
  CheckCircle,
  Target,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AIMascot } from "@/components/ai-tutor/AIMascot";
import { useProgressiveStreak } from '@/hooks/useProgressiveStreak';
import { ProgressiveStreak } from '@/components/enhanced/ProgressiveStreak';

const PythonIDE = () => {
  const [code, setCode] = useState(`# Welcome to Python IDE for Kids! 🐍
# Let's start with something fun!

print("Hello, young programmer! 🌟")
name = input("What's your name? ")
print(f"Nice to meet you, {name}!")

# Try changing this code or write your own!
`);
  
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [challenges, setChallenges] = useState([
    {
      id: 'hello',
      title: 'Say Hello',
      description: 'Write a program that says hello to the world',
      starterCode: 'print("Hello, World!")',
      solution: 'print("Hello, World!")',
      completed: false,
      difficulty: 'Easy',
      points: 10
    },
    {
      id: 'variables',
      title: 'Make Variables',
      description: 'Create variables for your name and age',
      starterCode: '# Create variables here\nname = ""\nage = 0\nprint(f"My name is {name} and I am {age} years old")',
      solution: 'name = "Alice"\nage = 10\nprint(f"My name is {name} and I am {age} years old")',
      completed: false,
      difficulty: 'Easy',
      points: 15
    },
    {
      id: 'loops',
      title: 'Count with Loops',
      description: 'Use a loop to count from 1 to 10',
      starterCode: '# Write a loop here\nfor i in range(?):\n    print(?)',
      solution: 'for i in range(1, 11):\n    print(i)',
      completed: false,
      difficulty: 'Medium',
      points: 25
    },
    {
      id: 'math',
      title: 'Calculator Fun',
      description: 'Create a simple calculator',
      starterCode: '# Calculator\nnum1 = 10\nnum2 = 5\n# Add your calculations here',
      solution: 'num1 = 10\nnum2 = 5\nprint(f"{num1} + {num2} = {num1 + num2}")',
      completed: false,
      difficulty: 'Easy',
      points: 20
    },
    {
      id: 'lists',
      title: 'My Favorite Things',
      description: 'Create a list of your favorite things',
      starterCode: '# Create a list\nfavorites = []\n# Add items and print them',
      solution: 'favorites = ["pizza", "games", "coding"]\nfor item in favorites:\n    print(f"I love {item}!")',
      completed: false,
      difficulty: 'Medium',
      points: 30
    },
    {
      id: 'conditionals',
      title: 'Age Checker',
      description: 'Check if someone can vote based on age',
      starterCode: 'age = 16\n# Use if/else to check voting eligibility',
      solution: 'age = 16\nif age >= 18:\n    print("You can vote!")\nelse:\n    print("You cannot vote yet.")',
      completed: false,
      difficulty: 'Medium',
      points: 25
    }
  ]);
  
  const [selectedChallenge, setSelectedChallenge] = useState(challenges[0]);
  const [aiHelperVisible, setAiHelperVisible] = useState(true);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [userScore, setUserScore] = useState(0);
  
  const { recordActivity } = useProgressiveStreak();

  // Simulate Python execution (for demo purposes)
  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running your code...\n');
    
    try {
      // Simple Python-like execution simulation
      const lines = code.split('\n');
      let result = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('print(')) {
          // Extract content from print statement
          const match = trimmed.match(/print\((.*)\)/);
          if (match) {
            let content = match[1];
            // Handle f-strings and variables (basic simulation)
            if (content.includes('f"') || content.includes("f'")) {
              content = content.replace(/f["'](.*)["']/, '$1');
              content = content.replace(/{(\w+)}/g, '$1'); // Basic variable substitution
            }
            content = content.replace(/['"]/g, ''); // Remove quotes
            result += content + '\n';
          }
        }
      }
      
      setTimeout(() => {
        setOutput(result || '✨ Code executed successfully!');
        setIsRunning(false);
        
        // Check if challenge is completed
        if (selectedChallenge && code.includes('print')) {
          const updatedChallenges = challenges.map(c => {
            if (c.id === selectedChallenge.id && !c.completed) {
              setUserScore(prev => prev + c.points);
              recordActivity('challenge', 85); // Record challenge completion
              toast({
                title: "Challenge Completed! 🎉",
                description: `You earned ${c.points} points! Keep coding!`
              });
              return { ...c, completed: true };
            }
            return c;
          });
          setChallenges(updatedChallenges);
        }
      }, 1000);
      
    } catch (error) {
      setTimeout(() => {
        setOutput('Oops! There seems to be an error in your code. Don\'t worry, even the best programmers make mistakes! 🤗');
        setIsRunning(false);
      }, 1000);
    }
  };

  const loadChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    setCode(challenge.starterCode);
    setOutput('');
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
  };

  const aiExplainCode = () => {
    const explanations = [
      "This print statement displays text on the screen! It's like talking to the computer. 🗣️",
      "Variables are like boxes that store information. You can put your name, age, or favorite color in them! 📦",
      "Loops help you repeat actions. It's like telling the computer 'do this 10 times' instead of writing it 10 times! 🔄",
      "Functions are like recipes - you write them once and can use them many times! 👨‍🍳"
    ];
    
    const randomExplanation = explanations[Math.floor(Math.random() * explanations.length)];
    toast({
      title: "AI Helper explains! 🤖",
      description: randomExplanation
    });
  };

  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalChallenges = challenges.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Python IDE for Kids 🐍
                </h1>
                <p className="text-sm text-muted-foreground">Learn Python programming with your AI friend!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{userScore} points</span>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {completedChallenges}/{totalChallenges} Challenges
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* AI Helper Sidebar */}
          {aiHelperVisible && (
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <AIMascot 
                  currentTopic={currentTopic}
                  onTopicChange={setCurrentTopic}
                  className="mb-4"
                />
                
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Lightbulb className="h-4 w-4" />
                      AI Helper
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={aiExplainCode}
                      className="w-full justify-start bg-background/50"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Explain My Code
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTopic('python-basics')}
                      className="w-full justify-start bg-background/50"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Learn Concepts
                    </Button>
                  </CardContent>
                </Card>

                {/* Progressive Learning Streak */}
                <ProgressiveStreak />
              </div>
            </div>
          )}

          {/* Main IDE Area */}
          <div className={`${aiHelperVisible ? 'lg:col-span-4' : 'lg:col-span-5'}`}>
            <Tabs defaultValue="code" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="code" className="data-[state=active]:bg-background">
                  <Code className="h-4 w-4 mr-2" />
                  Code Editor
                </TabsTrigger>
                <TabsTrigger value="challenges" className="data-[state=active]:bg-background">
                  <Trophy className="h-4 w-4 mr-2" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="learn" className="data-[state=active]:bg-background">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learn
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Code Editor */}
                  <Card className="bg-gradient-to-br from-background to-muted/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Code Editor
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={runCode}
                            disabled={isRunning}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            {isRunning ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            {isRunning ? 'Running...' : 'Run'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={clearCode}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Write your Python code here..."
                        className="min-h-[400px] font-mono text-sm bg-background/50 border-muted/50"
                      />
                    </CardContent>
                  </Card>

                  {/* Output */}
                  <Card className="bg-gradient-to-br from-background to-muted/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded border">
                          {output || 'Click "Run" to see your code output here! 🚀'}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-4">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      Python Challenges
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {completedChallenges}/{totalChallenges} Completed
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {userScore} Points
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challenges.map((challenge) => (
                    <Card
                      key={challenge.id}
                      className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedChallenge?.id === challenge.id 
                          ? 'border-primary bg-gradient-to-br from-primary/5 to-secondary/5' 
                          : 'border-muted/50 hover:border-muted'
                      } ${challenge.completed ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                      onClick={() => loadChallenge(challenge)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            {challenge.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {challenge.title}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant={challenge.difficulty === 'Easy' ? 'default' : 
                                     challenge.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {challenge.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {challenge.points}pts
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        {challenge.completed ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Trophy className="h-4 w-4" />
                            <span className="text-sm font-medium">Completed!</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadChallenge(challenge);
                            }}
                          >
                            Start Challenge
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="learn" className="space-y-6">
                <Card className="bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Python Concepts for Kids
                    </CardTitle>
                    <p className="text-muted-foreground">Learn the building blocks of Python programming!</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🖨️ Print Statements
                          <Badge variant="outline" className="text-xs">Beginner</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Use print() to display messages on the screen! It's like talking to the computer.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          print("Hello, World!")
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full"
                          onClick={() => setCode('print("Hello, World!")\nprint("I am learning Python!")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          📦 Variables
                          <Badge variant="outline" className="text-xs">Beginner</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Store information in variables like boxes! Give them names and put data inside.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          name = "Alice"<br/>
                          age = 12
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full"
                          onClick={() => setCode('name = "Your Name"\nage = 12\nprint(f"Hello, my name is {name} and I am {age} years old!")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🔄 Loops
                          <Badge variant="outline" className="text-xs">Intermediate</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Repeat actions without writing code multiple times! Save time and effort.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          for i in range(5):<br/>
                          &nbsp;&nbsp;print(i)
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full"
                          onClick={() => setCode('for i in range(1, 6):\n    print(f"Count: {i}")\nprint("Done counting!")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                    </div>

                    {/* Interactive Learning Section */}
                    <Card className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Interactive Learning Path
                        </CardTitle>
                        <p className="text-muted-foreground">Follow this step-by-step learning journey!</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg border">
                            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                            <div className="flex-1">
                              <h4 className="font-semibold">Start with Print</h4>
                              <p className="text-sm text-muted-foreground">Learn to display messages</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setCode('print("Hello, Python!")')}>
                              Start
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg border">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                            <div className="flex-1">
                              <h4 className="font-semibold">Store Data in Variables</h4>
                              <p className="text-sm text-muted-foreground">Create your first variables</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setCode('name = "Young Coder"\nprint(f"Welcome, {name}!")')}>
                              Next
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg border">
                            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                            <div className="flex-1">
                              <h4 className="font-semibold">Make Decisions</h4>
                              <p className="text-sm text-muted-foreground">Use if statements to choose</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setCode('age = 10\nif age < 13:\n    print("You are awesome!")\nelse:\n    print("You are still awesome!")')}>
                              Next
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonIDE;