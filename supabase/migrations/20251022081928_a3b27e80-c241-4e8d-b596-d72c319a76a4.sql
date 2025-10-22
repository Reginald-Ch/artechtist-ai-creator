-- Insert sample challenges for the community
INSERT INTO community_challenges (id, title, description, difficulty, xp_reward, participants, start_date, end_date) VALUES
(gen_random_uuid(), 'Build Your First Chatbot', 'Create a simple AI chatbot using Python and learn about natural language processing', 'beginner', 100, 45, now(), now() + interval '14 days'),
(gen_random_uuid(), 'Scratch Animation Quest', 'Design an interactive animation with at least 3 sprites and custom sounds', 'beginner', 150, 38, now(), now() + interval '10 days'),
(gen_random_uuid(), 'Code Your Game', 'Build a complete game with score tracking and multiple levels', 'intermediate', 250, 29, now(), now() + interval '21 days'),
(gen_random_uuid(), 'Python Data Detective', 'Analyze a dataset and create visualizations using pandas and matplotlib', 'intermediate', 300, 22, now(), now() + interval '14 days'),
(gen_random_uuid(), 'Robot Maze Navigator', 'Program a virtual robot to navigate through a complex maze', 'advanced', 400, 15, now(), now() + interval '30 days'),
(gen_random_uuid(), 'AI Art Generator', 'Create an AI-powered art generator using machine learning', 'advanced', 500, 8, now(), now() + interval '30 days'),
(gen_random_uuid(), 'Team Collaboration Challenge', 'Work with your tribe to build a collaborative project', 'intermediate', 350, 42, now(), now() + interval '20 days'),
(gen_random_uuid(), 'Speed Coding Sprint', 'Solve coding puzzles as fast as you can! Weekly leaderboard.', 'beginner', 200, 67, now(), now() + interval '7 days')
ON CONFLICT (id) DO NOTHING;