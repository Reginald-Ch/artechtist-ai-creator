import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, Share2, Eye, Edit, Crown, UserPlus, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'away' | 'offline';
  cursor?: { x: number; y: number };
  activeNode?: string;
}

interface RealTimeCollaborationProps {
  botId: string;
  currentUser: CollaborationUser;
  onInviteUser: (email: string, role: string) => void;
  onRoleChange: (userId: string, newRole: string) => void;
}

export const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  botId,
  currentUser,
  onInviteUser,
  onRoleChange
}) => {
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [showCursors, setShowCursors] = useState(true);

  useEffect(() => {
    // Simulate collaborative users
    setCollaborators([
      {
        id: '1',
        name: 'Amara Kone',
        email: 'amara@example.com',
        role: 'editor',
        status: 'online',
        cursor: { x: 100, y: 200 },
        activeNode: 'greet'
      },
      {
        id: '2',
        name: 'Kwame Asante',
        email: 'kwame@example.com',
        role: 'viewer',
        status: 'away',
      },
      {
        id: '3',
        name: 'Fatima Hassan',
        email: 'fatima@example.com',
        role: 'editor',
        status: 'online',
        activeNode: 'help'
      }
    ]);

    // Simulate recent activities
    setRecentActivities([
      {
        id: '1',
        user: 'Amara Kone',
        action: 'edited intent "Greeting"',
        timestamp: '2 minutes ago',
        type: 'edit'
      },
      {
        id: '2',
        user: 'Fatima Hassan',
        action: 'added new response to "Help"',
        timestamp: '5 minutes ago',
        type: 'add'
      },
      {
        id: '3',
        user: 'Kwame Asante',
        action: 'viewed bot analytics',
        timestamp: '10 minutes ago',
        type: 'view'
      }
    ]);
  }, []);

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    
    setIsInviting(true);
    
    // Simulate API call
    setTimeout(() => {
      onInviteUser(inviteEmail, inviteRole);
      setInviteEmail('');
      setIsInviting(false);
      
      // Add new user to collaborators list
      const newUser: CollaborationUser = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole as any,
        status: 'offline'
      };
      
      setCollaborators(prev => [...prev, newUser]);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'editor': return Edit;
      case 'viewer': return Eye;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600';
      case 'editor': return 'text-blue-600';
      case 'viewer': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit': return Edit;
      case 'add': return UserPlus;
      case 'view': return Eye;
      default: return MessageSquare;
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Collaborators */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Active Collaborators ({collaborators.filter(c => c.status === 'online').length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {collaborators.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        <RoleIcon className={`h-3 w-3 ${getRoleColor(user.role)}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        {user.activeNode && (
                          <Badge variant="outline" className="text-xs">
                            Editing: {user.activeNode}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={user.status === 'online' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {user.status}
                    </Badge>
                    {currentUser.role === 'owner' && user.id !== currentUser.id && (
                      <select
                        value={user.role}
                        onChange={(e) => onRoleChange(user.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-background"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invite Collaborators */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Collaborators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="border rounded px-3 py-2 bg-background"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <Button
              onClick={handleInviteUser}
              disabled={!inviteEmail || isInviting}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {isInviting ? 'Inviting...' : 'Invite'}
            </Button>
          </div>
          
          <Alert>
            <Share2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Roles:</strong> Viewers can see the bot and test it. Editors can modify intents, responses, and flows. Owners have full control.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </span>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Settings */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Collaboration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Show Live Cursors</span>
              <p className="text-sm text-muted-foreground">See where others are working in real-time</p>
            </div>
            <Button
              variant={showCursors ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCursors(!showCursors)}
            >
              {showCursors ? 'On' : 'Off'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Auto-save Changes</span>
              <p className="text-sm text-muted-foreground">Automatically save edits every 30 seconds</p>
            </div>
            <Button variant="default" size="sm" disabled>
              Enabled
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Conflict Resolution</span>
              <p className="text-sm text-muted-foreground">How to handle simultaneous edits</p>
            </div>
            <select className="border rounded px-3 py-1 bg-background">
              <option>Last edit wins</option>
              <option>Show conflict dialog</option>
              <option>Auto-merge changes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Share Link */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={`https://artechtist.ai/bot/${botId}`}
              readOnly
              className="flex-1"
            />
            <Button
              onClick={() => navigator.clipboard.writeText(`https://artechtist.ai/bot/${botId}`)}
              variant="outline"
            >
              Copy
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Export Bot
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Public View
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};