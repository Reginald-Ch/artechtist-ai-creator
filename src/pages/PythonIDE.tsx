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
  Sparkles,
  Trash2,
  Upload
} from "lucide-react";
import { AIMascot } from "@/components/ai-tutor/AIMascot";
import { useProgressiveStreak } from '@/hooks/useProgressiveStreak';
import { ProgressiveStreak } from '@/components/enhanced/ProgressiveStreak';
import { PythonIDEChallenges } from '@/components/enhanced/PythonIDEChallenges';
import { PythonLessons } from '@/components/enhanced/PythonLessons';
import { PythonChallenges } from '@/components/enhanced/PythonChallenges';
import { EnhancedCodeEditor } from '@/components/enhanced/EnhancedCodeEditor';
import { toast } from 'sonner';

const PythonIDE = () => {
  const [code, setCode] = useState(`# Welcome to Python IDE for Kids! 🐍
print("Hello, World!")
print("Let's learn Python together!")`);
  
  const [output, setOutput] = useState('');
  const [aiHelperVisible, setAiHelperVisible] = useState(true);
  const { recordActivity } = useProgressiveStreak();

  const runCode = () => {
    // Simulate code execution
    try {
      setOutput('Hello, World!\nLet\'s learn Python together!\n\n✨ Great job! Your code ran successfully!');
      recordActivity('code_run', 10, 'python_execution', 'python');
      toast.success('Code executed successfully! 🎉');
    } catch (error) {
      setOutput('Error: Something went wrong. Check your code and try again!');
      toast.error('Code execution failed. Try again!');
    }
  };

  const clearCode = () => {
    setCode('# Write your Python code here!\n');
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Code className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Python IDE for Kids 🐍
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn Python programming with our kid-friendly IDE. Write code, complete challenges, and build amazing projects!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* AI Helper Sidebar */}
          {aiHelperVisible && (
            <div className="lg:col-span-1 space-y-4">
              <div className="sticky top-4 space-y-4">
                <AIMascot />
                
                {/* Progressive Learning Streak */}
                <ProgressiveStreak />
              </div>
            </div>
          )}

          {/* Main IDE Area */}
          <div className={`${aiHelperVisible ? 'lg:col-span-4' : 'lg:col-span-5'}`}>
            <Tabs defaultValue="code" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                <TabsTrigger value="code" className="data-[state=active]:bg-background">
                  <Code className="h-4 w-4 mr-2" />
                  Code Editor
                </TabsTrigger>
                <TabsTrigger value="challenges" className="data-[state=active]:bg-background">
                  <Trophy className="h-4 w-4 mr-2" />
                  IDE Challenges
                </TabsTrigger>
                <TabsTrigger value="learn" className="data-[state=active]:bg-background">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Lessons
                </TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-background">
                  <Target className="h-4 w-4 mr-2" />
                  Projects
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Code Editor */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Python Code Editor
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={clearCode}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={runCode}>
                            <Play className="h-4 w-4 mr-1" />
                            Run
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Write your Python code here..."
                        className="min-h-[400px] font-mono text-sm resize-none"
                      />
                    </CardContent>
                  </Card>

                  {/* Output Console */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Output Console
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

              <TabsContent value="learn" className="space-y-6">
                <PythonLessons onLessonComplete={(lessonId) => {
                  console.log(`Lesson ${lessonId} completed`);
                  toast.success('🎉 Lesson completed!');
                }} />
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <PythonChallenges onChallengeComplete={(challengeId: string, score: number) => {
                  recordActivity('project', score, challengeId, 'python');
                  toast.success(`🏆 Project completed! Earned ${score} points.`);
                }} />
              </TabsContent>

              <TabsContent value="challenges" className="space-y-6">
                <Card className="bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Python IDE Challenges
                    </CardTitle>
                    <p className="text-muted-foreground">Complete coding challenges to test your skills!</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                          <div className="flex-1">
                            <h4 className="font-semibold">Print Hello World</h4>
                            <p className="text-sm text-muted-foreground">Your first Python program</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setCode('print("Hello, World!")')}>
                            Try
                          </Button>
                        </div>
                      </Card>
                      
                      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                          <div className="flex-1">
                            <h4 className="font-semibold">Create Variables</h4>
                            <p className="text-sm text-muted-foreground">Store and use data</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setCode('name = "Python"\nage = 30\nprint(f"I am {name}, {age} years old!")')}>
                            Try
                          </Button>
                        </div>
                      </Card>
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