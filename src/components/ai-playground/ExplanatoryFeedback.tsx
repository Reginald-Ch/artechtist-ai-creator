import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

interface ExplanatoryFeedbackProps {
  score: number;
  category?: string;
  context?: 'training' | 'testing' | 'complete';
  showTips?: boolean;
}

export const ExplanatoryFeedback: React.FC<ExplanatoryFeedbackProps> = ({
  score,
  category,
  context = 'testing',
  showTips = true
}) => {
  const getScoreMessage = () => {
    if (score >= 90) return {
      emoji: '🌟',
      title: 'Excellent!',
      message: 'Your model is performing amazingly! It can recognize patterns almost perfectly.',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    };
    if (score >= 75) return {
      emoji: '👍',
      title: 'Great Job!',
      message: 'Your model is doing well! It correctly identifies most patterns.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    };
    if (score >= 60) return {
      emoji: '💡',
      title: 'Good Start!',
      message: 'Your model is learning, but there\'s room for improvement.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200'
    };
    return {
      emoji: '🔄',
      title: 'Keep Trying!',
      message: 'Your model needs more training data or better examples.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    };
  };

  const getImprovementTips = () => {
    if (score >= 90) return [
      'Try testing with more varied examples',
      'You could create a similar model for different categories',
      'Share your success with friends!'
    ];
    if (score >= 75) return [
      'Add 2-3 more training examples per category',
      'Make sure your training images are clear and well-lit',
      'Try with images that look different from your training set'
    ];
    if (score >= 60) return [
      'Add more diverse training examples (at least 5 per category)',
      'Make sure each category has very different features',
      'Check that all training images are clear and in focus'
    ];
    return [
      'Start with just 2 very different categories',
      'Add at least 5-7 clear examples per category',
      'Make sure images in each category look similar to each other',
      'Remove any blurry or unclear training images'
    ];
  };

  const scoreInfo = getScoreMessage();

  return (
    <div className="space-y-4">
      {/* Main Score Card */}
      <Card className={`${scoreInfo.bgColor} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{scoreInfo.emoji}</div>
            <div className="flex-1 space-y-2">
              <h3 className={`text-xl font-bold ${scoreInfo.color}`}>
                {scoreInfo.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {scoreInfo.message}
              </p>
              
              {/* Visual Score Representation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Accuracy Score</span>
                  <span className={`font-bold ${scoreInfo.color}`}>{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>

              {/* What the score means */}
              <div className="flex items-start gap-2 p-2 bg-background/50 rounded-md">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {score >= 90 && "This means your AI got it right 9 out of 10 times! Almost perfect! 🎯"}
                  {score >= 75 && score < 90 && "This means your AI got it right about 8 out of 10 times. That's pretty good! 👏"}
                  {score >= 60 && score < 75 && "This means your AI got it right about 6-7 out of 10 times. It's learning, but can do better! 📈"}
                  {score < 60 && "This means your AI is still confused and needs more practice. Let's improve it together! 💪"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Tips */}
      {showTips && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              {score >= 90 ? 'Next Steps' : 'How to Improve'}
            </div>
            <ul className="space-y-2">
              {getImprovementTips().map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {index + 1}
                  </Badge>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* What AI Actually Learned */}
      {context === 'complete' && category && (
        <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-200">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-900">
              <AlertCircle className="h-4 w-4" />
              What Did the AI Actually Learn?
            </div>
            <p className="text-sm text-muted-foreground">
              Your AI learned to recognize patterns in {category} images. It looked at colors, shapes, 
              and features to figure out how to tell different categories apart. The more examples you 
              gave it, the better it got at recognizing these patterns!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
