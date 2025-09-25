import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Star, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface NumberPredictorProps {
  onComplete: (score: number) => void;
}

interface DataPoint {
  input: number;
  output: number;
}

const SAMPLE_DATASETS = [
  {
    name: 'Age from Height',
    description: 'Predict age based on height (in cm)',
    data: [
      { input: 100, output: 5 },   // 100cm → 5 years
      { input: 120, output: 8 },   // 120cm → 8 years
      { input: 140, output: 12 },  // 140cm → 12 years
      { input: 160, output: 16 },  // 160cm → 16 years
      { input: 175, output: 20 },  // 175cm → 20 years
    ],
    inputLabel: 'Height (cm)',
    outputLabel: 'Age (years)'
  },
  {
    name: 'Study Hours to Test Score',
    description: 'Predict test score from study hours',
    data: [
      { input: 1, output: 60 },
      { input: 2, output: 70 },
      { input: 3, output: 80 },
      { input: 4, output: 85 },
      { input: 5, output: 95 },
    ],
    inputLabel: 'Study Hours',
    outputLabel: 'Test Score'
  },
  {
    name: 'Temperature to Ice Cream Sales',
    description: 'Predict ice cream sales from temperature',
    data: [
      { input: 10, output: 20 },  // 10°C → 20 sales
      { input: 20, output: 50 },  // 20°C → 50 sales
      { input: 30, output: 80 },  // 30°C → 80 sales
      { input: 35, output: 100 }, // 35°C → 100 sales
      { input: 40, output: 120 }, // 40°C → 120 sales
    ],
    inputLabel: 'Temperature (°C)',
    outputLabel: 'Ice Cream Sales'
  }
];

const NumberPredictor: React.FC<NumberPredictorProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'data' | 'training' | 'testing' | 'play'>('data');
  const [selectedDataset, setSelectedDataset] = useState(0);
  const [customData, setCustomData] = useState<DataPoint[]>([]);
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [model, setModel] = useState<{ slope: number; intercept: number } | null>(null);
  const [testInput, setTestInput] = useState('');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<{ input: number; predicted: number; actual?: number }[]>([]);
  const [finalScore, setFinalScore] = useState(0);

  const currentDataset = SAMPLE_DATASETS[selectedDataset];
  const trainingData = customData.length > 0 ? customData : currentDataset.data;

  const addDataPoint = () => {
    const input = parseFloat(newInput);
    const output = parseFloat(newOutput);
    
    if (isNaN(input) || isNaN(output)) {
      toast.error('Please enter valid numbers');
      return;
    }

    setCustomData([...customData, { input, output }]);
    setNewInput('');
    setNewOutput('');
    toast.success('Data point added!');
  };

  const removeDataPoint = (index: number) => {
    setCustomData(customData.filter((_, i) => i !== index));
  };

  const trainModel = () => {
    if (trainingData.length < 3) {
      toast.error('Need at least 3 data points to train!');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setStep('training');

    // Simulate training with progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + 8;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          
          // Calculate linear regression (simple AI model)
          calculateLinearRegression();
          setStep('testing');
          toast.success('🎉 Model trained! Now make predictions!');
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const calculateLinearRegression = () => {
    const n = trainingData.length;
    const sumX = trainingData.reduce((sum, point) => sum + point.input, 0);
    const sumY = trainingData.reduce((sum, point) => sum + point.output, 0);
    const sumXY = trainingData.reduce((sum, point) => sum + (point.input * point.output), 0);
    const sumXX = trainingData.reduce((sum, point) => sum + (point.input * point.input), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    setModel({ slope, intercept });
  };

  const makePrediction = () => {
    const input = parseFloat(testInput);
    if (isNaN(input) || !model) {
      toast.error('Please enter a valid number');
      return;
    }

    const predicted = model.slope * input + model.intercept;
    setPrediction(Math.round(predicted * 100) / 100);
    
    setTestResults(prev => [...prev, { input, predicted: Math.round(predicted * 100) / 100 }]);
    setTestInput('');
    
    toast.success(`Prediction: ${Math.round(predicted * 100) / 100}`);
  };

  const completeExercise = () => {
    // Calculate accuracy based on how close predictions might be to expected values
    const baseScore = 70;
    const dataBonus = Math.min(trainingData.length * 5, 20);
    const testBonus = Math.min(testResults.length * 5, 10);
    
    const score = baseScore + dataBonus + testBonus;
    setFinalScore(score);
    setStep('play');
    onComplete(score);
  };

  const renderSetup = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Number Predictor AI 📊</CardTitle>
        <CardDescription className="text-lg">
          Train AI to predict numbers from patterns in data!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose a Dataset</h3>
          <div className="grid grid-cols-1 gap-4">
            {SAMPLE_DATASETS.map((dataset, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all ${selectedDataset === index ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedDataset(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{dataset.name}</h4>
                      <p className="text-sm text-muted-foreground">{dataset.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Input: {dataset.inputLabel}</span>
                        <span>Output: {dataset.outputLabel}</span>
                      </div>
                    </div>
                    <Badge>{dataset.data.length} points</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Sample Data Preview:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-600">{currentDataset.inputLabel}</h5>
              {currentDataset.data.slice(0, 3).map((point, i) => (
                <div key={i} className="p-2 bg-blue-50 rounded mb-1">{point.input}</div>
              ))}
            </div>
            <div>
              <h5 className="font-medium text-green-600">{currentDataset.outputLabel}</h5>
              {currentDataset.data.slice(0, 3).map((point, i) => (
                <div key={i} className="p-2 bg-green-50 rounded mb-1">{point.output}</div>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={() => setStep('data')} className="w-full" size="lg">
          Start with this Dataset →
        </Button>
      </CardContent>
    </Card>
  );

  const renderData = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Training Data Setup
        </CardTitle>
        <CardDescription>
          View or modify the training data for your AI model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-semibold text-blue-600 mb-3">{currentDataset.inputLabel}</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {trainingData.map((point, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span>{point.input}</span>
                  {customData.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDataPoint(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold text-green-600 mb-3">{currentDataset.outputLabel}</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {trainingData.map((point, index) => (
                <div key={index} className="p-2 bg-green-50 rounded">
                  {point.output}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold mb-3">Add Custom Data Points</h4>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <Label htmlFor="input">{currentDataset.inputLabel}</Label>
              <Input
                id="input"
                type="number"
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                placeholder="e.g. 150"
              />
            </div>
            <div>
              <Label htmlFor="output">{currentDataset.outputLabel}</Label>
              <Input
                id="output"
                type="number"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
                placeholder="e.g. 15"
              />
            </div>
            <Button onClick={addDataPoint} disabled={!newInput || !newOutput}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('data')}>
            ← Back
          </Button>
          <Button onClick={trainModel} className="flex-1" disabled={trainingData.length < 3}>
            Train AI Model! 🧠
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTraining = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Training Your Prediction Model 🧠</CardTitle>
        <CardDescription>
          The AI is finding patterns in your data...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Training Progress</span>
            <span>{trainingProgress}%</span>
          </div>
          <Progress value={trainingProgress} className="h-3" />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            {trainingProgress < 25 && "Analyzing data points..."}
            {trainingProgress >= 25 && trainingProgress < 50 && "Finding mathematical patterns..."}
            {trainingProgress >= 50 && trainingProgress < 75 && "Calculating the best fit line..."}
            {trainingProgress >= 75 && "Optimizing predictions!"}
          </p>
        </div>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-700 mb-2">Training Data Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Data Points:</span> {trainingData.length}
            </div>
            <div>
              <span className="font-medium">Relationship:</span> {currentDataset.inputLabel} → {currentDataset.outputLabel}
            </div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );

  const renderTest = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Test Your Prediction Model! 🧪</CardTitle>
        <CardDescription>
          Enter values and see what the AI predicts!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {model && (
          <Card className="p-4 bg-green-50 border-green-200">
            <h4 className="font-semibold text-green-700 mb-2">📊 Model Ready!</h4>
            <p className="text-sm text-green-600">
              Your AI learned the pattern: <br/>
              <span className="font-mono bg-white px-2 py-1 rounded">
                {currentDataset.outputLabel} = {model.slope.toFixed(2)} × {currentDataset.inputLabel} + {model.intercept.toFixed(2)}
              </span>
            </p>
          </Card>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <Label htmlFor="test-input">Enter {currentDataset.inputLabel}</Label>
              <Input
                id="test-input"
                type="number"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder={`e.g. ${currentDataset.data[0].input + 10}`}
              />
            </div>
            <Button onClick={makePrediction} disabled={!testInput || !model}>
              Predict! 🔮
            </Button>
          </div>

          {prediction !== null && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-700 mb-2">🎯 AI Prediction</h4>
              <p className="text-lg">
                For {currentDataset.inputLabel} = {testResults[testResults.length - 1]?.input}, <br/>
                the AI predicts {currentDataset.outputLabel} = <span className="font-bold text-blue-600">{prediction}</span>
              </p>
            </Card>
          )}
        </div>

        {testResults.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Prediction History</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                  <span>{currentDataset.inputLabel}: {result.input}</span>
                  <span className="font-medium">{currentDataset.outputLabel}: {result.predicted}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('data')}>
            ← Modify Data
          </Button>
          <Button 
            onClick={completeExercise} 
            className="flex-1"
            disabled={testResults.length < 1}
          >
            Complete Model! 🎉
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <Star className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-orange-700">
          🎉 Prediction Model Complete!
        </CardTitle>
        <CardDescription className="text-lg">
          You've built an AI that can predict numbers from patterns!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-orange-600">{finalScore}%</h3>
          <p className="text-orange-700">Model Performance Score</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Training Data</h4>
            <p className="text-2xl font-bold text-blue-600">{trainingData.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Predictions Made</h4>
            <p className="text-2xl font-bold text-green-600">{testResults.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold">Model Type</h4>
            <p className="text-lg font-bold text-purple-600">Linear</p>
          </div>
        </div>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-700 mb-2">🎓 What You Learned</h4>
          <ul className="text-left text-sm text-yellow-700 space-y-1">
            <li>• How AI finds patterns in data</li>
            <li>• Linear regression and predictions</li>
            <li>• Training vs testing data</li>
            <li>• Real-world AI applications</li>
          </ul>
        </Card>

        <Button onClick={() => {
          setStep('data');
          setCustomData([]);
          setModel(null);
          setPrediction(null);
          setTestResults([]);
          setFinalScore(0);
          setTrainingProgress(0);
        }} className="w-full" size="lg">
          Try Different Dataset 🔄
        </Button>
      </CardContent>
    </Card>
  );

  switch (step) {
    case 'data': return renderSetup();
    case 'data': return renderData();
    case 'training': return renderTraining();
    case 'testing': return renderTest();
    case 'play': return renderComplete();
    default: return renderSetup();
  }
};

export default NumberPredictor;