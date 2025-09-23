import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Code, 
  Lightbulb, 
  ArrowRight,
  Star,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PythonLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  codeExample: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  concepts: string[];
  exercises: Array<{
    question: string;
    solution: string;
    hint: string;
  }>;
}

const pythonLessons: PythonLesson[] = [
  {
    id: 'intro-python',
    title: 'Introduction to Python',
    description: 'Learn the basics of Python programming language',
    content: `
Python is a powerful, easy-to-learn programming language. It's great for beginners because:

• Simple, readable syntax
• Powerful built-in features
• Large community and libraries
• Used in many fields: web development, data science, AI, and more!

Let's start with the most basic Python program - saying hello to the world!
    `,
    codeExample: `# This is your first Python program!
print("Hello, World!")

# You can also print variables
name = "Python"
print(f"Hello, {name}!")

# Try changing the message above!`,
    difficulty: 'beginner',
    duration: '5 min',
    concepts: ['Print statements', 'Variables', 'Strings'],
    exercises: [
      {
        question: 'Print your name using a variable',
        solution: 'name = "Your Name"\nprint(name)',
        hint: 'Create a variable with your name and print it'
      }
    ]
  },
  {
    id: 'variables-types',
    title: 'Variables and Data Types',
    description: 'Understanding different types of data in Python',
    content: `
Variables are like boxes that store different types of information:

• **Strings**: Text like "Hello" or 'Python'
• **Numbers**: Integers (1, 2, 3) and decimals (3.14, 2.5)
• **Booleans**: True or False values
• **Lists**: Collections of items [1, 2, 3]

Python automatically figures out what type your variable is!
    `,
    codeExample: `# Different types of variables
name = "Alice"           # String
age = 12                # Integer
height = 4.5            # Float (decimal)
is_student = True       # Boolean
favorite_colors = ["blue", "green", "red"]  # List

# Print them all
print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height} feet")
print(f"Is student: {is_student}")
print(f"Favorite colors: {favorite_colors}")`,
    difficulty: 'beginner',
    duration: '8 min',
    concepts: ['Variables', 'Data types', 'Lists', 'Type system'],
    exercises: [
      {
        question: 'Create variables for a pet: name, age, and type',
        solution: 'pet_name = "Buddy"\npet_age = 3\npet_type = "dog"',
        hint: 'Think about what information describes a pet'
      }
    ]
  },
  {
    id: 'control-flow',
    title: 'Making Decisions with If Statements',
    description: 'Learn how to make your programs smart with conditions',
    content: `
If statements let your program make decisions! Just like in real life:

• **if**: "If it's raining, take an umbrella"
• **elif**: "Otherwise, if it's sunny, wear sunglasses"  
• **else**: "Otherwise, just go outside"

Your program can check conditions and do different things based on what's true.
    `,
    codeExample: `# Making decisions in Python
weather = "sunny"
temperature = 75

if weather == "rainy":
    print("Take an umbrella! ☔")
elif weather == "sunny" and temperature > 70:
    print("Perfect day for the park! ☀️")
elif temperature < 32:
    print("It's freezing! Wear a coat! 🧥")
else:
    print("Have a nice day! 😊")

# Try changing the weather and temperature values!`,
    difficulty: 'beginner',
    duration: '10 min',
    concepts: ['If statements', 'Comparison operators', 'Logic', 'Conditions'],
    exercises: [
      {
        question: 'Write a program that checks if someone can vote (age 18+)',
        solution: 'age = 16\nif age >= 18:\n    print("You can vote!")\nelse:\n    print("Not old enough to vote yet")',
        hint: 'Use an if statement to compare the age with 18'
      }
    ]
  },
  {
    id: 'loops',
    title: 'Repeating with Loops',
    description: 'Learn how to repeat actions efficiently',
    content: `
Loops help you repeat things without writing the same code over and over:

• **for loops**: Repeat a specific number of times
• **while loops**: Keep repeating while something is true
• **range()**: Creates sequences of numbers

Instead of writing print("Hello") 10 times, just use a loop!
    `,
    codeExample: `# For loops - repeat a specific number of times
print("Counting to 5:")
for i in range(1, 6):
    print(f"Count: {i}")

print("\nSaying hello to friends:")
friends = ["Alice", "Bob", "Charlie"]
for friend in friends:
    print(f"Hello, {friend}! 👋")

# While loops - repeat while condition is true
count = 0
while count < 3:
    print(f"While loop count: {count}")
    count += 1`,
    difficulty: 'intermediate',
    duration: '12 min',
    concepts: ['For loops', 'While loops', 'Range function', 'Iteration'],
    exercises: [
      {
        question: 'Print the multiplication table for 5 (5x1, 5x2, etc.)',
        solution: 'for i in range(1, 11):\n    result = 5 * i\n    print(f"5 x {i} = {result}")',
        hint: 'Use a for loop with range(1, 11) and multiply by 5'
      }
    ]
  },
  {
    id: 'functions',
    title: 'Creating Your Own Functions',
    description: 'Build reusable blocks of code',
    content: `
Functions are like recipes - you write them once and use them many times:

• **def**: Creates a new function
• **parameters**: Inputs your function can accept
• **return**: What your function gives back
• **calling**: Using your function

Functions help organize your code and avoid repetition!
    `,
    codeExample: `# Creating your own functions
def greet_person(name, age):
    """This function greets a person with their name and age"""
    return f"Hello {name}! You are {age} years old. Nice to meet you! 😊"

def calculate_area(length, width):
    """Calculate the area of a rectangle"""
    area = length * width
    return area

# Using (calling) your functions
message = greet_person("Alex", 12)
print(message)

room_area = calculate_area(10, 8)
print(f"The room area is {room_area} square feet")`,
    difficulty: 'intermediate',
    duration: '15 min',
    concepts: ['Function definition', 'Parameters', 'Return values', 'Function calls'],
    exercises: [
      {
        question: 'Create a function that converts Celsius to Fahrenheit',
        solution: 'def celsius_to_fahrenheit(celsius):\n    fahrenheit = (celsius * 9/5) + 32\n    return fahrenheit',
        hint: 'The formula is: F = (C × 9/5) + 32'
      }
    ]
  }
];

interface PythonLessonsProps {
  onLessonComplete: (lessonId: string) => void;
}

export const PythonLessons: React.FC<PythonLessonsProps> = ({
  onLessonComplete
}) => {
  const [selectedLesson, setSelectedLesson] = useState<PythonLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [currentExercise, setCurrentExercise] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [userCode, setUserCode] = useState('');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const completeLesson = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    onLessonComplete(lessonId);
    setSelectedLesson(null);
  };

  if (!selectedLesson) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="h-8 w-8" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Python Lessons
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn Python step-by-step with interactive lessons and examples. Perfect for beginners!
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {completedLessons.size}/{pythonLessons.length}
            </div>
            <Progress 
              value={(completedLessons.size / pythonLessons.length) * 100} 
              className="h-2 mt-2" 
            />
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Total Time</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {pythonLessons.reduce((total, lesson) => 
                total + parseInt(lesson.duration), 0
              )} min
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Progress</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round((completedLessons.size / pythonLessons.length) * 100)}%
            </div>
          </Card>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {pythonLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    completedLessons.has(lesson.id) 
                      ? 'ring-2 ring-green-200 bg-green-50/50 dark:bg-green-900/10' 
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(lesson.difficulty)}>
                        {lesson.difficulty}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                        {completedLessons.has(lesson.id) && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    <CardDescription>{lesson.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {lesson.concepts.slice(0, 3).map(concept => (
                        <Badge key={concept} variant="outline" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {lesson.exercises.length} exercise{lesson.exercises.length !== 1 ? 's' : ''}
                      </span>
                      <Button size="sm" variant={completedLessons.has(lesson.id) ? "outline" : "default"}>
                        {completedLessons.has(lesson.id) ? 'Review' : 'Start'}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedLesson(null)}>
          ← Back to Lessons
        </Button>
        <Badge className={getDifficultyColor(selectedLesson.difficulty)}>
          {selectedLesson.difficulty}
        </Badge>
      </div>

      {/* Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedLesson.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedLesson.duration}
              </div>
              <div>{selectedLesson.concepts.length} concepts</div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {selectedLesson.content}
                </pre>
              </div>
            </ScrollArea>
            
            {/* Concepts */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Key Concepts:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedLesson.concepts.map(concept => (
                  <Badge key={concept} variant="secondary" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Example Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                <code>{selectedLesson.codeExample}</code>
              </pre>
            </ScrollArea>
            
            {/* Interactive Exercise Section */}
            {selectedLesson.exercises.length > 0 && (
              <div className="mt-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Try This Exercise ({currentExercise + 1}/{selectedLesson.exercises.length}):
                </h4>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                      {selectedLesson.exercises[currentExercise].question}
                    </p>
                    
                    {/* Code Input Area */}
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder="Write your Python code here..."
                      className="w-full h-20 p-2 text-sm font-mono bg-white dark:bg-gray-800 border rounded"
                    />
                    
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => setShowSolution(!showSolution)}
                        variant="outline"
                      >
                        {showSolution ? 'Hide' : 'Show'} Solution
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setUserCode(selectedLesson.exercises[currentExercise].solution);
                          toast.success('💡 Solution copied to editor!');
                        }}
                        variant="ghost"
                      >
                        Copy Solution
                      </Button>
                    </div>
                    
                    {showSolution && (
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Solution:</p>
                        <pre className="text-xs font-mono text-green-800 dark:text-green-200">
                          {selectedLesson.exercises[currentExercise].solution}
                        </pre>
                      </div>
                    )}
                    
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                        💡 Need a hint?
                      </summary>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        {selectedLesson.exercises[currentExercise].hint}
                      </p>
                    </details>
                  </div>
                  
                  {/* Exercise Navigation */}
                  {selectedLesson.exercises.length > 1 && (
                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentExercise(Math.max(0, currentExercise - 1))}
                        disabled={currentExercise === 0}
                      >
                        ← Previous Exercise
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentExercise(Math.min(selectedLesson.exercises.length - 1, currentExercise + 1))}
                        disabled={currentExercise === selectedLesson.exercises.length - 1}
                      >
                        Next Exercise →
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => completeLesson(selectedLesson.id)}
              className="w-full mt-4"
            >
              Complete Lesson
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};