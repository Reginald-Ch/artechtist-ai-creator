-- Add DELETE policies for user data cleanup
CREATE POLICY "Users can delete their own conversation messages" 
ON public.conversation_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add DELETE policy for conversations
CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for better performance on conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_updated_at 
ON public.conversations(user_id, updated_at DESC);

-- Add index for better performance on conversation messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id_created_at 
ON public.conversation_messages(conversation_id, created_at);

-- Add index for better performance on lesson progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id_updated_at 
ON public.lesson_progress(user_id, updated_at DESC);

-- Add index for user analytics performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id_created_at 
ON public.user_analytics(user_id, created_at DESC);

-- Add index for saved projects performance
CREATE INDEX IF NOT EXISTS idx_saved_projects_user_id_updated_at 
ON public.saved_projects(user_id, updated_at DESC);