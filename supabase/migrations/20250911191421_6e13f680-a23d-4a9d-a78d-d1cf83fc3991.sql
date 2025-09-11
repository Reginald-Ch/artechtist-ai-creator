-- Add proper indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_updated_at ON public.conversations (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_id ON public.conversation_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id_lesson_id ON public.lesson_progress (user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id_created_at ON public.user_analytics (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_projects_user_id_updated_at ON public.saved_projects (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_training_progress_user_id ON public.voice_training_progress (user_id);

-- Add missing columns to profiles table for better user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create proper DELETE policies for user data cleanup
CREATE POLICY IF NOT EXISTS "Users can delete their own conversation messages" 
ON public.conversation_messages 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add better triggers for timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates where missing
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_projects_updated_at ON public.saved_projects;
CREATE TRIGGER update_saved_projects_updated_at
  BEFORE UPDATE ON public.saved_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();