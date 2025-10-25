-- Add columns for message pinning and threading
ALTER TABLE public.global_chat_messages 
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.global_chat_messages(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_global_chat_messages_parent_id ON public.global_chat_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_global_chat_messages_is_pinned ON public.global_chat_messages(is_pinned) WHERE is_pinned = true;