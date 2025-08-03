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
  const [showLearning, setShowLearning] = useState(false);
  const [currentStory, setCurrentStory] = useState(0);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Tic-Tac-Toe Game */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5" />
                      AI Tic-Tac-Toe Challenge
                    </CardTitle>
                    <CardDescription>Play against an AI that adapts to your skill level</CardDescription>
                  </div>
                  <Button onClick={() => setShowLearning(!showLearning)} variant="outline" size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    {showLearning ? 'Hide' : 'Show'} AI Learning
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Game Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{gameStats.wins}</div>
                    <div className="text-sm text-muted-foreground">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{gameStats.losses}</div>
                    <div className="text-sm text-muted-foreground">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{gameStats.draws}</div>
                    <div className="text-sm text-muted-foreground">Draws</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{gameStats.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Streak</div>
                  </div>
                </div>

                {/* AI Learning Visualization */}
                {showLearning && (
                  <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        AI Adaptation Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Current Difficulty:</span>
                          <Badge className={`${getDifficultyColor()} text-white`}>
                            {getDifficultyText()}
                          </Badge>
                        </div>
                        <Progress value={gameStats.adaptationLevel} className="h-3" />
                        <div className="text-sm text-muted-foreground">
                          The AI is learning from your moves and adjusting its strategy! 
                          {gameStats.adaptationLevel < 50 ? 
                            " It's taking it easy on you 😊" : 
                            " It's bringing its A-game! 🔥"
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Game Board */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="grid grid-cols-3 gap-2 w-64 h-64">
                    {board.map((cell, index) => (
                      <button
                        key={index}
                        onClick={() => handleCellClick(index)}
                        className="w-20 h-20 bg-white dark:bg-muted border-2 border-border rounded-lg text-4xl font-bold hover:bg-accent transition-colors disabled:cursor-not-allowed"
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
                        <div className="text-2xl font-bold">
                          {winner === 'X' && '🎉 You won!'}
                          {winner === 'O' && '🤖 AI wins!'}
                          {winner === 'draw' && '🤝 It\'s a draw!'}
                        </div>
                        <Button onClick={resetGame} className="mt-2">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Play Again
                        </Button>
                      </div>
                    ) : (
                      <div className="text-lg">
                        {isPlayerTurn ? "Your turn (X)" : "AI is thinking... 🤔"}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comic Hero Guide */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Story Guide
                </CardTitle>
                <CardDescription>Learn AI through African wisdom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {africanStories.map((story, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all ${
                        currentStory === index ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''
                      }`}
                      onClick={() => setCurrentStory(index)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{story.avatar}</div>
                          <div>
                            <h3 className="font-medium">{story.title}</h3>
                            <p className="text-sm text-muted-foreground">{story.culture}</p>
                          </div>
                        </div>
                        <p className="text-sm mt-2">{story.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Language Explorer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Language Explorer
                </CardTitle>
                <CardDescription>Hear greetings from across Africa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <h3 className="font-medium">{lang.name}</h3>
                          <p className="text-sm text-muted-foreground">{lang.greeting} - {lang.meaning}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => speakText(lang.greeting)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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