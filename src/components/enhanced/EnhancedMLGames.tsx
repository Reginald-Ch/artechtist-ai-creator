import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Hand, Gamepad2, Palette, Trophy, Star, Play, RotateCcw, Brain, Lightbulb, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AIMascot } from "@/components/ai-tutor/AIMascot";

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

interface MLGameWithMascotProps {
  gameId: string;
  onConceptExplanation: (concept: string) => void;
}

const EmojiPredictorGame = ({ gameId, onConceptExplanation }: MLGameWithMascotProps) => {
  const [gameState, setGameState] = useState<'idle' | 'training' | 'playing'>('idle');
  const [score, setScore] = useState(0);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [showingConcept, setShowingConcept] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startGame = useCallback(async () => {
    setGameState('training');
    // Explain concept first
    onConceptExplanation('Computer Vision - recognizing patterns in images');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast({
        title: "Camera activated! 📸",
        description: "AI-ko: Computer vision helps computers 'see' and understand images!"
      });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to play this game",
        variant: "destructive"
      });
    }
  }, [onConceptExplanation]);

  const simulateEmotion = (emotion: string) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      surprised: '😮',
      angry: '😠'
    };
    setPredictions(prev => [...prev.slice(-2), emojis[emotion as keyof typeof emojis] || '🤔']);
    setScore(prev => prev + 10);
    
    // AI teaching moment
    if (score % 20 === 0) {
      onConceptExplanation('Pattern Recognition - AI learns by seeing many examples!');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Emotion Detector
          <Badge variant="outline" className="text-xs">Computer Vision</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              🤖 AI-ko says: "Let's teach the computer to recognize emotions! Just like how you recognize when your friend is happy or sad."
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

const FoodClassifierGame = ({ gameId, onConceptExplanation }: MLGameWithMascotProps) => {
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
    onConceptExplanation('Classification - sorting things into categories!');
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
        description: `AI-ko: Great classification! You correctly identified the ${correctName}!`
      });
    } else {
      toast({
        title: "Try again!",
        description: `AI-ko: That was a ${correctName}. Classification means putting things in the right group!`,
        variant: "destructive"
      });
    }
    
    if (round < 5) {
      setTimeout(generateNewFood, 1500);
    } else {
      setGameState('menu');
      onConceptExplanation('Machine Learning - computers get better with practice!');
      toast({
        title: "Game Complete!",
        description: `Final score: ${score}/50. AI-ko: You trained the AI well!`
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Food Classifier
          <Badge variant="outline" className="text-xs">Classification</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === 'menu' && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              🤖 AI-ko says: "Classification is like sorting your toys! Let's teach the AI to sort different foods."
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

const RockPaperScissorsML = ({ gameId, onConceptExplanation }: MLGameWithMascotProps) => {
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

    // Teaching moment
    if ((score.player + score.bot) % 3 === 0) {
      onConceptExplanation('Predictive AI - the computer tries to guess your next move by looking at patterns!');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hand className="h-5 w-5" />
          Rock Paper Scissors ML
          <Badge variant="outline" className="text-xs">Pattern Analysis</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            🤖 AI-ko: "This AI tries to predict your moves by learning your patterns!"
          </p>
          
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

const MagicDrawingGame = ({ gameId, onConceptExplanation }: MLGameWithMascotProps) => {
  const [gameState, setGameState] = useState<'idle' | 'drawing'>('idle');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const prompts = ['sun', 'house', 'tree', 'car', 'cat', 'flower'];

  const startDrawing = () => {
    setGameState('drawing');
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    onConceptExplanation('Image Recognition - AI learns to see and understand drawings!');
  };

  const submitDrawing = () => {
    // Simulate AI recognition
    const recognized = Math.random() > 0.3; // 70% success rate
    if (recognized) {
      setScore(prev => prev + 10);
      toast({
        title: "Great drawing! ✨",
        description: `AI-ko: I can see it's a ${currentPrompt}! Neural networks help me recognize your art!`
      });
    } else {
      toast({
        title: "Let me guess... 🤔",
        description: "AI-ko: Try drawing it a bit differently! AI learns from many examples.",
        variant: "destructive"
      });
    }
    
    onConceptExplanation('Feature Detection - AI looks for specific shapes and patterns in images!');
    
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
          <Badge variant="outline" className="text-xs">Image Recognition</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              🤖 AI-ko says: "Draw what I ask and I'll try to recognize it! This is how computers learn to 'see' art."
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

const EnhancedMLGames = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const handleConceptExplanation = (concept: string) => {
    setCurrentTopic(concept);
    toast({
      title: "🤖 AI-ko explains!",
      description: concept
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
      gameComponent: () => <EmojiPredictorGame gameId="emoji-predictor" onConceptExplanation={handleConceptExplanation} />
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
      gameComponent: () => <FoodClassifierGame gameId="food-classifier" onConceptExplanation={handleConceptExplanation} />
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
      gameComponent: () => <RockPaperScissorsML gameId="rock-paper-scissors" onConceptExplanation={handleConceptExplanation} />
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
      gameComponent: () => <MagicDrawingGame gameId="magic-drawing" onConceptExplanation={handleConceptExplanation} />
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
        <h2 className="text-3xl font-bold mb-2">🎮 ML Games with AI-ko</h2>
        <p className="text-muted-foreground">
          Learn machine learning through fun, interactive games with your AI teacher!
        </p>
      </div>

      {/* AI Mascot Integration */}
      <div className="max-w-md mx-auto">
        <AIMascot 
          currentTopic={currentTopic}
          onTopicChange={setCurrentTopic}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="Vision">Vision</TabsTrigger>
          <TabsTrigger value="Gesture">Gesture</TabsTrigger>
          <TabsTrigger value="Creative">Creative</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => {
              const IconComponent = game.icon;
              return (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{game.title}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Badge className={getDifficultyColor(game.difficulty)}>
                          {game.difficulty}
                        </Badge>
                        <Badge className={getCategoryColor(game.category)}>
                          {game.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground space-y-1">
                        {game.instructions.map((instruction, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-primary/10 rounded-full text-xs flex items-center justify-center">
                              {i + 1}
                            </span>
                            {instruction}
                          </div>
                        ))}
                      </div>
                      
                      {/* AI Concepts */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          You'll learn about:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {game.aiConcepts.map((concept, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => setSelectedGame(game.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Play Game
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            {game.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="text-center">
                          {game.gameComponent()}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Category specific tabs */}
        {['Vision', 'Gesture', 'Creative'].map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.filter(game => game.category === category).map((game) => {
                const IconComponent = game.icon;
                return (
                  <Card key={game.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{game.title}</CardTitle>
                        </div>
                        <Badge className={getDifficultyColor(game.difficulty)}>
                          {game.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground space-y-1">
                          {game.instructions.map((instruction, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-4 h-4 bg-primary/10 rounded-full text-xs flex items-center justify-center">
                                {i + 1}
                              </span>
                              {instruction}
                            </div>
                          ))}
                        </div>
                        
                        {/* AI Concepts */}
                        <div className="border-t pt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            You'll learn about:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {game.aiConcepts.map((concept, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full mt-4" 
                            onClick={() => setSelectedGame(game.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Play Game
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <IconComponent className="h-5 w-5" />
                              {game.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="text-center">
                            {game.gameComponent()}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EnhancedMLGames;