-- Create treasure code batches table
CREATE TABLE public.treasure_code_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  batch_name TEXT NOT NULL,
  description TEXT,
  total_codes INTEGER NOT NULL DEFAULT 0,
  issued_by UUID REFERENCES auth.users(id),
  expire_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create treasure codes table
CREATE TABLE public.treasure_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  code TEXT NOT NULL UNIQUE,
  batch_id UUID NOT NULL REFERENCES public.treasure_code_batches(id) ON DELETE CASCADE,
  expire_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users(id),
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage INTEGER NOT NULL DEFAULT 1
);

-- Enable Row Level Security
ALTER TABLE public.treasure_code_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasure_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for treasure_code_batches
CREATE POLICY "Anyone can view active treasure code batches" 
ON public.treasure_code_batches 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create treasure code batches" 
ON public.treasure_code_batches 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Batch creators can update their batches" 
ON public.treasure_code_batches 
FOR UPDATE 
USING (auth.uid() = issued_by);

-- Create RLS policies for treasure_codes
CREATE POLICY "Anyone can view active treasure codes for validation" 
ON public.treasure_codes 
FOR SELECT 
USING (is_active = true AND expire_at > now());

CREATE POLICY "System can update treasure code usage" 
ON public.treasure_codes 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_treasure_codes_code ON public.treasure_codes(code);
CREATE INDEX idx_treasure_codes_active ON public.treasure_codes(is_active);
CREATE INDEX idx_treasure_codes_expire ON public.treasure_codes(expire_at);
CREATE INDEX idx_treasure_code_batches_active ON public.treasure_code_batches(is_active);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_treasure_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_treasure_code_batches_updated_at
  BEFORE UPDATE ON public.treasure_code_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_treasure_updated_at_column();

CREATE TRIGGER update_treasure_codes_updated_at
  BEFORE UPDATE ON public.treasure_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_treasure_updated_at_column();

-- Insert initial treasure code batch
INSERT INTO public.treasure_code_batches (batch_name, description, total_codes, expire_at, is_active)
VALUES ('Initial Gift Codes', 'First batch of treasure codes for app access', 1, now() + interval '30 days', true);

-- Insert the treasure code "5431"
INSERT INTO public.treasure_codes (code, batch_id, expire_at, is_active, max_usage)
VALUES ('5431', (SELECT id FROM public.treasure_code_batches WHERE batch_name = 'Initial Gift Codes'), now() + interval '30 days', true, 100);