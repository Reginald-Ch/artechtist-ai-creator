import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectFeedProps {
  tribeId: string;
}

export function ProjectFeed({ tribeId }: ProjectFeedProps) {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, [tribeId]);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('user_projects')
      .select('*, profiles(first_name)')
      .eq('tribe_id', tribeId)
      .order('created_at', { ascending: false })
      .limit(10);

    setProjects(data || []);
  };

  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {project.profiles?.first_name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {project.profiles?.first_name || 'Anonymous'} •{' '}
                    {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{project.description}</p>
              
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  {project.likes}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {project.comments?.length || 0}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
