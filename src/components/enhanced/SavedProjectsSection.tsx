import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Folder, Calendar, Trash2, ExternalLink, Loader2, Copy, Star, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedProject {
  id: string;
  project_name: string;
  project_data: {
    name: string;
    description: string;
    nodes: any[];
    edges: any[];
    voiceSettings: any;
    selectedAvatar: string;
    createdAt: string;
    updatedAt: string;
  };
  created_at: string;
  updated_at: string;
}

interface SavedProjectsSectionProps {
  onLoadProject: (project: SavedProject) => void;
}

export const SavedProjectsSection: React.FC<SavedProjectsSectionProps> = ({
  onLoadProject
}) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []) as unknown as SavedProject[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error loading projects",
        description: "Failed to load your saved projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;

    setDeleting(projectId);
    try {
      const { error } = await supabase
        .from('saved_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast({
        title: "Project deleted",
        description: "Project has been removed from your dashboard"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error deleting project",
        description: "Failed to delete the project",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleLoadProject = (project: SavedProject) => {
    onLoadProject(project);
    // Navigate to bot builder with loaded project
    window.location.href = '/builder';
    toast({
      title: "Project loaded",
      description: `"${project.project_name}" has been loaded into the builder`
    });
  };

  const duplicateProject = async (project: SavedProject) => {
    if (!user) return;

    try {
      const duplicatedData = {
        ...project.project_data,
        name: `${project.project_name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('saved_projects')
        .insert({
          user_id: user.id,
          project_name: `${project.project_name} (Copy)`,
          project_data: duplicatedData
        });

      if (error) throw error;

      await fetchProjects();
      toast({
        title: "Project duplicated",
        description: "A copy of the project has been created"
      });
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast({
        title: "Error duplicating project",
        description: "Failed to create a copy of the project",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  if (!user) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Folder className="h-4 w-4 mr-1" />
        My Projects
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={fetchProjects}>
          <Folder className="h-4 w-4 mr-1" />
          My Projects
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            My Saved Projects
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved projects yet</p>
              <p className="text-sm mt-2">Create and save your first AI bot to see it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-xl">
                            {project.project_data.selectedAvatar || '🤖'}
                          </span>
                          {project.project_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {project.project_data.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateProject(project)}
                          className="text-muted-foreground hover:text-primary"
                          title="Duplicate project"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                          disabled={deleting === project.id}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          {deleting === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.updated_at)}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {project.project_data.nodes?.length || 0} intents
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadProject(project)}
                        className="flex-1"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Load Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SavedProjectsSection;