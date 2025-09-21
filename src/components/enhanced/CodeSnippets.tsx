import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Code, 
  Search, 
  Copy, 
  Play, 
  BookOpen,
  Zap,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const codeSnippets: CodeSnippet[] = [
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'The classic first program',
    code: 'print("Hello, World!")',
    category: 'basics',
    difficulty: 'beginner',
    tags: ['print', 'strings']
  },
  {
    id: 'variables',
    title: 'Variables & Types',
    description: 'Different types of variables',
    code: `name = "Alice"
age = 12
height = 4.5
is_student = True
print(f"Name: {name}, Age: {age}")`,
    category: 'basics',
    difficulty: 'beginner',
    tags: ['variables', 'types', 'strings']
  },
  {
    id: 'for-loop',
    title: 'For Loop',
    description: 'Repeat code multiple times',
    code: `for i in range(5):
    print(f"Count: {i}")`,
    category: 'loops',
    difficulty: 'beginner',
    tags: ['loops', 'range']
  },
  {
    id: 'list-operations',
    title: 'List Operations',
    description: 'Working with lists',
    code: `fruits = ["apple", "banana", "orange"]
fruits.append("grape")
for fruit in fruits:
    print(f"I like {fruit}!")`,
    category: 'data-structures',
    difficulty: 'intermediate',
    tags: ['lists', 'append', 'loops']
  },
  {
    id: 'function-def',
    title: 'Function Definition',
    description: 'Create reusable functions',
    code: `def greet(name, age):
    return f"Hello {name}! You are {age} years old."

message = greet("Alice", 12)
print(message)`,
    category: 'functions',
    difficulty: 'intermediate',
    tags: ['functions', 'parameters', 'return']
  },
  {
    id: 'if-statements',
    title: 'If Statements',
    description: 'Make decisions in code',
    code: `age = 16
if age >= 18:
    print("You can vote!")
elif age >= 16:
    print("You can drive!")
else:
    print("You're still young!")`,
    category: 'control-flow',
    difficulty: 'beginner',
    tags: ['if', 'elif', 'else', 'conditions']
  },
  {
    id: 'dictionary',
    title: 'Dictionary Example',
    description: 'Store key-value pairs',
    code: `student = {
    "name": "Alice",
    "age": 12,
    "grades": [85, 90, 95]
}
print(f"Student: {student['name']}")
print(f"Average grade: {sum(student['grades']) / len(student['grades'])}")`,
    category: 'data-structures',
    difficulty: 'intermediate',
    tags: ['dictionary', 'keys', 'values']
  },
  {
    id: 'while-loop',
    title: 'While Loop',
    description: 'Repeat while condition is true',
    code: `count = 0
while count < 5:
    print(f"Count is: {count}")
    count += 1
print("Done counting!")`,
    category: 'loops',
    difficulty: 'beginner',
    tags: ['while', 'loops', 'increment']
  },
  {
    id: 'file-handling',
    title: 'File Operations',
    description: 'Read and write files',
    code: `# Write to file
with open("my_file.txt", "w") as file:
    file.write("Hello from Python!")

# Read from file
with open("my_file.txt", "r") as file:
    content = file.read()
    print(content)`,
    category: 'file-io',
    difficulty: 'advanced',
    tags: ['files', 'read', 'write', 'with']
  },
  {
    id: 'class-example',
    title: 'Simple Class',
    description: 'Object-oriented programming',
    code: `class Pet:
    def __init__(self, name, animal_type):
        self.name = name
        self.type = animal_type
    
    def speak(self):
        print(f"{self.name} the {self.type} says hello!")

my_pet = Pet("Buddy", "dog")
my_pet.speak()`,
    category: 'oop',
    difficulty: 'advanced',
    tags: ['class', 'init', 'methods', 'objects']
  }
];

interface CodeSnippetsProps {
  onInsertSnippet: (code: string) => void;
}

export const CodeSnippets: React.FC<CodeSnippetsProps> = ({ onInsertSnippet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = ['all', ...Array.from(new Set(codeSnippets.map(s => s.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredSnippets = codeSnippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || snippet.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || snippet.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return '📚';
      case 'loops': return '🔄';
      case 'functions': return '⚡';
      case 'data-structures': return '📊';
      case 'control-flow': return '🔀';
      case 'file-io': return '📁';
      case 'oop': return '🏗️';
      default: return '💻';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Code Snippets Library
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.replace('-', ' ')}
                </option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>
                  {diff === 'all' ? 'All Levels' : diff}
                </option>
              ))}
            </select>
            
            <Badge variant="outline" className="text-xs">
              {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredSnippets.map((snippet) => (
              <Card key={snippet.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getCategoryIcon(snippet.category)}</span>
                        <h4 className="font-semibold">{snippet.title}</h4>
                        <Badge className={getDifficultyColor(snippet.difficulty)}>
                          {snippet.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{snippet.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {snippet.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="bg-muted rounded p-3 mb-3">
                    <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {snippet.code}
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onInsertSnippet(snippet.code)}
                      className="flex-1"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Insert
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(snippet.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        {filteredSnippets.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No snippets found matching your criteria
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};