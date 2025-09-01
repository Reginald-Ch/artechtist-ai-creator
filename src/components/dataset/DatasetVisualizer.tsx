import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Database, BarChart, Upload, Download, Search, Filter } from "lucide-react";
import { Node } from '@xyflow/react';

interface DatasetVisualizerProps {
  nodes: Node[];
  onImportData: (data: any) => void;
  onExportData: () => void;
}

export const DatasetVisualizer = ({ nodes, onImportData, onExportData }: DatasetVisualizerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [qualityFilter, setQualityFilter] = useState<'all' | 'good' | 'warning' | 'poor'>('all');

  // Analyze dataset quality
  const datasetAnalysis = useMemo(() => {
    const intentNodes = nodes.filter(node => node.type === 'intent');
    const analysis = {
      totalIntents: intentNodes.length,
      totalPhrases: 0,
      totalResponses: 0,
      coverage: 0,
      qualityScore: 0,
      issues: [] as string[],
      intentStats: [] as any[]
    };

    intentNodes.forEach(node => {
      const phrases = (node.data.trainingPhrases as string[]) || [];
      const responses = (node.data.responses as string[]) || [];
      
      analysis.totalPhrases += phrases.length;
      analysis.totalResponses += responses.length;

      // Quality assessment
      let quality = 'good';
      const issues: string[] = [];

      if (phrases.length < 3) {
        quality = 'poor';
        issues.push('Too few training phrases');
      } else if (phrases.length < 5) {
        quality = 'warning';
        issues.push('Could use more training phrases');
      }

      if (responses.length === 0) {
        quality = 'poor';
        issues.push('No responses defined');
      }

      // Check for phrase diversity
      const avgLength = phrases.reduce((sum, phrase) => sum + phrase.length, 0) / phrases.length || 0;
      if (avgLength < 10) {
        quality = quality === 'good' ? 'warning' : quality;
        issues.push('Training phrases might be too short');
      }

      // Check for duplicates
      const uniquePhrases = new Set(phrases.map(p => p.toLowerCase()));
      if (uniquePhrases.size < phrases.length) {
        quality = quality === 'good' ? 'warning' : quality;
        issues.push('Duplicate training phrases detected');
      }

      analysis.intentStats.push({
        id: node.id,
        name: node.data.label,
        phraseCount: phrases.length,
        responseCount: responses.length,
        quality,
        issues,
        phrases,
        responses
      });
    });

    // Calculate overall coverage and quality
    analysis.coverage = Math.min(100, (analysis.totalPhrases / (intentNodes.length * 5)) * 100);
    const goodIntents = analysis.intentStats.filter(stat => stat.quality === 'good').length;
    analysis.qualityScore = (goodIntents / Math.max(1, intentNodes.length)) * 100;

    return analysis;
  }, [nodes]);

  const filteredIntents = useMemo(() => {
    return datasetAnalysis.intentStats.filter(intent => {
      const matchesSearch = intent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           intent.phrases.some((phrase: string) => phrase.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesQuality = qualityFilter === 'all' || intent.quality === qualityFilter;
      
      return matchesSearch && matchesQuality;
    });
  }, [datasetAnalysis.intentStats, searchTerm, qualityFilter]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'bg-green-100 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': case 'poor': return <AlertTriangle className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{datasetAnalysis.totalIntents}</div>
            </div>
            <p className="text-sm text-muted-foreground">Intents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold">{datasetAnalysis.totalPhrases}</div>
            </div>
            <p className="text-sm text-muted-foreground">Training Phrases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">{Math.round(datasetAnalysis.qualityScore)}%</div>
            </div>
            <p className="text-sm text-muted-foreground">Quality Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div className="text-2xl font-bold">
                {datasetAnalysis.intentStats.filter(s => s.quality !== 'good').length}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Need Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Dataset Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Training Phrase Coverage</span>
              <span>{Math.round(datasetAnalysis.coverage)}%</span>
            </div>
            <Progress value={datasetAnalysis.coverage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Recommended: 5+ training phrases per intent for optimal performance
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intents">Intent Details</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quality Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['good', 'warning', 'poor'].map(quality => {
                  const count = datasetAnalysis.intentStats.filter(s => s.quality === quality).length;
                  const percentage = (count / Math.max(1, datasetAnalysis.totalIntents)) * 100;
                  
                  return (
                    <div key={quality} className="flex items-center gap-3">
                      <Badge className={getQualityColor(quality)}>
                        {getQualityIcon(quality)}
                        <span className="ml-1 capitalize">{quality}</span>
                      </Badge>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          {datasetAnalysis.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Common Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(datasetAnalysis.intentStats.flatMap(s => s.issues))).map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      {issue}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search intents or phrases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant={qualityFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setQualityFilter('all')}
            >
              All
            </Button>
            <Button
              variant={qualityFilter === 'poor' ? 'default' : 'outline'}
              onClick={() => setQualityFilter('poor')}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Issues
            </Button>
          </div>

          {/* Intent List */}
          <div className="space-y-3">
            {filteredIntents.map((intent) => (
              <Card key={intent.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{intent.name}</CardTitle>
                    <Badge className={getQualityColor(intent.quality)}>
                      {getQualityIcon(intent.quality)}
                      <span className="ml-1 capitalize">{intent.quality}</span>
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{intent.phraseCount} phrases</span>
                    <span>{intent.responseCount} responses</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {intent.issues.length > 0 && (
                    <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        <strong>Issues:</strong> {intent.issues.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div>
                      <strong className="text-sm">Sample phrases:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {intent.phrases.slice(0, 3).map((phrase: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            "{phrase}"
                          </Badge>
                        ))}
                        {intent.phrases.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{intent.phrases.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Training Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import training phrases and responses from CSV or JSON files
                </p>
                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <div className="text-xs text-muted-foreground">
                  Supported formats: CSV, JSON
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Dataset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export your training data for backup or analysis
                </p>
                <Button className="w-full" onClick={onExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <div className="text-xs text-muted-foreground">
                  Includes all intents, phrases, and responses
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Quality Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Add Variety:</strong> Include different ways users might phrase the same request
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Consider Edge Cases:</strong> Add phrases for common typos or unusual wordings
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Multiple Responses:</strong> Provide varied responses to make conversations feel natural
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};