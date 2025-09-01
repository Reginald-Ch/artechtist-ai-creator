import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  MessageSquare, 
  History, 
  Plus, 
  Send,
  Eye,
  Edit3,
  Clock,
  GitBranch
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  nodeId?: string;
  resolved: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  role: 'owner' | 'editor' | 'viewer';
}

interface Version {
  id: string;
  name: string;
  timestamp: Date;
  author: string;
  description: string;
}

interface CollaborationPanelProps {
  selectedNode?: any;
  onAddComment: (comment: string, nodeId?: string) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  selectedNode,
  onAddComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Alice Johnson',
      content: 'This greeting intent could use more casual variations like "what\'s up" or "hey"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      nodeId: 'greet',
      resolved: false
    },
    {
      id: '2',
      author: 'Bob Smith',
      content: 'Consider adding a follow-up intent for when users ask about pricing',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      resolved: false
    }
  ]);

  const [collaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Alice Johnson', avatar: 'AJ', status: 'online', role: 'editor' },
    { id: '2', name: 'Bob Smith', avatar: 'BS', status: 'online', role: 'viewer' },
    { id: '3', name: 'Carol Davis', avatar: 'CD', status: 'offline', role: 'owner' }
  ]);

  const [versions] = useState<Version[]>([
    {
      id: '1',
      name: 'Initial Setup',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      author: 'Carol Davis',
      description: 'Created basic greeting and fallback intents'
    },
    {
      id: '2',
      name: 'Added FAQ Intents',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      author: 'Alice Johnson',
      description: 'Added support for common questions'
    },
    {
      id: '3',
      name: 'Current Version',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      author: 'You',
      description: 'Latest changes'
    }
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment,
      timestamp: new Date(),
      nodeId: selectedNode?.id,
      resolved: false
    };

    setComments(prev => [comment, ...prev]);
    onAddComment(newComment, selectedNode?.id);
    setNewComment('');

    toast({
      title: "Comment Added",
      description: "Your comment has been added to the conversation",
    });
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(c => c.id === commentId ? { ...c, resolved: true } : c)
    );
    
    toast({
      title: "Comment Resolved",
      description: "Comment marked as resolved",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700';
      case 'editor': return 'bg-blue-100 text-blue-700';
      case 'viewer': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Collaborators */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            Team ({collaborators.filter(c => c.status === 'online').length} online)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {collaborators.map(collaborator => (
              <div key={collaborator.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{collaborator.avatar}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{collaborator.name}</span>
                    <Badge variant="outline" className={`text-xs ${getRoleColor(collaborator.role)}`}>
                      {collaborator.role}
                    </Badge>
                  </div>
                </div>
                {collaborator.status === 'online' && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-green-500" />
                    <Edit3 className="h-3 w-3 text-blue-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-primary" />
            Comments & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder={selectedNode ? `Comment on "${selectedNode.data.label}"...` : "Add a general comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <Button 
              size="sm" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="w-full"
            >
              <Send className="h-3 w-3 mr-2" />
              Add Comment
            </Button>
          </div>

          <Separator />

          {/* Comments List */}
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {comments.map(comment => (
                <div 
                  key={comment.id} 
                  className={`p-3 border border-border rounded-lg ${comment.resolved ? 'opacity-60' : ''} animate-slide-in-left`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{comment.author}</span>
                      {comment.nodeId && (
                        <Badge variant="outline" className="text-xs">
                          {comment.nodeId}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                  
                  {!comment.resolved && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resolveComment(comment.id)}
                      className="text-xs"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-primary" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[150px]">
            <div className="space-y-2">
              {versions.map((version, index) => (
                <div 
                  key={version.id} 
                  className="flex items-start gap-3 p-2 hover:bg-muted rounded animate-slide-in-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <GitBranch className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{version.name}</span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{version.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(version.timestamp)} by {version.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};