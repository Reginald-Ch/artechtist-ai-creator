-- Phase 1: Add missing columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_seed TEXT,
ADD COLUMN IF NOT EXISTS avatar_color TEXT;

-- Phase 1: Create global_chat_messages table for general chat
CREATE TABLE IF NOT EXISTS public.global_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  reactions JSONB DEFAULT '[]'::jsonb,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on global_chat_messages
ALTER TABLE public.global_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing global chat (all authenticated users)
CREATE POLICY "Anyone can view global chat"
ON public.global_chat_messages
FOR SELECT
TO authenticated
USING (true);

-- Create policy for sending messages to global chat
CREATE POLICY "Authenticated users can send global messages"
ON public.global_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for updating reactions
CREATE POLICY "Users can update reactions"
ON public.global_chat_messages
FOR UPDATE
TO authenticated
USING (true);

-- Enable realtime for global_chat_messages only
ALTER TABLE public.global_chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_chat_messages;