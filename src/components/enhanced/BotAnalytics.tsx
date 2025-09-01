import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, MessageSquare, Users, Clock, Target, Zap } from "lucide-react";

interface BotAnalyticsProps {
  nodes: any[];
  edges: any[];
}

export const BotAnalytics: React.FC<BotAnalyticsProps> = ({ nodes, edges }) => {
  const totalIntents = nodes.length;
  const totalConnections = edges.length;
  const avgResponsesPerIntent = nodes.reduce((acc, node) => acc + (node.data.responses?.length || 0), 0) / totalIntents;
  const avgTrainingPhrasesPerIntent = nodes.reduce((acc, node) => acc + (node.data.trainingPhrases?.length || 0), 0) / totalIntents;
  
  const complexityScore = Math.min(100, (totalIntents * 10 + totalConnections * 15 + avgResponsesPerIntent * 20));
  
  const metrics = [
    {
      label: "Intent Coverage",
      value: totalIntents,
      max: 20,
      description: "Number of different conversation topics",
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      label: "Flow Connections",
      value: totalConnections,
      max: 50,
      description: "Conversation flow complexity",
      icon: Target,
      color: "text-green-600"
    },
    {
      label: "Response Variety",
      value: Math.round(avgResponsesPerIntent * 10),
      max: 100,
      description: "Average responses per intent",
      icon: Zap,
      color: "text-orange-600"
    },
    {
      label: "Training Quality",
      value: Math.round(avgTrainingPhrasesPerIntent * 10),
      max: 100,
      description: "Training phrase coverage",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  const getComplexityLevel = () => {
    if (complexityScore < 30) return { level: "Beginner", color: "bg-green-500" };
    if (complexityScore < 60) return { level: "Intermediate", color: "bg-yellow-500" };
    return { level: "Advanced", color: "bg-red-500" };
  };

  const complexity = getComplexityLevel();

  return (
    <div className="space-y-4">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Bot Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Complexity Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bot Complexity</span>
              <Badge className={`${complexity.color} text-white`}>
                {complexity.level}
              </Badge>
            </div>
            <Progress value={complexityScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Score: {Math.round(complexityScore)}/100
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2 p-3 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-xs font-medium">{metric.label}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{metric.value}</span>
                    <span className="text-xs text-muted-foreground">/{metric.max}</span>
                  </div>
                  <Progress value={(metric.value / metric.max) * 100} className="h-1" />
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Improvement Suggestions</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {totalIntents < 5 && (
                <p>• Add more intents to handle diverse conversation topics</p>
              )}
              {totalConnections < 3 && (
                <p>• Connect intents to create better conversation flows</p>
              )}
              {avgResponsesPerIntent < 2 && (
                <p>• Add more response variations to make conversations engaging</p>
              )}
              {avgTrainingPhrasesPerIntent < 3 && (
                <p>• Include more training phrases to improve intent recognition</p>
              )}
              {totalIntents >= 5 && totalConnections >= 3 && avgResponsesPerIntent >= 2 && (
                <p>• Great job! Your bot is well-structured and ready for deployment 🎉</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};