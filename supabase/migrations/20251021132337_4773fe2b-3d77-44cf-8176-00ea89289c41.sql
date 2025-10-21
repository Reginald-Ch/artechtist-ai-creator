-- Create enum for tribe types
CREATE TYPE public.tech_tribe AS ENUM (
  'pythonpals',
  'aiexplorers', 
  'techwizards',
  'roboticsridge',
  'scratchstars'
);

-- Create tribes table
CREATE TABLE public.tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tribe_type tech_tribe NOT NULL UNIQUE,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tribe memberships table
CREATE TABLE public.tribe_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  UNIQUE(user_id, tribe_id)
);

-- Create tribe chat messages table
CREATE TABLE public.tribe_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  reactions JSONB DEFAULT '[]'::jsonb,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community challenges table
CREATE TABLE public.community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE CASCADE,
  xp_reward INTEGER DEFAULT 100,
  difficulty TEXT DEFAULT 'beginner',
  participants INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user projects table
CREATE TABLE public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_data JSONB DEFAULT '{}'::jsonb,
  likes INTEGER DEFAULT 0,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tribes (everyone can view)
CREATE POLICY "Anyone can view tribes"
  ON public.tribes FOR SELECT
  USING (true);

-- RLS Policies for tribe_memberships
CREATE POLICY "Users can view tribe memberships"
  ON public.tribe_memberships FOR SELECT
  USING (true);

CREATE POLICY "Users can join tribes"
  ON public.tribe_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership"
  ON public.tribe_memberships FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for tribe_chat_messages
CREATE POLICY "Members can view tribe chat"
  ON public.tribe_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_memberships
      WHERE user_id = auth.uid() 
      AND tribe_id = tribe_chat_messages.tribe_id
    )
  );

CREATE POLICY "Members can send messages"
  ON public.tribe_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.tribe_memberships
      WHERE user_id = auth.uid() 
      AND tribe_id = tribe_chat_messages.tribe_id
    )
  );

-- RLS Policies for challenges
CREATE POLICY "Anyone can view challenges"
  ON public.community_challenges FOR SELECT
  USING (true);

-- RLS Policies for user_projects
CREATE POLICY "Anyone can view projects"
  ON public.user_projects FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own projects"
  ON public.user_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.user_projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert default tribes
INSERT INTO public.tribes (name, tribe_type, description, emoji, color) VALUES
  ('PythonPals', 'pythonpals', 'Learn Python and share beginner-friendly projects', '🐍', 'from-blue-500 to-green-400'),
  ('AI Explorers', 'aiexplorers', 'Build smart bots and explore artificial intelligence', '🤖', 'from-purple-500 to-pink-400'),
  ('Tech Wizards', 'techwizards', 'Tinker with futuristic gadgets and ideas', '🧙‍♂️', 'from-yellow-500 to-orange-400'),
  ('Robotics Ridge', 'roboticsridge', 'Share and build robotics creations', '🛠️', 'from-red-500 to-purple-500'),
  ('Scratch Stars', 'scratchstars', 'Create games and animations with Scratch', '🐱', 'from-pink-500 to-yellow-400');

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE tribe_chat_messages;