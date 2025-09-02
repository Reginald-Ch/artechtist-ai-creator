-- Fix Supabase authentication settings and add necessary configurations

-- Enable password leak protection (this would be done in Supabase dashboard)
-- We'll create a function to help with auth state management

-- Create a function to handle auth state changes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a table for storing user voice training progress
CREATE TABLE IF NOT EXISTS public.voice_training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'en',
  accuracy_score INTEGER DEFAULT 0,
  completed_phrases INTEGER DEFAULT 0,
  total_phrases INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for voice training progress
ALTER TABLE public.voice_training_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for voice training progress
CREATE POLICY "Users can view their own voice training progress"
ON public.voice_training_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice training progress"
ON public.voice_training_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice training progress"
ON public.voice_training_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on voice training progress
CREATE TRIGGER update_voice_training_progress_updated_at
BEFORE UPDATE ON public.voice_training_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_voice_training_progress_user_id ON public.voice_training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_training_progress_exercise ON public.voice_training_progress(user_id, exercise_id);