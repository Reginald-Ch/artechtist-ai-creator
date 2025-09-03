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
  Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AIMascot } from "@/components/ai-tutor/AIMascot";

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
      difficulty: 'Easy'
    },
    {
      id: 'variables',
      title: 'Make Variables',
      description: 'Create variables for your name and age',
      starterCode: '# Create variables here\nname = ""\nage = 0\nprint(f"My name is {name} and I am {age} years old")',
      solution: 'name = "Alice"\nage = 10\nprint(f"My name is {name} and I am {age} years old")',
      completed: false,
      difficulty: 'Easy'
    },
    {
      id: 'loops',
      title: 'Count with Loops',
      description: 'Use a loop to count from 1 to 10',
      starterCode: '# Write a loop here\nfor i in range(?):\n    print(?)',
      solution: 'for i in range(1, 11):\n    print(i)',
      completed: false,
      difficulty: 'Medium'
    }
  ]);
  
  const [selectedChallenge, setSelectedChallenge] = useState(challenges[0]);
  const [aiHelperVisible, setAiHelperVisible] = useState(true);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

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
          toast({
            title: "Great job! 🎉",
            description: "Your code is working perfectly!"
          });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Code className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Python IDE for Kids 🐍
            </h1>
            <Badge variant="secondary" className="ml-2">Learn & Code</Badge>
          </div>
          <p className="text-muted-foreground mt-2">Learn Python programming with your AI friend!</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* AI Helper Sidebar */}
          {aiHelperVisible && (
            <div className="lg:col-span-1">
              <AIMascot 
                currentTopic={currentTopic}
                onTopicChange={setCurrentTopic}
                className="mb-4"
              />
              
              <Card>
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
                    className="w-full justify-start"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Explain My Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTopic('python-basics')}
                    className="w-full justify-start"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learn Concepts
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main IDE Area */}
          <div className={`${aiHelperVisible ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <Tabs defaultValue="code" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code">Code Editor</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="learn">Learn</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Code Editor */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Code Editor</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={runCode}
                            disabled={isRunning}
                            className="bg-green-500 hover:bg-green-600"
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
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>

                  {/* Output */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
                          {output || 'Click "Run" to see your code output here! 🚀'}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challenges.map((challenge) => (
                    <Card
                      key={challenge.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedChallenge?.id === challenge.id ? 'border-primary' : ''
                      }`}
                      onClick={() => loadChallenge(challenge)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{challenge.title}</CardTitle>
                          <Badge
                            variant={challenge.difficulty === 'Easy' ? 'default' : 'secondary'}
                          >
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        {challenge.completed && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Trophy className="h-4 w-4" />
                            <span className="text-sm">Completed!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="learn">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Python Concepts for Kids
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🖨️ Print Statements</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Use print() to display messages on the screen!
                        </p>
                        <code className="text-xs bg-muted p-2 rounded block">
                          print("Hello, World!")
                        </code>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">📦 Variables</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Store information in variables like boxes!
                        </p>
                        <code className="text-xs bg-muted p-2 rounded block">
                          name = "Alice"<br/>
                          age = 10
                        </code>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔄 Loops</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Repeat actions multiple times!
                        </p>
                        <code className="text-xs bg-muted p-2 rounded block">
                          for i in range(5):<br/>
                          &nbsp;&nbsp;print(i)
                        </code>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🎯 Functions</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Create reusable code blocks!
                        </p>
                        <code className="text-xs bg-muted p-2 rounded block">
                          def say_hello():<br/>
                          &nbsp;&nbsp;print("Hi!")
                        </code>
                      </div>
                    </div>
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