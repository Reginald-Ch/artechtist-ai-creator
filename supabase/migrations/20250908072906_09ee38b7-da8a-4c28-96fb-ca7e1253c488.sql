-- Fix security vulnerability: Restrict treasure_codes table access
DROP POLICY IF EXISTS "Treasure codes are publicly readable" ON public.treasure_codes;

-- Create restrictive policy for treasure codes - only allow system access for validation
CREATE POLICY "System can validate treasure codes"
ON public.treasure_codes
FOR SELECT
USING (auth.role() = 'service_role');

-- Create policy for authenticated users to view their own codes (if they created them)
CREATE POLICY "Users can view their created codes"
ON public.treasure_codes
FOR SELECT
USING (auth.uid() = created_by);

-- Fix rate_limiting table exposure
DROP POLICY IF EXISTS "Rate limiting is publicly readable" ON public.rate_limiting;

-- Create system-only policy for rate limiting
CREATE POLICY "System can manage rate limiting"
ON public.rate_limiting
FOR ALL
USING (auth.role() = 'service_role');

-- Add index for better performance on treasure code validation
CREATE INDEX IF NOT EXISTS idx_treasure_codes_code ON public.treasure_codes(code);
CREATE INDEX IF NOT EXISTS idx_treasure_codes_is_used ON public.treasure_codes(is_used);