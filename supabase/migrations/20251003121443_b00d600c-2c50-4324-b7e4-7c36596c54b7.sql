-- Add unique constraint for lesson progress
ALTER TABLE public.lesson_progress
ADD CONSTRAINT lesson_progress_user_lesson_unique 
UNIQUE (user_id, lesson_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson 
ON public.lesson_progress(user_id, lesson_id);