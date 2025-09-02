-- Fix security warnings from the linter

-- 1. Fix function search path for security
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Note: Password leak protection needs to be enabled in Supabase Dashboard
-- This cannot be fixed via SQL migration - it's a dashboard setting
-- The user will need to enable it manually in Auth Settings