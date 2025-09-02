import { useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  MessageSquare, 
  Bot, 
  AlertTriangle,
  CheckCircle,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionFlowVisualizationProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId?: string;
}

interface FlowPath {
  id: string;
  nodes: Node[];
  isComplete: boolean;
  hasIssues: boolean;
  issues: string[];
}

export const ConnectionFlowVisualization = ({ 
  nodes, 
  edges, 
  selectedNodeId 
}: ConnectionFlowVisualizationProps) => {
  const flowAnalysis = useMemo(() => {
    const paths: FlowPath[] = [];
    const connectedNodes = new Set<string>();
    const orphanNodes: Node[] = [];

    // Find all paths starting from entry points
    const entryNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    entryNodes.forEach(entryNode => {
      const path = buildPath(entryNode, nodes, edges);
      if (path.nodes.length > 0) {
        paths.push(path);
        path.nodes.forEach(node => connectedNodes.add(node.id));
      }
    });

    // Find orphan nodes
    nodes.forEach(node => {
      if (!connectedNodes.has(node.id)) {
        orphanNodes.push(node);
      }
    });

    return { paths, orphanNodes };
  }, [nodes, edges]);

  const buildPath = (startNode: Node, allNodes: Node[], allEdges: Edge[]): FlowPath => {
    const pathNodes: Node[] = [startNode];
    const visited = new Set<string>([startNode.id]);
    const issues: string[] = [];
    
    let currentNode = startNode;
    
    // Traverse the path
    while (true) {
      const outgoingEdges = allEdges.filter(edge => edge.source === currentNode.id);
      
      if (outgoingEdges.length === 0) break;
      if (outgoingEdges.length > 1) {
        issues.push(`Node "${currentNode.data.label}" has multiple connections`);
      }
      
      const nextEdge = outgoingEdges[0];
      const nextNode = allNodes.find(node => node.id === nextEdge.target);
      
      if (!nextNode) break;
      if (visited.has(nextNode.id)) {
        issues.push(`Circular reference detected at "${nextNode.data.label}"`);
        break;
      }
      
      pathNodes.push(nextNode);
      visited.add(nextNode.id);
      currentNode = nextNode;
    }

    // Check for completeness
    let isComplete = true;
    pathNodes.forEach(node => {
      const data = node.data as any;
      if (!Array.isArray(data.trainingPhrases) || data.trainingPhrases.length === 0) {
        isComplete = false;
        issues.push(`"${data.label}" has no training phrases`);
      }
      if (!Array.isArray(data.responses) || data.responses.length === 0) {
        isComplete = false;
        issues.push(`"${data.label}" has no responses`);
      }
    });

    return {
      id: `path-${startNode.id}`,
      nodes: pathNodes,
      isComplete,
      hasIssues: issues.length > 0,
      issues
    };
  };

  const getNodeStatus = (node: Node) => {
    const data = node.data as any;
    const hasTraining = Array.isArray(data.trainingPhrases) && data.trainingPhrases.length > 0;
    const hasResponses = Array.isArray(data.responses) && data.responses.length > 0;
    
    if (hasTraining && hasResponses) return 'complete';
    if (!hasTraining && !hasResponses) return 'empty';
    return 'incomplete';
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'incomplete':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4" />
            Flow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-secondary rounded">
              <div className="font-semibold">{flowAnalysis.paths.length}</div>
              <div className="text-muted-foreground">Paths</div>
            </div>
            <div className="text-center p-2 bg-secondary rounded">
              <div className="font-semibold">{nodes.length}</div>
              <div className="text-muted-foreground">Intents</div>
            </div>
            <div className="text-center p-2 bg-secondary rounded">
              <div className="font-semibold">{edges.length}</div>
              <div className="text-muted-foreground">Connections</div>
            </div>
          </div>

          {/* Conversation Paths */}
          {flowAnalysis.paths.map((path, index) => (
            <div key={path.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={path.isComplete ? "default" : "secondary"}
                  className="text-xs"
                >
                  Path {index + 1}
                </Badge>
                {path.hasIssues && (
                  <Badge variant="destructive" className="text-xs">
                    {path.issues.length} Issue{path.issues.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 flex-wrap">
                {path.nodes.map((node, nodeIndex) => (
                  <div key={node.id} className="flex items-center gap-1">
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-xs border",
                      selectedNodeId === node.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-background"
                    )}>
                      <StatusIcon status={getNodeStatus(node)} />
                      <span className="truncate max-w-[60px]">
                        {(node.data as any)?.label || 'Untitled'}
                      </span>
                    </div>
                    {nodeIndex < path.nodes.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>

              {/* Issues */}
              {path.hasIssues && (
                <div className="ml-4 space-y-1">
                  {path.issues.map((issue, issueIndex) => (
                    <div key={issueIndex} className="flex items-center gap-2 text-xs text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Orphan Nodes */}
          {flowAnalysis.orphanNodes.length > 0 && (
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                Disconnected Intents
              </Badge>
              <div className="flex items-center gap-1 flex-wrap">
                {flowAnalysis.orphanNodes.map(node => (
                  <div key={node.id} className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs border border-orange-300 bg-orange-50",
                    selectedNodeId === node.id && "border-primary bg-primary/10"
                  )}>
                    <StatusIcon status={getNodeStatus(node)} />
                    <span className="truncate max-w-[60px]">
                      {(node.data as any)?.label || 'Untitled'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                These intents aren't connected to the conversation flow
              </p>
            </div>
          )}

          {/* Quick Tips */}
          <div className="mt-4 p-2 bg-blue-50 rounded text-xs">
            <div className="font-medium mb-1">💡 Quick Tips:</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Connect intents to create conversation flows</li>
              <li>• Add training phrases and responses to complete intents</li>
              <li>• Test your bot to validate conversation paths</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};