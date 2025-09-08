-- Fix security vulnerability: Restrict treasure_codes table access
DROP POLICY IF EXISTS "Treasure codes are publicly readable" ON public.treasure_codes;
DROP POLICY IF EXISTS "Anyone can view active treasure codes for validation" ON public.treasure_codes;

-- Create restrictive policy for treasure codes - only allow system access for validation
CREATE POLICY "System can validate treasure codes"
ON public.treasure_codes
FOR SELECT
USING (auth.role() = 'service_role');

-- Fix rate_limiting table exposure  
DROP POLICY IF EXISTS "Rate limiting is publicly readable" ON public.rate_limiting;
DROP POLICY IF EXISTS "Rate limiting is system managed" ON public.rate_limiting;

-- Create system-only policy for rate limiting
CREATE POLICY "System can manage rate limiting"
ON public.rate_limiting
FOR ALL
USING (auth.role() = 'service_role');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_treasure_codes_code ON public.treasure_codes(code);
CREATE INDEX IF NOT EXISTS idx_treasure_codes_is_used ON public.treasure_codes(usage_count);