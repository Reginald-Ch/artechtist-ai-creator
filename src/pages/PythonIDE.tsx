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
import { AIMascot } from "@/components/ai-tutor/AIMascot";
import { useProgressiveStreak } from '@/hooks/useProgressiveStreak';
import { ProgressiveStreak } from '@/components/enhanced/ProgressiveStreak';
import { PythonIDEChallenges } from '@/components/enhanced/PythonIDEChallenges';
import { toast } from 'sonner';

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
      title: 'Say Hello! 👋',
      description: 'Write a program that says hello to the world',
      starterCode: 'print("Hello, World!")',
      solution: 'print("Hello, World!")',
      completed: false,
      difficulty: 'Easy',
      points: 10
    },
    {
      id: 'variables',
      title: 'Make Variables 📦',
      description: 'Create variables for your name and age',
      starterCode: '# Create variables here\nname = ""\nage = 0\nprint(f"My name is {name} and I am {age} years old")',
      solution: 'name = "Alice"\nage = 10\nprint(f"My name is {name} and I am {age} years old")',
      completed: false,
      difficulty: 'Easy',
      points: 15
    },
    {
      id: 'math',
      title: 'Math Wizard 🧮',
      description: 'Create a simple calculator',
      starterCode: '# Calculator\nnum1 = 10\nnum2 = 5\n# Add your calculations here',
      solution: 'num1 = 10\nnum2 = 5\nprint(f"{num1} + {num2} = {num1 + num2}")',
      completed: false,
      difficulty: 'Easy',
      points: 20
    },
    {
      id: 'conditionals',
      title: 'Decision Maker 🤔',
      description: 'Check if someone can vote based on age',
      starterCode: 'age = 16\n# Use if/else to check voting eligibility',
      solution: 'age = 16\nif age >= 18:\n    print("You can vote!")\nelse:\n    print("You cannot vote yet.")',
      completed: false,
      difficulty: 'Medium',
      points: 25
    },
    {
      id: 'lists',
      title: 'My Favorite Things 💖',
      description: 'Create a list of your favorite things',
      starterCode: '# Create a list\nfavorites = []\n# Add items and print them',
      solution: 'favorites = ["pizza", "games", "coding"]\nfor item in favorites:\n    print(f"I love {item}!")',
      completed: false,
      difficulty: 'Medium',
      points: 30
    },
    {
      id: 'loops',
      title: 'Count with Loops 🔄',
      description: 'Use a loop to count from 1 to 10',
      starterCode: '# Write a loop here\nfor i in range(?):\n    print(?)',
      solution: 'for i in range(1, 11):\n    print(i)',
      completed: false,
      difficulty: 'Medium',
      points: 25
    },
    {
      id: 'functions',
      title: 'Function Creator 🛠️',
      description: 'Create a function that greets people',
      starterCode: '# Define a function\ndef greet(name):\n    # Your code here\n    pass\n\n# Call the function\ngreet("Alice")',
      solution: 'def greet(name):\n    print(f"Hello, {name}! Nice to meet you!")\n\ngreet("Alice")',
      completed: false,
      difficulty: 'Medium',
      points: 35
    },
    {
      id: 'guessing-game',
      title: 'Number Guessing Game 🎯',
      description: 'Create a simple guessing game',
      starterCode: 'import random\n\nsecret = random.randint(1, 10)\nguess = int(input("Guess a number between 1-10: "))\n# Add your game logic here',
      solution: 'import random\n\nsecret = random.randint(1, 10)\nguess = int(input("Guess a number between 1-10: "))\nif guess == secret:\n    print("You won!")\nelse:\n    print(f"Sorry! The number was {secret}")',
      completed: false,
      difficulty: 'Hard',
      points: 40
    },
    {
      id: 'string-fun',
      title: 'String Magic ✨',
      description: 'Play with text and strings',
      starterCode: 'text = "Python is Fun"\n# Try different string methods',
      solution: 'text = "Python is Fun"\nprint(text.upper())\nprint(text.lower())\nprint(text.replace("Fun", "Awesome"))',
      completed: false,
      difficulty: 'Easy',
      points: 20
    },
    {
      id: 'dictionaries',
      title: 'Data Detective 🕵️',
      description: 'Use dictionaries to store information',
      starterCode: '# Create a student dictionary\nstudent = {}\n# Add name, age, grade information',
      solution: 'student = {"name": "Alex", "age": 12, "grade": 7}\nprint(f"Student: {student[\'name\']}, Age: {student[\'age\']}")',
      completed: false,
      difficulty: 'Medium',
      points: 30
    },
    {
      id: 'classes',
      title: 'Pet Creator 🐕',
      description: 'Create a simple Pet class',
      starterCode: 'class Pet:\n    def __init__(self, name, animal_type):\n        # Your code here\n        pass\n    \n    def speak(self):\n        # Your code here\n        pass\n\n# Create a pet\nmy_pet = Pet("Buddy", "dog")',
      solution: 'class Pet:\n    def __init__(self, name, animal_type):\n        self.name = name\n        self.type = animal_type\n    \n    def speak(self):\n        print(f"{self.name} says hello!")\n\nmy_pet = Pet("Buddy", "dog")\nmy_pet.speak()',
      completed: false,
      difficulty: 'Hard',
      points: 45
    },
    {
      id: 'file-io',
      title: 'File Master 📁',
      description: 'Read and write files',
      starterCode: '# Write to a file\nwith open("my_file.txt", "w") as file:\n    # Your code here\n    pass\n\n# Read from a file\n# Your code here',
      solution: 'with open("my_file.txt", "w") as file:\n    file.write("Hello from Python!")\n\nwith open("my_file.txt", "r") as file:\n    content = file.read()\n    print(content)',
      completed: false,
      difficulty: 'Hard',
      points: 40
    },
    {
      id: 'error-handling',
      title: 'Error Handler 🛡️',
      description: 'Handle errors gracefully',
      starterCode: 'try:\n    number = int(input("Enter a number: "))\n    result = 10 / number\n    # Add error handling\nexcept:\n    # Your code here\n    pass',
      solution: 'try:\n    number = int(input("Enter a number: "))\n    result = 10 / number\n    print(f"Result: {result}")\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")\nexcept ValueError:\n    print("Please enter a valid number!")',
      completed: false,
      difficulty: 'Hard',
      points: 50
    },
    {
      id: 'api-basics',
      title: 'Web Explorer 🌐',
      description: 'Learn about working with web data',
      starterCode: '# Simulate getting data from the web\ndata = {"weather": "sunny", "temperature": 75}\n# Process the data',
      solution: 'data = {"weather": "sunny", "temperature": 75}\nprint(f"Today is {data[\'weather\']} and {data[\'temperature\']}°F")\nif data["temperature"] > 70:\n    print("Great weather for coding outside!")',
      completed: false,
      difficulty: 'Medium',
      points: 35
    },
    {
      id: 'final-project',
      title: 'Final Challenge 🏆',
      description: 'Build a complete mini-app combining everything!',
      starterCode: '# Build a personal diary app\n# Features: add entries, view entries, save to file\n\nclass Diary:\n    def __init__(self):\n        # Your code here\n        pass\n    \n    def add_entry(self, entry):\n        # Your code here\n        pass\n    \n    def view_entries(self):\n        # Your code here\n        pass\n\n# Create and use your diary\nmy_diary = Diary()',
      solution: 'class Diary:\n    def __init__(self):\n        self.entries = []\n    \n    def add_entry(self, entry):\n        from datetime import datetime\n        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")\n        self.entries.append(f"[{timestamp}] {entry}")\n        print("Entry added!")\n    \n    def view_entries(self):\n        if not self.entries:\n            print("No entries yet!")\n        for entry in self.entries:\n            print(entry)\n\nmy_diary = Diary()\nmy_diary.add_entry("Today I learned Python!")\nmy_diary.view_entries()',
      completed: false,
      difficulty: 'Expert',
      points: 100
    },
    {
      id: 'functions',
      title: 'Create Functions',
      description: 'Write a function that greets people',
      starterCode: '# Define a function called greet\ndef greet(name):\n    # Add your code here\n    pass\n\n# Call your function\ngreet("Alice")',
      solution: 'def greet(name):\n    print(f"Hello, {name}! Nice to meet you!")\n\ngreet("Alice")',
      completed: false,
      difficulty: 'Medium',
      points: 35
    },
    {
      id: 'dictionaries',
      title: 'Student Records',
      description: 'Create a dictionary to store student information',
      starterCode: '# Create a student dictionary\nstudent = {\n    # Add student info here\n}\nprint(student)',
      solution: 'student = {\n    "name": "Alice",\n    "age": 12,\n    "grade": "7th",\n    "subjects": ["Math", "Science", "English"]\n}\nprint(f"Student: {student[\'name\']}, Age: {student[\'age\']}")',
      completed: false,
      difficulty: 'Hard',
      points: 40
    },
    {
      id: 'turtle',
      title: 'Drawing Shapes',
      description: 'Use turtle graphics to draw a square',
      starterCode: '# Import turtle\nimport turtle\n\n# Create a turtle\nt = turtle.Turtle()\n\n# Draw a square\n# Add your code here',
      solution: 'import turtle\n\nt = turtle.Turtle()\nfor i in range(4):\n    t.forward(100)\n    t.right(90)\n\nturtle.done()',
      completed: false,
      difficulty: 'Medium',
      points: 30
    },
    {
      id: 'randomgame',
      title: 'Number Guessing Game',
      description: 'Create a simple guessing game',
      starterCode: 'import random\n\n# Generate random number 1-10\nsecret = random.randint(1, 10)\n# Add your guessing game logic',
      solution: 'import random\n\nsecret = random.randint(1, 10)\nguess = int(input("Guess a number 1-10: "))\n\nif guess == secret:\n    print("You win!")\nelse:\n    print(f"Sorry, it was {secret}")',
      completed: false,
      difficulty: 'Hard',
      points: 45
    },
    {
      id: 'classes',
      title: 'Animal Class',
      description: 'Create a class to represent animals',
      starterCode: '# Create an Animal class\nclass Animal:\n    def __init__(self, name, sound):\n        # Add your code here\n        pass\n    \n    def make_sound(self):\n        # Add your code here\n        pass\n\n# Create an animal\ndog = Animal("Dog", "Woof")',
      solution: 'class Animal:\n    def __init__(self, name, sound):\n        self.name = name\n        self.sound = sound\n    \n    def make_sound(self):\n        print(f"The {self.name} says {self.sound}!")\n\ndog = Animal("Dog", "Woof")\ndog.make_sound()',
      completed: false,
      difficulty: 'Hard',
      points: 50
    },
    {
      id: 'filehandling',
      title: 'Save Your Story',
      description: 'Write text to a file and read it back',
      starterCode: '# Write to a file\nstory = "Once upon a time..."\n# Add file handling code here',
      solution: 'story = "Once upon a time, there was a young programmer who loved Python!"\n\n# Write to file\nwith open("story.txt", "w") as file:\n    file.write(story)\n\n# Read from file\nwith open("story.txt", "r") as file:\n    content = file.read()\n    print(content)',
      completed: false,
      difficulty: 'Hard',
      points: 45
    },
    {
      id: 'apidata',
      title: 'Weather Data',
      description: 'Work with JSON data like a weather API',
      starterCode: 'import json\n\n# Sample weather data\nweather_data = \'{"city": "New York", "temp": 75, "condition": "sunny"}\'\n# Parse and display the data',
      solution: 'import json\n\nweather_data = \'{"city": "New York", "temp": 75, "condition": "sunny"}\'\nweather = json.loads(weather_data)\n\nprint(f"Weather in {weather[\'city\']}: {weather[\'temp\']}°F, {weather[\'condition\']}")',
      completed: false,
      difficulty: 'Hard',
      points: 40
    },
    {
      id: 'algorithm',
      title: 'Sorting Challenge',
      description: 'Sort a list of numbers without using built-in sort',
      starterCode: 'numbers = [64, 34, 25, 12, 22, 11, 90]\n# Implement bubble sort algorithm\nprint("Original:", numbers)\n# Add sorting code here\nprint("Sorted:", numbers)',
      solution: 'numbers = [64, 34, 25, 12, 22, 11, 90]\nprint("Original:", numbers)\n\n# Bubble sort\nfor i in range(len(numbers)):\n    for j in range(0, len(numbers)-i-1):\n        if numbers[j] > numbers[j+1]:\n            numbers[j], numbers[j+1] = numbers[j+1], numbers[j]\n\nprint("Sorted:", numbers)',
      completed: false,
      difficulty: 'Expert',
      points: 60
    },
    {
      id: 'web-scraping',
      title: 'Web Data Collector',
      description: 'Learn to collect data from websites',
      starterCode: '# Simulate web data collection\nwebsite_data = ["Python", "JavaScript", "React", "Node.js"]\n# Process the data',
      solution: 'website_data = ["Python", "JavaScript", "React", "Node.js"]\n\nprint("Programming languages found:")\nfor i, language in enumerate(website_data, 1):\n    print(f"{i}. {language}")\n\nprint(f"\\nTotal languages: {len(website_data)}")',
      completed: false,
      difficulty: 'Expert',
      points: 55
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
              toast.success(`Challenge Completed! 🎉 You earned ${c.points} points!`);
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
    toast.success(`AI Helper explains! 🤖 ${randomExplanation}`);
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

              <TabsContent value="challenges" className="space-y-6">
                <PythonIDEChallenges 
                  onChallengeComplete={(challengeId, score) => {
                    recordActivity('challenge', score, challengeId, 'python');
                    toast.success(`Challenge completed! Earned ${score} points.`);
                  }}
                />
                
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
                      13 Essential Python Lessons for Kids
                    </CardTitle>
                    <p className="text-muted-foreground">Master Python step by step with interactive lessons!</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {/* Lesson 1: Print Statements */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🖨️ Print Statements
                          <Badge variant="outline" className="text-xs">Lesson 1</Badge>
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
                          className="mt-2 w-full hover:bg-blue-100"
                          onClick={() => setCode('print("Hello, World!")\nprint("I am learning Python!")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 2: Variables */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          📦 Variables
                          <Badge variant="outline" className="text-xs">Lesson 2</Badge>
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
                          className="mt-2 w-full hover:bg-green-100"
                          onClick={() => setCode('name = "Your Name"\nage = 12\nprint(f"Hello, my name is {name} and I am {age} years old!")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 3: Numbers & Math */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🔢 Numbers & Math
                          <Badge variant="outline" className="text-xs">Lesson 3</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Python can do math! Add, subtract, multiply, and divide numbers.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          x = 10 + 5<br/>
                          print(x)
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-orange-100"
                          onClick={() => setCode('# Math is fun!\nx = 10 + 5\ny = 20 - 3\nz = 4 * 6\nprint(f"Addition: {x}")\nprint(f"Subtraction: {y}")\nprint(f"Multiplication: {z}")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 4: Input from User */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          💬 User Input
                          <Badge variant="outline" className="text-xs">Lesson 4</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Ask users questions and get their answers with input()!
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          name = input("What's your name? ")<br/>
                          print(f"Hi {`{name}`}!")
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-pink-100"
                          onClick={() => setCode('# Ask the user questions\nname = input("What\'s your name? ")\nage = input("How old are you? ")\nprint(f"Hello {name}! You are {age} years old.")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 5: If Statements */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🤔 If Statements
                          <Badge variant="outline" className="text-xs">Lesson 5</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Make decisions in your code! Use if, elif, and else.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          age = 10<br/>
                          if age &lt; 13:<br/>
                          &nbsp;&nbsp;print("You're a kid!")
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-purple-100"
                          onClick={() => setCode('age = 12\nif age < 13:\n    print("You\'re still a kid!")\nelif age < 20:\n    print("You\'re a teenager!")\nelse:\n    print("You\'re an adult!")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 6: Loops */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🔄 Loops
                          <Badge variant="outline" className="text-xs">Lesson 6</Badge>
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
                          className="mt-2 w-full hover:bg-indigo-100"
                          onClick={() => setCode('for i in range(1, 6):\n    print(f"Count: {i}")\nprint("Done counting!")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 7: Lists */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          📝 Lists
                          <Badge variant="outline" className="text-xs">Lesson 7</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Store multiple items in one container! Like a shopping list.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          fruits = ["apple", "banana"]<br/>
                          print(fruits[0])
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-teal-100"
                          onClick={() => setCode('# My favorite things\nfruits = ["apple", "banana", "orange"]\ncolors = ["red", "blue", "green"]\n\nprint("My fruits:")\nfor fruit in fruits:\n    print(f"- {fruit}")\n\nprint("\\nMy colors:")\nfor color in colors:\n    print(f"- {color}")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 8: Functions */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          ⚙️ Functions
                          <Badge variant="outline" className="text-xs">Lesson 8</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create your own commands! Functions are like recipes you can use again.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          def say_hello():<br/>
                          &nbsp;&nbsp;print("Hello!")
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-yellow-100"
                          onClick={() => setCode('def greet(name):\n    print(f"Hello, {name}! Nice to meet you!")\n\ndef add_numbers(a, b):\n    result = a + b\n    print(f"{a} + {b} = {result}")\n    return result\n\n# Use the functions\ngreet("Alice")\ngreet("Bob")\nadd_numbers(5, 3)')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 9: Dictionaries */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          📚 Dictionaries
                          <Badge variant="outline" className="text-xs">Lesson 9</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Store information with labels! Like a real dictionary with words and meanings.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          person = {`{"name": "Alice", "age": 12}`}<br/>
                          print(person["name"])
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-red-100"
                          onClick={() => setCode('# Student information\nstudent = {\n    "name": "Alice",\n    "age": 12,\n    "grade": "7th",\n    "favorite_subject": "Math"\n}\n\nprint(f"Student: {student[\'name\']}")\nprint(f"Age: {student[\'age\']}")\nprint(f"Grade: {student[\'grade\']}")\nprint(f"Loves: {student[\'favorite_subject\']}")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 10: While Loops */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🔁 While Loops
                          <Badge variant="outline" className="text-xs">Lesson 10</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Keep doing something until a condition is met! Great for games.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          count = 0<br/>
                          while count &lt; 3:<br/>
                          &nbsp;&nbsp;print(count)
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-cyan-100"
                          onClick={() => setCode('# Count down from 5\ncount = 5\nwhile count > 0:\n    print(f"Countdown: {count}")\n    count = count - 1\nprint("Blast off! 🚀")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 11: String Methods */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          ✂️ String Magic
                          <Badge variant="outline" className="text-xs">Lesson 11</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Do cool things with text! Make it UPPERCASE, lowercase, or split it apart.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          text = "Hello World"<br/>
                          print(text.upper())
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-emerald-100"
                          onClick={() => setCode('# Text magic!\nname = "alice wonderland"\n\nprint(f"Original: {name}")\nprint(f"Uppercase: {name.upper()}")\nprint(f"Title Case: {name.title()}")\nprint(f"Split words: {name.split()}")\nprint(f"Replace: {name.replace(\'alice\', \'bob\')}")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 12: Random Numbers */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🎲 Random Fun
                          <Badge variant="outline" className="text-xs">Lesson 12</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Generate random numbers and choices! Perfect for games and surprises.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          import random<br/>
                          print(random.randint(1, 10))
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-violet-100"
                          onClick={() => setCode('import random\n\n# Random number game\nprint("🎲 Random Magic!")\nprint(f"Random number 1-10: {random.randint(1, 10)}")\nprint(f"Random number 1-100: {random.randint(1, 100)}")\n\n# Random choice\ncolors = ["red", "blue", "green", "yellow"]\nprint(f"Random color: {random.choice(colors)}")\n\n# Flip a coin\ncoin = random.choice(["Heads", "Tails"])\nprint(f"Coin flip: {coin}")')}
                        >
                          Try it now!
                        </Button>
                      </div>
                      
                      {/* Lesson 13: Classes & Objects */}
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/20 dark:to-rose-900/20 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🏗️ Classes & Objects
                          <Badge variant="outline" className="text-xs">Lesson 13</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create your own data types! Like making a blueprint for objects.
                        </p>
                        <code className="text-xs bg-background/80 p-2 rounded block border">
                          class Pet:<br/>
                          &nbsp;&nbsp;def __init__(self, name):<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;self.name = name
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full hover:bg-rose-100"
                          onClick={() => setCode('class Pet:\n    def __init__(self, name, animal_type):\n        self.name = name\n        self.type = animal_type\n        self.happiness = 50\n    \n    def feed(self):\n        self.happiness += 10\n        print(f"{self.name} is happy! Happiness: {self.happiness}")\n    \n    def play(self):\n        self.happiness += 15\n        print(f"{self.name} loves to play! Happiness: {self.happiness}")\n\n# Create pets\ndog = Pet("Buddy", "Dog")\ncat = Pet("Whiskers", "Cat")\n\ndog.feed()\ndog.play()\ncat.feed()')}
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
