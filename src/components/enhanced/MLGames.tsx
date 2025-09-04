import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Hand, Gamepad2, Palette, Trophy, Star, Play, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MLGame {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Vision' | 'Gesture' | 'Creative';
  instructions: string[];
  aiConcepts: string[];
  gameComponent: () => JSX.Element;
}

const EmojiPredictorGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'training' | 'playing'>('idle');
  const [score, setScore] = useState(0);
  const [predictions, setPredictions] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startGame = useCallback(async () => {
    setGameState('training');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast({
        title: "Camera activated!",
        description: "Show different emotions to train the AI"
      });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to play this game",
        variant: "destructive"
      });
    }
  }, []);

  const simulateEmotion = (emotion: string) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      surprised: '😮',
      angry: '😠'
    };
    setPredictions(prev => [...prev.slice(-2), emojis[emotion as keyof typeof emojis] || '🤔']);
    setScore(prev => prev + 10);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Emotion Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Train the AI to recognize your emotions and earn points!
            </p>
            <Button onClick={startGame} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Training
            </Button>
          </div>
        )}
        
        {gameState === 'training' && (
          <div className="space-y-4">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className="w-full h-48 bg-black rounded-lg"
            />
            <div className="grid grid-cols-2 gap-2">
              {['happy', 'sad', 'surprised', 'angry'].map(emotion => (
                <Button 
                  key={emotion}
                  variant="outline" 
                  onClick={() => simulateEmotion(emotion)}
                  className="capitalize"
                >
                  {emotion}
                </Button>
              ))}
            </div>
            <div className="text-center">
              <Badge variant="secondary">Score: {score}</Badge>
              <div className="flex justify-center gap-2 mt-2">
                {predictions.map((emoji, i) => (
                  <span key={i} className="text-2xl">{emoji}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FoodClassifierGame = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [score, setScore] = useState(0);
  const [currentFood, setCurrentFood] = useState<string>('');
  const [round, setRound] = useState(0);
  
  const foods = ['🍕', '🍎', '🍔', '🍌', '🥕', '🍓', '🍇', '🥖'];
  const foodNames = ['Pizza', 'Apple', 'Burger', 'Banana', 'Carrot', 'Strawberry', 'Grapes', 'Bread'];

  const startGame = () => {
    setGameState('playing');
    setRound(0);
    setScore(0);
    generateNewFood();
  };

  const generateNewFood = () => {
    const randomIndex = Math.floor(Math.random() * foods.length);
    setCurrentFood(foods[randomIndex]);
    setRound(prev => prev + 1);
  };

  const guessFood = (guess: string) => {
    const correctIndex = foods.indexOf(currentFood);
    const correctName = foodNames[correctIndex];
    
    if (guess === correctName) {
      setScore(prev => prev + 10);
      toast({
        title: "Correct! 🎉",
        description: `You identified the ${correctName}!`
      });
    } else {
      toast({
        title: "Try again!",
        description: `That was a ${correctName}`,
        variant: "destructive"
      });
    }
    
    if (round < 5) {
      setTimeout(generateNewFood, 1500);
    } else {
      setGameState('menu');
      toast({
        title: "Game Complete!",
        description: `Final score: ${score}/50`
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Food Classifier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === 'menu' && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Train your AI to recognize different foods!
            </p>
            <Button onClick={startGame} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Game
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">{currentFood}</div>
            <p className="text-sm text-muted-foreground">Round {round}/5</p>
            <Badge variant="secondary">Score: {score}</Badge>
            
            <div className="grid grid-cols-2 gap-2">
              {foodNames.slice(0, 4).map(name => (
                <Button 
                  key={name}
                  variant="outline" 
                  onClick={() => guessFood(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RockPaperScissorsML = () => {
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing'>('idle');
  const [playerChoice, setPlayerChoice] = useState<string>('');
  const [botChoice, setBotChoice] = useState<string>('');
  const [score, setScore] = useState({ player: 0, bot: 0 });

  const choices = [
    { name: 'Rock', emoji: '✊', beats: 'Scissors' },
    { name: 'Paper', emoji: '✋', beats: 'Rock' },
    { name: 'Scissors', emoji: '✌️', beats: 'Paper' }
  ];

  const playRound = (choice: string) => {
    setPlayerChoice(choice);
    const botChoice = choices[Math.floor(Math.random() * choices.length)].name;
    setBotChoice(botChoice);
    
    const playerWins = choices.find(c => c.name === choice)?.beats === botChoice;
    const botWins = choices.find(c => c.name === botChoice)?.beats === choice;
    
    if (playerWins) {
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      toast({ title: "You win this round! 🎉" });
    } else if (botWins) {
      setScore(prev => ({ ...prev, bot: prev.bot + 1 }));
      toast({ title: "Bot wins this round! 🤖" });
    } else {
      toast({ title: "It's a tie! 🤝" });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hand className="h-5 w-5" />
          Rock Paper Scissors ML
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline">You: {score.player}</Badge>
            <Badge variant="outline">Bot: {score.bot}</Badge>
          </div>
          
          {playerChoice && botChoice && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium">You</p>
                <div className="text-4xl">
                  {choices.find(c => c.name === playerChoice)?.emoji}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Bot</p>
                <div className="text-4xl">
                  {choices.find(c => c.name === botChoice)?.emoji}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            {choices.map(choice => (
              <Button 
                key={choice.name}
                variant="outline" 
                onClick={() => playRound(choice.name)}
                className="h-16 flex flex-col"
              >
                <span className="text-2xl">{choice.emoji}</span>
                <span className="text-xs">{choice.name}</span>
              </Button>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => {
              setScore({ player: 0, bot: 0 });
              setPlayerChoice('');
              setBotChoice('');
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MagicDrawingGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'drawing'>('idle');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const prompts = ['sun', 'house', 'tree', 'car', 'cat', 'flower'];

  const startDrawing = () => {
    setGameState('drawing');
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  const submitDrawing = () => {
    // Simulate AI recognition
    const recognized = Math.random() > 0.3; // 70% success rate
    if (recognized) {
      setScore(prev => prev + 10);
      toast({
        title: "Great drawing! ✨",
        description: `I can see it's a ${currentPrompt}!`
      });
    } else {
      toast({
        title: "Let me guess... 🤔",
        description: "Try drawing it a bit differently!",
        variant: "destructive"
      });
    }
    
    // Clear canvas and get new prompt
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Magic Drawing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Draw what the AI asks and see if it can recognize your art!
            </p>
            <Button onClick={startDrawing} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Drawing
            </Button>
          </div>
        )}
        
        {gameState === 'drawing' && (
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="secondary">Score: {score}</Badge>
              <p className="text-lg font-medium mt-2">Draw a: {currentPrompt}</p>
            </div>
            
            <canvas 
              ref={canvasRef}
              width={300}
              height={200}
              className="border border-border rounded-lg w-full bg-white"
              style={{ touchAction: 'none' }}
            />
            
            <div className="flex gap-2">
              <Button onClick={submitDrawing} className="flex-1">
                <Star className="mr-2 h-4 w-4" />
                Submit Drawing
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                  }
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MLGames = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const handleConceptExplanation = (concept: string) => {
    setCurrentTopic(concept);
    toast({
      title: "🤖 AI-ko explains!",
      description: `Learning about ${concept}...`
    });
  };

  const games: MLGame[] = [
    {
      id: 'emoji-predictor',
      title: 'Emotion Detector',
      description: 'Train AI to recognize your facial expressions',
      icon: Camera,
      difficulty: 'Easy',
      category: 'Vision',
      instructions: [
        'Allow camera access',
        'Make different facial expressions',
        'Train the AI to recognize emotions',
        'Earn points for correct predictions'
      ],
      aiConcepts: ['Computer Vision', 'Pattern Recognition', 'Training Data'],
      gameComponent: () => <EmojiPredictorGame />
    },
    {
      id: 'food-classifier',
      title: 'Food Classifier',
      description: 'Identify different foods and earn points',
      icon: Gamepad2,
      difficulty: 'Easy',
      category: 'Vision',
      instructions: [
        'Look at the food emoji',
        'Choose the correct name',
        'Complete 5 rounds',
        'Get the highest score'
      ],
      aiConcepts: ['Classification', 'Machine Learning', 'Data Labeling'],
      gameComponent: () => <FoodClassifierGame />
    },
    {
      id: 'rock-paper-scissors',
      title: 'RPS AI Battle',
      description: 'Play against an AI that learns your patterns',
      icon: Hand,
      difficulty: 'Medium',
      category: 'Gesture',
      instructions: [
        'Choose Rock, Paper, or Scissors',
        'The AI learns your patterns',
        'Try to outsmart the machine',
        'Best of unlimited rounds'
      ],
      aiConcepts: ['Predictive AI', 'Pattern Analysis', 'Game Theory'],
      gameComponent: () => <RockPaperScissorsML />
    },
    {
      id: 'magic-drawing',
      title: 'Magic Drawing',
      description: 'Draw objects and see if AI can recognize them',
      icon: Palette,
      difficulty: 'Medium',
      category: 'Creative',
      instructions: [
        'Read the drawing prompt',
        'Draw on the canvas',
        'Submit your artwork',
        'See if AI recognizes it'
      ],
      aiConcepts: ['Image Recognition', 'Neural Networks', 'Feature Detection'],
      gameComponent: () => <MagicDrawingGame />
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Vision': return 'bg-blue-100 text-blue-700';
      case 'Gesture': return 'bg-purple-100 text-purple-700';
      case 'Creative': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">🎮 ML Games</h2>
        <p className="text-muted-foreground">
          Learn machine learning through fun, interactive games!
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="Vision">Vision</TabsTrigger>
          <TabsTrigger value="Gesture">Gesture</TabsTrigger>
          <TabsTrigger value="Creative">Creative</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Dialog key={game.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{game.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">{game.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={getDifficultyColor(game.difficulty)}>
                              {game.difficulty}
                            </Badge>
                            <Badge className={getCategoryColor(game.category)}>
                              {game.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {game.title}
                      </DialogTitle>
                    </DialogHeader>
                    <game.gameComponent />
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </TabsContent>

        {['Vision', 'Gesture', 'Creative'].map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.filter(game => game.category === category).map((game) => {
                const Icon = game.icon;
                return (
                  <Dialog key={game.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-lg transition-all">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{game.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{game.description}</p>
                              </div>
                            </div>
                            <Badge className={getDifficultyColor(game.difficulty)}>
                              {game.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {game.title}
                        </DialogTitle>
                      </DialogHeader>
                      <game.gameComponent />
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MLGames;