-- Create conversations table for Google Assistant integration
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id TEXT NOT NULL,
    title TEXT,
    language_code TEXT DEFAULT 'en',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    total_messages INTEGER DEFAULT 0,
    average_confidence FLOAT DEFAULT 0.0
);

-- Create conversation_messages table
CREATE TABLE public.conversation_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    intent_matched TEXT,
    confidence_score FLOAT,
    language_detected TEXT,
    voice_enabled BOOLEAN DEFAULT false,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user_analytics table for tracking engagement
CREATE TABLE public.user_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    session_id TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed BOOLEAN DEFAULT false
);

-- Create bot_performance_metrics table
CREATE TABLE public.bot_performance_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('intent_accuracy', 'response_time', 'user_satisfaction', 'conversation_length')),
    metric_value FLOAT NOT NULL,
    session_id TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create rate_limiting table for security
CREATE TABLE public.rate_limiting (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    ip_address INET,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limiting ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for conversation_messages
CREATE POLICY "Users can view their own conversation messages" 
ON public.conversation_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation messages" 
ON public.conversation_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation messages" 
ON public.conversation_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for user_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" 
ON public.user_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for bot_performance_metrics
CREATE POLICY "Users can view their own bot metrics" 
ON public.bot_performance_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot metrics" 
ON public.bot_performance_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for rate_limiting (more permissive for system use)
CREATE POLICY "Rate limiting is system managed" 
ON public.rate_limiting 
FOR ALL
USING (true);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_user_id ON public.conversation_messages(user_id);
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX idx_bot_performance_metrics_bot_id ON public.bot_performance_metrics(bot_id);
CREATE INDEX idx_bot_performance_metrics_user_id ON public.bot_performance_metrics(user_id);
CREATE INDEX idx_rate_limiting_user_id ON public.rate_limiting(user_id);
CREATE INDEX idx_rate_limiting_ip_address ON public.rate_limiting(ip_address);
CREATE INDEX idx_rate_limiting_endpoint ON public.rate_limiting(endpoint);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_conversations_updated_at();

-- Create function to update conversation stats
CREATE OR REPLACE FUNCTION public.update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message count and average confidence
  UPDATE public.conversations 
  SET 
    total_messages = (
      SELECT COUNT(*) 
      FROM public.conversation_messages 
      WHERE conversation_id = NEW.conversation_id
    ),
    average_confidence = (
      SELECT AVG(confidence_score) 
      FROM public.conversation_messages 
      WHERE conversation_id = NEW.conversation_id 
      AND confidence_score IS NOT NULL
    ),
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to update stats when messages are added
CREATE TRIGGER update_conversation_stats_on_message
AFTER INSERT ON public.conversation_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_stats();