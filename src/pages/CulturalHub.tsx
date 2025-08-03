import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Brain, 
  Star, 
  Trophy, 
  Gamepad2, 
  BookOpen, 
  Volume2,
  RotateCcw,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

type Player = 'X' | 'O' | null;
type Board = Player[];
type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  difficulty: Difficulty;
  adaptationLevel: number;
}

const CulturalHub = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | 'draw'>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    difficulty: 'adaptive',
    adaptationLevel: 50
  });
  const [showLearning, setShowLearning] = useState(true);
  const [currentStory, setCurrentStory] = useState(0);
  const [currentLearningPanel, setCurrentLearningPanel] = useState(0);

  const learningPanels = [
    {
      title: "How AI Learns",
      avatar: "🤖",
      explanation: "Watch this! Every time we play tic-tac-toe together, I get a little bit smarter. I learn from each move you make and try to get better at the game.",
      concept: "This is called 'machine learning' - AI learns patterns from examples and experiences.",
      aiStrength: Math.min(5, Math.floor(gameStats.adaptationLevel / 20) + 1)
    },
    {
      title: "Pattern Recognition",
      avatar: "🧠",
      explanation: "Just like Anansi the Spider weaves complex webs, I weave patterns from your moves. Each game teaches me something new about strategy.",
      concept: "AI uses pattern recognition to understand and predict behaviors, just like recognizing familiar web patterns.",
      aiStrength: Math.min(5, Math.floor(gameStats.adaptationLevel / 20) + 1)
    },
    {
      title: "Adaptive Learning",
      avatar: "🌱",
      explanation: "Like the wise tortoise, I don't rush. I slowly adjust my difficulty based on how well you play, making games more fun and balanced.",
      concept: "Adaptive algorithms change their behavior based on feedback to provide better experiences.",
      aiStrength: Math.min(5, Math.floor(gameStats.adaptationLevel / 20) + 1)
    }
  ];

  const africanStories = [
    {
      title: "Anansi the Spider",
      culture: "West African",
      lesson: "Wisdom through cleverness",
      avatar: "🕷️",
      description: "Learn how AI patterns match Anansi's web of knowledge"
    },
    {
      title: "The Tortoise and the Birds",
      culture: "Yoruba",
      lesson: "Patience and strategy",
      avatar: "🐢",
      description: "Discover how AI learns slowly but surely, like the wise tortoise"
    },
    {
      title: "Nyame's Golden Stool",
      culture: "Ashanti",
      lesson: "Sacred wisdom",
      avatar: "👑",
      description: "Explore how AI holds and protects important information"
    },
    {
      title: "The Talking Drum",
      culture: "Various African",
      lesson: "Communication across distances",
      avatar: "🥁",
      description: "Learn how AI communicates like the ancient talking drums"
    }
  ];

  const languages = [
    { name: "Swahili", greeting: "Hujambo!", meaning: "Hello!", flag: "🇹🇿" },
    { name: "Yoruba", greeting: "Bawo ni!", meaning: "How are you!", flag: "🇳🇬" },
    { name: "Zulu", greeting: "Sawubona!", meaning: "We see you!", flag: "🇿🇦" },
    { name: "Amharic", greeting: "ሰላም!", meaning: "Peace!", flag: "🇪🇹" },
    { name: "Hausa", greeting: "Sannu!", meaning: "Hello!", flag: "🇳🇬" }
  ];

  const checkWinner = (board: Board): Player | 'draw' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return board.every(cell => cell !== null) ? 'draw' : null;
  };

  const getAIMove = (board: Board, difficulty: Difficulty, adaptationLevel: number): number => {
    const availableMoves = board.map((cell, index) => cell === null ? index : null)
      .filter(move => move !== null) as number[];

    if (availableMoves.length === 0) return -1;

    // Adaptive difficulty based on player performance
    let effectiveDifficulty = difficulty;
    if (difficulty === 'adaptive') {
      if (adaptationLevel < 30) effectiveDifficulty = 'easy';
      else if (adaptationLevel < 70) effectiveDifficulty = 'medium';
      else effectiveDifficulty = 'hard';
    }

    switch (effectiveDifficulty) {
      case 'easy':
        // Random move 70% of the time
        if (Math.random() < 0.7) {
          return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        break;
      
      case 'medium':
        // Block player wins, but don't always play optimally
        const blockMove = findWinningMove(board, 'X');
        if (blockMove !== -1 && Math.random() < 0.8) return blockMove;
        break;
      
      case 'hard':
        // Play optimally
        const winMove = findWinningMove(board, 'O');
        if (winMove !== -1) return winMove;
        
        const blockPlayerWin = findWinningMove(board, 'X');
        if (blockPlayerWin !== -1) return blockPlayerWin;
        
        // Take center if available
        if (board[4] === null) return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8].filter(i => board[i] === null);
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
        break;
    }

    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const findWinningMove = (board: Board, player: Player): number => {
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = player;
        if (checkWinner(testBoard) === player) {
          return i;
        }
      }
    }
    return -1;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || gameOver || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      setGameOver(true);
      updateGameStats(result);
      return;
    }

    // AI move
    setTimeout(() => {
      const aiMove = getAIMove(newBoard, gameStats.difficulty, gameStats.adaptationLevel);
      if (aiMove !== -1) {
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);

        const aiResult = checkWinner(aiBoard);
        if (aiResult) {
          setWinner(aiResult);
          setGameOver(true);
          updateGameStats(aiResult);
        } else {
          setIsPlayerTurn(true);
        }
      }
    }, 500);
  };

  const updateGameStats = (result: Player | 'draw') => {
    setGameStats(prev => {
      let newStats = { ...prev };
      
      if (result === 'X') {
        newStats.wins++;
        newStats.currentStreak = prev.currentStreak >= 0 ? prev.currentStreak + 1 : 1;
        // Increase difficulty if player is winning
        newStats.adaptationLevel = Math.min(100, prev.adaptationLevel + 10);
      } else if (result === 'O') {
        newStats.losses++;
        newStats.currentStreak = prev.currentStreak <= 0 ? prev.currentStreak - 1 : -1;
        // Decrease difficulty if player is losing
        newStats.adaptationLevel = Math.max(0, prev.adaptationLevel - 15);
      } else {
        newStats.draws++;
        newStats.currentStreak = 0;
        // Slight adjustment for draws
        newStats.adaptationLevel = Math.max(0, prev.adaptationLevel - 5);
      }

      return newStats;
    });
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
    setShowLearning(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = () => {
    const level = gameStats.adaptationLevel;
    if (level < 30) return 'bg-green-500';
    if (level < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyText = () => {
    const level = gameStats.adaptationLevel;
    if (level < 30) return 'Easy';
    if (level < 70) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Cultural Hub
            </h1>
          </div>
          <Link to="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Explore African Stories, Languages & AI! 🌍</h2>
          <p className="text-muted-foreground text-lg">Learn how AI works through the wisdom of African traditions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How AI Learns Panel */}
          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <div className="text-2xl">🤖</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-600">How AI Learns</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-muted-foreground">AI Strength:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.min(5, Math.floor(gameStats.adaptationLevel / 20) + 1) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm leading-relaxed">
                  Watch this! Every time we play tic-tac-toe together, I get a little bit 
                  smarter. I learn from each move you make and try to get better at the game.
                </p>
              </div>
              
              <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-orange-500 mt-0.5">💡</div>
                  <div>
                    <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-1">Learning Moment:</h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      This is called 'machine learning' - AI learns patterns from examples and experiences.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={resetGame}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                📚 Keep playing to train me!
              </Button>
            </CardContent>
          </Card>

          {/* Tic-Tac-Toe Training Panel */}
          <Card className="bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  <h3 className="text-xl font-bold">Tic-Tac-Toe Training</h3>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                AI Difficulty: <span className="font-medium text-blue-600">{getDifficultyText()}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Games: {gameStats.wins + gameStats.losses + gameStats.draws} | 
                You: {gameStats.wins} | 
                AI: {gameStats.losses} | 
                Draws: {gameStats.draws}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="grid grid-cols-3 gap-2 w-64 h-64 bg-white dark:bg-muted p-4 rounded-lg">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      className="w-16 h-16 bg-gray-50 dark:bg-background border-2 border-gray-200 dark:border-border rounded-lg text-3xl font-bold hover:bg-gray-100 dark:hover:bg-accent transition-colors disabled:cursor-not-allowed"
                      disabled={!!cell || gameOver || !isPlayerTurn}
                    >
                      {cell}
                    </button>
                  ))}
                </div>

                {/* Game Status */}
                <div className="text-center">
                  {gameOver ? (
                    <div className="space-y-2">
                      <div className="text-xl font-bold">
                        {winner === 'X' && '🎉 You won!'}
                        {winner === 'O' && '🤖 AI wins!'}
                        {winner === 'draw' && '🤝 It\'s a draw!'}
                      </div>
                      <Button onClick={resetGame} variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Play Again
                      </Button>
                    </div>
                  ) : (
                    <div className="text-lg font-medium">
                      {isPlayerTurn ? "Your Turn" : "AI is thinking... 🤔"}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your AI Training Progress Panel */}
        <div className="mt-8">
          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Your AI Training Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-600">{gameStats.wins + gameStats.losses + gameStats.draws}</div>
                  <div className="text-sm text-muted-foreground">Games Played</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-orange-600">{gameStats.wins}</div>
                  <div className="text-sm text-muted-foreground">Your Wins</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-purple-600">{gameStats.adaptationLevel}%</div>
                  <div className="text-sm text-muted-foreground">AI Difficulty</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/ai-lessons">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-yellow-600">Comic Lessons</CardTitle>
                <CardDescription>Interactive stories with AI concepts</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/builder">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-blue-600">Build Your Bot</CardTitle>
                <CardDescription>Create AI agents with cultural knowledge</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/voice-training">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Volume2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-600">Voice Training</CardTitle>
                <CardDescription>Train AI with African languages</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CulturalHub;