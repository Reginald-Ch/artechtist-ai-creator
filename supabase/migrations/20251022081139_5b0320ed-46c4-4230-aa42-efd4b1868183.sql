-- First, drop the existing enum type constraint if it exists and recreate with new values
DO $$ 
BEGIN
    -- Drop the constraint if it exists
    ALTER TABLE tribes DROP CONSTRAINT IF EXISTS tribes_tribe_type_check;
EXCEPTION
    WHEN undefined_column THEN NULL;
END $$;

-- Update the tribe_type to use text instead of enum
ALTER TABLE tribes ALTER COLUMN tribe_type TYPE text;

-- Update existing tribes or delete and recreate
DELETE FROM tribes;

-- Insert new tech tribes
INSERT INTO tribes (id, name, tribe_type, description, emoji, color, member_count) VALUES
(gen_random_uuid(), 'AI Explorers', 'ai_explorers', 'Dive into artificial intelligence and smart bots', '🤖', 'from-blue-500 to-cyan-500', 0),
(gen_random_uuid(), 'Scratch Stars', 'scratch_stars', 'Create games and animations with Scratch', '⭐', 'from-purple-500 to-pink-500', 0),
(gen_random_uuid(), 'Code Wizards', 'code_wizards', 'Explore general coding and tech magic', '🧙‍♂️', 'from-green-500 to-emerald-500', 0),
(gen_random_uuid(), 'Python Pals', 'python_pals', 'Learn Python and build real projects', '🐍', 'from-yellow-500 to-orange-500', 0),
(gen_random_uuid(), 'Robotics Ridges', 'robotics_ridges', 'Tinker with machines and robotics builds', '🦾', 'from-red-500 to-rose-500', 0);