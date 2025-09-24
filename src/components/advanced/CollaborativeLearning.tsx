import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Share2, 
  Heart, 
  BookOpen, 
  Trophy, 
  Star,
  Send,
  Plus,
  UserPlus,
  Globe,
  Clock,
  ThumbsUp,
  Eye,
  Code,
  Lightbulb,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface StudyBuddy {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: 'online' | 'offline' | 'learning';
  currentLesson?: string;
  strengths: string[];
  lastSeen: Date;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: StudyBuddy[];
  creator: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  createdAt: Date;
  activityCount: number;
}

interface SharedProject {
  id: string;
  title: string;
  description: string;
  creator: StudyBuddy;
  collaborators: StudyBuddy[];
  type: 'quiz' | 'lesson' | 'project' | 'code';
  tags: string[];
  likes: number;
  views: number;
  createdAt: Date;
  isLiked: boolean;
}

interface Message {
  id: string;
  sender: StudyBuddy;
  content: string;
  type: 'text' | 'image' | 'code' | 'lesson-share';
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

interface CollaborativeLearningProps {
  currentUser: StudyBuddy;
  onJoinStudySession: (groupId: string) => void;
  onStartCollaboration: (projectId: string) => void;
}

export const CollaborativeLearning: React.FC<CollaborativeLearningProps> = ({
  currentUser,
  onJoinStudySession,
  onStartCollaboration
}) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  // Mock data initialization
  useEffect(() => {
    const mockStudyBuddy1: StudyBuddy = {
      id: '1',
      name: 'Sarah Chen',
      avatar: '👩‍💻',
      level: 15,
      status: 'online',
      currentLesson: 'Neural Networks Basics',
      strengths: ['Machine Learning', 'Python'],
      lastSeen: new Date()
    };

    const mockStudyBuddy2: StudyBuddy = {
      id: '2',
      name: 'Alex Rodriguez',
      avatar: '🧑‍🎓',
      level: 12,
      status: 'learning',
      currentLesson: 'AI Ethics',
      strengths: ['Ethics', 'Philosophy'],
      lastSeen: new Date(Date.now() - 300000)
    };

    const mockStudyBuddy3: StudyBuddy = {
      id: '3',
      name: 'Jamie Kim',
      avatar: '👨‍🔬',
      level: 20,
      status: 'offline',
      strengths: ['Data Science', 'Statistics'],
      lastSeen: new Date(Date.now() - 3600000)
    };

    const mockGroups: StudyGroup[] = [
      {
        id: '1',
        name: 'AI Beginners Circle',
        description: 'Perfect for those just starting their AI journey!',
        members: [mockStudyBuddy1, mockStudyBuddy2, currentUser],
        creator: mockStudyBuddy1.id,
        topic: 'AI Fundamentals',
        difficulty: 'beginner',
        isPublic: true,
        createdAt: new Date(Date.now() - 86400000),
        activityCount: 24
      },
      {
        id: '2',
        name: 'Neural Network Explorers',
        description: 'Deep dive into neural networks and deep learning',
        members: [mockStudyBuddy2, mockStudyBuddy3, currentUser],
        creator: mockStudyBuddy3.id,
        topic: 'Deep Learning',
        difficulty: 'intermediate',
        isPublic: true,
        createdAt: new Date(Date.now() - 172800000),
        activityCount: 45
      },
      {
        id: '3',
        name: 'AI Ethics Discussion',
        description: 'Exploring the ethical implications of AI development',
        members: [mockStudyBuddy1, mockStudyBuddy2],
        creator: mockStudyBuddy2.id,
        topic: 'AI Ethics',
        difficulty: 'advanced',
        isPublic: false,
        createdAt: new Date(Date.now() - 259200000),
        activityCount: 12
      }
    ];

    const mockProjects: SharedProject[] = [
      {
        id: '1',
        title: 'Interactive AI Quiz Builder',
        description: 'A collaborative tool for creating AI quizzes with multiple choice, coding, and visual questions.',
        creator: mockStudyBuddy1,
        collaborators: [mockStudyBuddy2, currentUser],
        type: 'project',
        tags: ['React', 'Quiz', 'Educational'],
        likes: 15,
        views: 42,
        createdAt: new Date(Date.now() - 86400000),
        isLiked: false
      },
      {
        id: '2',
        title: 'Neural Network Visualizer',
        description: 'Visual tool to understand how neural networks process data step by step.',
        creator: mockStudyBuddy3,
        collaborators: [mockStudyBuddy1],
        type: 'code',
        tags: ['Visualization', 'Neural Networks', 'D3.js'],
        likes: 28,
        views: 89,
        createdAt: new Date(Date.now() - 172800000),
        isLiked: true
      },
      {
        id: '3',
        title: 'AI Ethics Case Studies',
        description: 'Collection of real-world AI ethics scenarios for discussion and learning.',
        creator: mockStudyBuddy2,
        collaborators: [mockStudyBuddy3],
        type: 'lesson',
        tags: ['Ethics', 'Case Study', 'Discussion'],
        likes: 12,
        views: 35,
        createdAt: new Date(Date.now() - 259200000),
        isLiked: false
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        sender: mockStudyBuddy1,
        content: 'Hey everyone! Just finished the neural networks lesson. The backpropagation explanation was amazing! 🧠',
        type: 'text',
        timestamp: new Date(Date.now() - 1800000),
        likes: 5,
        isLiked: true
      },
      {
        id: '2',
        sender: mockStudyBuddy2,
        content: 'Agreed! I\'m working on implementing a simple neural network in Python. Anyone want to collaborate?',
        type: 'text',
        timestamp: new Date(Date.now() - 1200000),
        likes: 3,
        isLiked: false
      },
      {
        id: '3',
        sender: mockStudyBuddy3,
        content: 'I\'d love to help! I have experience with TensorFlow. Let\'s create a study project together!',
        type: 'text',
        timestamp: new Date(Date.now() - 600000),
        likes: 4,
        isLiked: false
      }
    ];

    setStudyGroups(mockGroups);
    setSharedProjects(mockProjects);
    setMessages(mockMessages);
  }, [currentUser]);

  const createStudyGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDescription,
      members: [currentUser],
      creator: currentUser.id,
      topic: 'General',
      difficulty: 'beginner',
      isPublic: true,
      createdAt: new Date(),
      activityCount: 0
    };

    setStudyGroups(prev => [newGroup, ...prev]);
    setNewGroupName('');
    setNewGroupDescription('');
    setIsCreatingGroup(false);
    toast.success('Study group created successfully!');
  };

  const joinGroup = (group: StudyGroup) => {
    if (group.members.some(member => member.id === currentUser.id)) {
      setSelectedGroup(group);
      onJoinStudySession(group.id);
      toast.success(`Joined ${group.name}!`);
    } else {
      const updatedGroup = {
        ...group,
        members: [...group.members, currentUser]
      };
      setStudyGroups(prev => prev.map(g => g.id === group.id ? updatedGroup : g));
      toast.success(`Joined ${group.name}!`);
    }
  };

  const likeProject = (projectId: string) => {
    setSharedProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            likes: project.isLiked ? project.likes - 1 : project.likes + 1,
            isLiked: !project.isLiked 
          }
        : project
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      likes: 0,
      isLiked: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const likeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId
        ? {
            ...msg,
            likes: msg.isLiked ? msg.likes - 1 : msg.likes + 1,
            isLiked: !msg.isLiked
          }
        : msg
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'learning': return 'bg-blue-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          Collaborative Learning
        </h1>
        <p className="text-muted-foreground">
          Learn together, share knowledge, and build amazing AI projects with fellow learners!
        </p>
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Code className="h-4 w-4 mr-2" />
            Shared Projects
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Group Chat
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          {/* Create Group Section */}
          <Card className="comic-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Study Groups</CardTitle>
                <Button onClick={() => setIsCreatingGroup(!isCreatingGroup)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </CardHeader>
            {isCreatingGroup && (
              <CardContent className="space-y-4">
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={createStudyGroup}>Create</Button>
                  <Button variant="outline" onClick={() => setIsCreatingGroup(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Groups Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studyGroups.map((group) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="comic-card h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {group.isPublic ? (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(group.difficulty)}>
                        {group.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {group.topic}
                      </Badge>
                    </div>

                    {/* Members */}
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Members ({group.members.length})
                      </div>
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 5).map((member) => (
                          <div key={member.id} className="relative">
                            <Avatar className="h-8 w-8 border-2 border-background">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-xs">
                                {member.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div 
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                            />
                          </div>
                        ))}
                        {group.members.length > 5 && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-xs">
                            +{group.members.length - 5}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {group.activityCount} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(group.createdAt)}
                      </span>
                    </div>

                    <Button 
                      onClick={() => joinGroup(group)}
                      className="w-full"
                      variant={group.members.some(m => m.id === currentUser.id) ? "outline" : "default"}
                    >
                      {group.members.some(m => m.id === currentUser.id) ? (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Chat
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Group
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {sharedProjects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="comic-card h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {project.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Creator and Collaborators */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {project.creator.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{project.creator.name}</span>
                      {project.collaborators.length > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">+</span>
                          <div className="flex -space-x-1">
                            {project.collaborators.slice(0, 3).map((collab) => (
                              <Avatar key={collab.id} className="h-5 w-5 border border-background">
                                <AvatarFallback className="text-xs">
                                  {collab.avatar}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className={`h-3 w-3 ${project.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          {project.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {project.views}
                        </span>
                      </div>
                      <span>{formatTimeAgo(project.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => likeProject(project.id)}
                        className="flex-1"
                      >
                        <Heart className={`h-4 w-4 mr-1 ${project.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        Like
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onStartCollaboration(project.id)}
                        className="flex-1"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Collaborate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card className="comic-card h-96">
            <CardHeader>
              <CardTitle>Group Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {message.sender.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{message.sender.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeMessage(message.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <ThumbsUp className={`h-3 w-3 mr-1 ${message.isLiked ? 'fill-blue-500 text-blue-500' : ''}`} />
                            {message.likes}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Weekly Collaboration Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { ...currentUser, points: 245, change: '+12' },
                  { id: '1', name: 'Sarah Chen', avatar: '👩‍💻', level: 15, points: 230, change: '+8' },
                  { id: '3', name: 'Jamie Kim', avatar: '👨‍🔬', level: 20, points: 215, change: '-5' },
                  { id: '2', name: 'Alex Rodriguez', avatar: '🧑‍🎓', level: 12, points: 200, change: '+15' },
                ].map((user, index) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      user.id === currentUser.id ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-500 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">Level {user.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{user.points} pts</div>
                      <div className={`text-xs ${
                        user.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborativeLearning;