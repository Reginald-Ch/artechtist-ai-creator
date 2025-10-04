import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Calendar, Trash2, ExternalLink, Loader2, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";

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
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchProjects = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
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
      setError(t('errors.somethingWrong'));
      toast({
        title: t('errors.somethingWrong'),
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
    return null;
  }

  return (
    <div>
      {loading ? (
        <LoadingSpinner size="md" text={t('common.loading')} />
      ) : error ? (
        <ErrorState 
          message={error}
          onRetry={fetchProjects}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Bot}
          title={t('dashboard.yourConversationalAgents')}
          description="No saved projects yet. Create and save your first AI bot to see it here!"
          actionLabel={t('dashboard.createNewAgent')}
          onAction={() => window.location.href = '/create-agent'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{project.project_name}</span>
                  <Badge variant="outline" className="ml-2">
                    {project.project_data?.selectedAvatar || '🤖'}
                  </Badge>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.project_data?.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(project.updated_at)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleLoadProject(project)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateProject(project)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProject(project.id)}
                    disabled={deleting === project.id}
                  >
                    {deleting === project.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
