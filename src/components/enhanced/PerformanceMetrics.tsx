import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Users, 
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Activity
} from "lucide-react";

interface PerformanceMetricsProps {
  nodes: any[];
  conversationHistory?: any[];
}

interface Metric {
  label: string;
  value: number;
  change: number;
  status: 'good' | 'warning' | 'error';
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  nodes,
  conversationHistory = []
}) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    calculateMetrics();
  }, [nodes, conversationHistory]);

  const calculateMetrics = () => {
    const totalIntents = nodes.length;
    const trainedIntents = nodes.filter(n => n.data.trainingPhrases?.length > 0).length;
    const responseIntents = nodes.filter(n => n.data.responses?.length > 0).length;
    
    // Calculate training coverage
    const trainingCoverage = totalIntents > 0 ? (trainedIntents / totalIntents) * 100 : 0;
    
    // Calculate response completeness
    const responseCompleteness = totalIntents > 0 ? (responseIntents / totalIntents) * 100 : 0;
    
    // Calculate average training phrases per intent
    const avgTrainingPhrases = trainedIntents > 0 ? 
      nodes.reduce((sum, n) => sum + (n.data.trainingPhrases?.length || 0), 0) / trainedIntents : 0;
    
    // Calculate response quality (based on length and variety)
    const avgResponseLength = responseIntents > 0 ?
      nodes.reduce((sum, n) => {
        const responses = n.data.responses || [];
        const avgLength = responses.reduce((rSum: number, r: string) => rSum + r.length, 0) / responses.length;
        return sum + (avgLength || 0);
      }, 0) / responseIntents : 0;

    const newMetrics: Metric[] = [
      {
        label: 'Training Coverage',
        value: Math.round(trainingCoverage),
        change: 5,
        status: trainingCoverage >= 80 ? 'good' : trainingCoverage >= 60 ? 'warning' : 'error'
      },
      {
        label: 'Response Completeness',
        value: Math.round(responseCompleteness),
        change: 2,
        status: responseCompleteness >= 90 ? 'good' : responseCompleteness >= 70 ? 'warning' : 'error'
      },
      {
        label: 'Avg Training Phrases',
        value: Math.round(avgTrainingPhrases * 10) / 10,
        change: 0.5,
        status: avgTrainingPhrases >= 5 ? 'good' : avgTrainingPhrases >= 3 ? 'warning' : 'error'
      },
      {
        label: 'Response Quality',
        value: Math.round((avgResponseLength / 100) * 100),
        change: -1,
        status: avgResponseLength >= 50 && avgResponseLength <= 200 ? 'good' : 'warning'
      }
    ];

    setMetrics(newMetrics);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="h-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            {metrics.map((metric, index) => (
              <div 
                key={metric.label}
                className="space-y-2 animate-slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{metric.value}%</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={metric.value} 
                  className="h-2"
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Intents</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Trained Intents</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {nodes.filter(n => n.data.trainingPhrases?.length > 0).length}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Intent Analysis</h4>
              {nodes.slice(0, 5).map((node, index) => (
                <div 
                  key={node.id}
                  className="flex items-center justify-between p-2 border border-border rounded animate-slide-in-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-sm font-medium">{node.data.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {node.data.trainingPhrases?.length || 0} phrases
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {node.data.responses?.length || 0} responses
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};