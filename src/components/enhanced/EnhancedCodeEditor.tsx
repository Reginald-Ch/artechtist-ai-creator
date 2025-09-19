import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  RotateCcw, 
  Save, 
  Code, 
  Lightbulb,
  Download,
  Upload,
  Settings,
  Zap,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface EnhancedCodeEditorProps {
  onCodeRun: (code: string) => void;
  onCodeSave?: (code: string) => void;
  initialCode?: string;
  readOnly?: boolean;
}

export const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({
  onCodeRun,
  onCodeSave,
  initialCode = '',
  readOnly = false
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('default');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    setHasUnsavedChanges(code !== initialCode);
  }, [code, initialCode]);

  const handleCodeChange = (newCode: string) => {
    if (!readOnly) {
      setCode(newCode);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running your code...\n');
    
    try {
      // Simulate code execution
      setTimeout(() => {
        const result = simulatePythonExecution(code);
        setOutput(result.output);
        setIsRunning(false);
        
        if (result.success) {
          toast.success('Code executed successfully! ✨');
        } else if (result.hasError) {
          toast.error('Code has errors. Check the output for details.');
        }
        
        onCodeRun(code);
      }, 1000);
    } catch (error) {
      setOutput(`Error: ${error}`);
      setIsRunning(false);
    }
  };

  const simulatePythonExecution = (code: string) => {
    const lines = code.split('\n');
    let output = '';
    let hasError = false;
    let success = false;

    try {
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Handle print statements
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
                    return eval(variable);
                  } catch {
                    return variable;
                  }
                }
                return variable;
              });
            }
            
            // Remove quotes
            content = content.replace(/^["']|["']$/g, '');
            output += content + '\n';
            success = true;
          }
        }
        
        // Handle variable assignments
        if (trimmed.includes('=') && !trimmed.includes('==')) {
          output += `✓ Variable assigned\n`;
          success = true;
        }
        
        // Handle function definitions
        if (trimmed.startsWith('def ')) {
          output += `✓ Function defined\n`;
          success = true;
        }
        
        // Handle for loops
        if (trimmed.startsWith('for ')) {
          output += `✓ Loop started\n`;
          success = true;
        }
        
        // Handle if statements
        if (trimmed.startsWith('if ')) {
          output += `✓ Condition checked\n`;
          success = true;
        }
      }
      
      if (!output) {
        output = '✨ Code executed successfully! (No output to display)\n';
        success = true;
      }
      
    } catch (error) {
      output = `❌ Error: ${error}\n`;
      hasError = true;
    }

    return { output, success, hasError };
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
    setHasUnsavedChanges(false);
  };

  const saveCode = () => {
    if (onCodeSave) {
      onCodeSave(code);
      setHasUnsavedChanges(false);
      toast.success('Code saved! 💾');
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_python_code.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded! 📥');
  };

  const insertSnippet = (snippet: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + snippet + code.substring(end);
      setCode(newCode);
      
      // Set cursor position after the snippet
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
    }
  };

  const codeSnippets = [
    { name: 'Print', code: 'print("Hello, World!")' },
    { name: 'Variable', code: 'my_variable = ' },
    { name: 'Function', code: 'def my_function():\n    pass' },
    { name: 'For Loop', code: 'for i in range(10):\n    print(i)' },
    { name: 'If Statement', code: 'if True:\n    print("Condition is true")' },
    { name: 'List', code: 'my_list = [1, 2, 3, 4, 5]' }
  ];

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div 
            className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white"
            whileHover={{ scale: 1.05 }}
          >
            <Code className="h-5 w-5" />
          </motion.div>
          <div>
            <h3 className="font-semibold">Python Code Editor</h3>
            <p className="text-xs text-muted-foreground">
              Write and run Python code instantly
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={() => setLineNumbers(!lineNumbers)}>
            #{lineNumbers ? 'Hide' : 'Show'} Lines
          </Button>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="flex flex-wrap gap-2">
        {codeSnippets.map(snippet => (
          <Button
            key={snippet.name}
            size="sm"
            variant="outline"
            onClick={() => insertSnippet(snippet.code)}
            className="text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            {snippet.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="# Write your Python code here..."
                  className={`font-mono text-sm min-h-[300px] resize-none ${
                    lineNumbers ? 'pl-12' : 'pl-4'
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                  readOnly={readOnly}
                />
                
                {lineNumbers && (
                  <div className="absolute left-2 top-3 text-xs text-muted-foreground font-mono select-none pointer-events-none">
                    {code.split('\n').map((_, index) => (
                      <div key={index} className="leading-6">
                        {index + 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={runCode} 
                  disabled={isRunning || !code.trim()}
                  size="sm"
                  className="flex-1"
                >
                  {isRunning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                    </motion.div>
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
                
                <Button size="sm" variant="outline" onClick={clearCode}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                {onCodeSave && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={saveCode}
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
                
                <Button size="sm" variant="outline" onClick={downloadCode}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <pre className="text-sm font-mono whitespace-pre-wrap p-3 bg-muted rounded-lg min-h-[280px]">
                {output || 'Output will appear here when you run your code...'}
              </pre>
            </ScrollArea>
            
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              <span>Tip: Use print() to see your results!</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};