import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  ArrowRight, 
  Lightbulb, 
  Target,
  Code,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CodeStep {
  id: string;
  title: string;
  explanation: string;
  code: string;
  expectedOutput: string;
  hint: string;
  completed: boolean;
}

interface InteractiveCodeTutorialProps {
  onStepComplete: (stepId: string) => void;
  onTutorialComplete: () => void;
}

const tutorialSteps: CodeStep[] = [
  {
    id: 'step-1',
    title: 'Your First Print Statement',
    explanation: 'The print() function is like talking to the computer. It displays text on the screen!',
    code: 'print("Hello, World!")',
    expectedOutput: 'Hello, World!',
    hint: 'Try typing the code exactly as shown, including the quotes!',
    completed: false
  },
  {
    id: 'step-2',
    title: 'Variables are Boxes',
    explanation: 'Variables store information like boxes store toys. You can put your name in a variable!',
    code: 'name = "Alice"\nprint(f"Hi, my name is {name}!")',
    expectedOutput: 'Hi, my name is Alice!',
    hint: 'Change "Alice" to your own name!',
    completed: false
  },
  {
    id: 'step-3',
    title: 'Numbers and Math',
    explanation: 'Python can do math! Let\'s calculate your age next year.',
    code: 'age = 12\nnext_year = age + 1\nprint(f"Next year I will be {next_year} years old")',
    expectedOutput: 'Next year I will be 13 years old',
    hint: 'Try using your real age instead of 12!',
    completed: false
  },
  {
    id: 'step-4',
    title: 'Making Decisions',
    explanation: 'If statements help your program make smart choices, just like you do!',
    code: 'weather = "sunny"\nif weather == "sunny":\n    print("Let\'s go to the park!")\nelse:\n    print("Let\'s stay inside and code!")',
    expectedOutput: 'Let\'s go to the park!',
    hint: 'Try changing "sunny" to "rainy" to see what happens!',
    completed: false
  },
  {
    id: 'step-5',
    title: 'Repeating with Loops',
    explanation: 'Loops help you repeat things without writing the same code over and over!',
    code: 'for i in range(3):\n    print(f"This is loop number {i + 1}")',
    expectedOutput: 'This is loop number 1\nThis is loop number 2\nThis is loop number 3',
    hint: 'Try changing the number 3 to see more or fewer repeats!',
    completed: false
  }
];

export const InteractiveCodeTutorial: React.FC<InteractiveCodeTutorialProps> = ({
  onStepComplete,
  onTutorialComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userCode, setUserCode] = useState(tutorialSteps[0].code);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const runCode = () => {
    setIsRunning(true);
    setOutput('Running code...');

    setTimeout(() => {
      // Simple code execution simulation
      try {
        let result = '';
        const lines = userCode.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('print(')) {
            const match = trimmed.match(/print\((.*)\)/);
            if (match) {
              let content = match[1];
              // Handle f-strings
              if (content.includes('f"') || content.includes("f'")) {
                content = content.replace(/f["'](.*)["']/, '$1');
                content = content.replace(/{([^}]+)}/g, (_, variable) => {
                  // Simple variable substitution
                  if (variable.includes('+')) {
                    try {
                      const [varName, operation] = variable.split(' + ');
                      if (varName.trim() === 'age' && operation.trim() === '1') {
                        return '13'; // Simple example
                      }
                      return variable;
                    } catch {
                      return variable;
                    }
                  }
                  return variable;
                });
              }
              content = content.replace(/^["']|["']$/g, '');
              result += content + '\n';
            }
          }
        }
        
        setOutput(result.trim() || 'Code executed successfully!');
        setIsRunning(false);
        
        // Check if step is completed
        if (result.trim() && !completedSteps.has(currentStepData.id)) {
          setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
          onStepComplete(currentStepData.id);
          toast.success('🎉 Step completed! Great job!');
        }
        
      } catch (error) {
        setOutput('Oops! There was an error. Check your code and try again!');
        setIsRunning(false);
      }
    }, 1000);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setUserCode(tutorialSteps[nextStepIndex].code);
      setOutput('');
    } else {
      onTutorialComplete();
      toast.success('🏆 Tutorial completed! You\'re ready for more coding adventures!');
    }
  };

  const resetStep = () => {
    setUserCode(currentStepData.code);
    setOutput('');
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Interactive Code Tutorial
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Step {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="mt-3" />
        </CardHeader>
      </Card>

      {/* Current Step */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {currentStepData.explanation}
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Your Task:
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Run the code below and see what happens! Feel free to modify it and experiment.
              </p>
            </div>
            
            <details className="mt-3">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                💡 Need a hint?
              </summary>
              <p className="text-sm text-muted-foreground mt-2 bg-muted p-3 rounded">
                {currentStepData.hint}
              </p>
            </details>
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={resetStep}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Reset Code
              </Button>
              <Button
                onClick={nextStep}
                disabled={!completedSteps.has(currentStepData.id)}
                size="sm"
                className="flex-1"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next Step'}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Code Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Try It Out!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Code:</label>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg font-mono text-sm resize-none"
                placeholder="Write your Python code here..."
              />
            </div>
            
            <Button
              onClick={runCode}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                </motion.div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Output:</label>
              <div className="bg-muted p-3 rounded-lg min-h-[80px] font-mono text-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={output}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {output || 'Click "Run Code" to see the output here!'}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            {completedSteps.has(currentStepData.id) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Step completed! Well done! 🎉</span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Step Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center space-x-2">
            {tutorialSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStep(index);
                  setUserCode(step.code);
                  setOutput('');
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : completedSteps.has(step.id)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};