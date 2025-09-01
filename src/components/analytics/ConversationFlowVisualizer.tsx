import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { BarChart, MessageSquare, TrendingUp, Users, Eye, RefreshCw } from "lucide-react";
import { Node, Edge } from '@xyflow/react';

interface ConversationFlowVisualizerProps {
  nodes: Node[];
  edges: Edge[];
}

// Mock conversation data for demonstration
const mockConversationData = [
  {
    id: '1',
    userInput: 'Hello there!',
    matchedIntent: 'greet',
    confidence: 0.95,
    response: 'Hello! How can I help you today?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    responseTime: 120
  },
  {
    id: '2',
    userInput: 'What\'s the weather like?',
    matchedIntent: 'weather-query',
    confidence: 0.87,
    response: 'I don\'t have access to weather data, but I can help with other things!',
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    responseTime: 95
  },
  {
    id: '3',
    userInput: 'Can you help me with my homework?',
    matchedIntent: 'homework-help',
    confidence: 0.92,
    response: 'I\'d be happy to help with your homework! What subject are you working on?',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    responseTime: 110
  }
];

export const ConversationFlowVisualizer = ({ nodes, edges }: ConversationFlowVisualizerProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'confidence' | 'response-time'>('volume');

  // Analytics calculations
  const analytics = useMemo(() => {
    const intentNodes = nodes.filter(node => node.type === 'intent');
    const totalConversations = mockConversationData.length;
    const avgConfidence = mockConversationData.reduce((sum, conv) => sum + conv.confidence, 0) / totalConversations;
    const avgResponseTime = mockConversationData.reduce((sum, conv) => sum + conv.responseTime, 0) / totalConversations;
    
    // Intent usage frequency
    const intentUsage = intentNodes.map(node => {
      const intentId = node.id;
      const uses = mockConversationData.filter(conv => conv.matchedIntent === intentId).length;
      return {
        intentId,
        name: node.data.label,
        uses,
        percentage: (uses / totalConversations) * 100,
        avgConfidence: mockConversationData
          .filter(conv => conv.matchedIntent === intentId)
          .reduce((sum, conv, _, arr) => sum + conv.confidence / arr.length, 0) || 0
      };
    }).sort((a, b) => b.uses - a.uses);

    // Conversation paths
    const conversationPaths = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return {
        from: sourceNode?.data.label || edge.source,
        to: targetNode?.data.label || edge.target,
        frequency: Math.floor(Math.random() * 10) + 1 // Mock data
      };
    });

    return {
      totalConversations,
      avgConfidence,
      avgResponseTime,
      intentUsage,
      conversationPaths,
      successRate: 85, // Mock success rate
      topIntent: intentUsage[0]?.name || 'None'
    };
  }, [nodes, edges, mockConversationData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 30) return 'bg-green-100 text-green-700';
    if (percentage >= 15) return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold">{analytics.totalConversations}</div>
            </div>
            <p className="text-sm text-muted-foreground">Conversations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">{Math.round(analytics.avgConfidence * 100)}%</div>
            </div>
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-500" />
              <div className="text-2xl font-bold">{Math.round(analytics.avgResponseTime)}ms</div>
            </div>
            <p className="text-sm text-muted-foreground">Response Time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <div className="text-2xl font-bold">{analytics.successRate}%</div>
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intents">Intent Analysis</TabsTrigger>
          <TabsTrigger value="paths">Conversation Paths</TabsTrigger>
          <TabsTrigger value="history">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Top Performing Intent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <strong className="text-green-700 dark:text-green-300">Top Intent:</strong> {analytics.topIntent}
                    <p className="text-sm text-muted-foreground">
                      {analytics.intentUsage[0]?.uses || 0} uses ({Math.round(analytics.intentUsage[0]?.percentage || 0)}% of traffic)
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {Math.round((analytics.intentUsage[0]?.avgConfidence || 0) * 100)}% confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Intent Distribution</h4>
                    <div className="space-y-2">
                      {analytics.intentUsage.slice(0, 5).map((intent, index) => (
                        <div key={intent.intentId} className="flex items-center gap-3">
                          <span className="text-sm w-20 truncate">{intent.name}</span>
                          <Progress value={intent.percentage} className="flex-1 h-2" />
                          <span className="text-xs w-12">{intent.uses}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Confidence Levels</h4>
                    <div className="space-y-2">
                      {analytics.intentUsage.slice(0, 5).map((intent) => (
                        <div key={intent.intentId} className="flex items-center justify-between">
                          <span className="text-sm">{intent.name}</span>
                          <Badge className={`${getConfidenceColor(intent.avgConfidence)} bg-transparent border`}>
                            {Math.round(intent.avgConfidence * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intent Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.intentUsage.map((intent, index) => (
                  <div key={intent.intentId} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">#{index + 1}</span>
                        <span className="font-medium">{intent.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getUsageColor(intent.percentage)}>
                          {intent.uses} uses
                        </Badge>
                        <Badge variant="outline" className={getConfidenceColor(intent.avgConfidence)}>
                          {Math.round(intent.avgConfidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Usage frequency</span>
                        <span>{Math.round(intent.percentage)}% of conversations</span>
                      </div>
                      <Progress value={intent.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Flow Paths</CardTitle>
              <p className="text-sm text-muted-foreground">
                How users navigate through your bot's conversation flow
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.conversationPaths.length > 0 ? (
                  analytics.conversationPaths.map((path, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <Badge variant="outline">{path.from}</Badge>
                      <div className="flex-1 flex items-center">
                        <div className="h-px bg-border flex-1"></div>
                        <span className="text-xs text-muted-foreground mx-2">{path.frequency}x</span>
                        <div className="h-px bg-border flex-1"></div>
                      </div>
                      <Badge variant="outline">{path.to}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversation paths yet</p>
                    <p className="text-sm">Connect your intents to see conversation flows</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockConversationData.map((conversation) => (
                    <div key={conversation.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getUsageColor(conversation.confidence * 100)}>
                          {conversation.matchedIntent}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {conversation.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          <strong>User:</strong> {conversation.userInput}
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          <strong>Bot:</strong> {conversation.response}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>Confidence: {Math.round(conversation.confidence * 100)}%</span>
                        <span>Response time: {conversation.responseTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};