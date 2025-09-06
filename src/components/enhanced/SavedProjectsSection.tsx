import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Bot, Edit3, Clock, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface SavedProject {
  id: string;
  project_name: string;
  project_data: any;
  created_at: string;
  updated_at: string;
}

export const SavedProjectsSection = () => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(6); // Show only latest 6 projects for dashboard

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('saved_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error deleting project",
        description: "Failed to delete the project",
        variant: "destructive"
      });
    }
  };

  const openProject = (project: SavedProject) => {
    const projectData = encodeURIComponent(JSON.stringify(project));
    navigate(`/builder?project=${projectData}`);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Your Saved Projects</h3>
        <div className="flex items-center justify-center p-8 border rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Your Saved Projects</h3>
        <Button 
          onClick={() => navigate('/builder')}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h4 className="text-lg font-medium mb-2">No saved projects yet</h4>
            <p className="text-muted-foreground mb-4">Create your first chatbot to get started!</p>
            <Button 
              onClick={() => navigate('/builder')}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{project.project_name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(project.updated_at))} ago</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => deleteProject(project.id)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {project.project_data?.nodes?.length || 0} intents
                  </Badge>
                  <Button 
                    size="sm" 
                    onClick={() => openProject(project)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {projects.length >= 6 && (
            <Card className="border-dashed border-2 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="text-center py-8">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">View All Projects</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};