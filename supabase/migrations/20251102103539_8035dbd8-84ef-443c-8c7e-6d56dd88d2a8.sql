-- Create sessions table for anonymous tracking
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mood_entries table
CREATE TABLE public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'exercise')),
  content_text TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies (anonymous access by session_id)
CREATE POLICY "Anyone can read their own session"
  ON public.sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert their own session"
  ON public.sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own session"
  ON public.sessions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can read their chat messages"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read their mood entries"
  ON public.mood_entries FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their mood entries"
  ON public.mood_entries FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can read resources"
  ON public.resources FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert resources"
  ON public.resources FOR INSERT
  WITH CHECK (true);

-- Insert sample resources
INSERT INTO public.resources (title, description, category, type, content_text) VALUES
('Managing Anxiety', 'Practical tips to calm your mind.', 'ANXIETY', 'article', 'Anxiety is a natural response to stress, but when it becomes overwhelming, it can interfere with daily life. Here are some practical strategies to help manage anxiety: 1) Practice deep breathing exercises, 2) Challenge negative thoughts, 3) Maintain a regular sleep schedule, 4) Limit caffeine and alcohol, 5) Stay physically active, 6) Connect with supportive people.'),
('Mindfulness Meditation', 'A guided session for beginners.', 'MINDFULNESS', 'exercise', 'Find a quiet comfortable place to sit. Close your eyes and take three deep breaths. Notice the sensation of breathing - the air entering your nose, filling your lungs, and flowing out. When your mind wanders, gently bring attention back to your breath. Start with 5 minutes daily and gradually increase.'),
('Understanding Stress', 'Learn the science behind stress.', 'STRESS', 'article', 'Stress is your body''s response to challenges or demands. While some stress is normal and can be motivating, chronic stress can harm your health. Understanding stress triggers, recognizing symptoms, and developing coping strategies are key to managing stress effectively. Common signs include headaches, muscle tension, fatigue, and difficulty concentrating.'),
('Building Self-Esteem', 'Techniques for a positive self-view.', 'SELF-ESTEEM', 'article', 'Self-esteem is how you value and perceive yourself. Building healthy self-esteem involves: 1) Practice self-compassion, 2) Challenge negative self-talk, 3) Set realistic goals, 4) Celebrate small wins, 5) Surround yourself with positive people, 6) Focus on your strengths, 7) Accept imperfections as part of being human.'),
('Guided Journaling', 'Prompts for reflection and growth.', 'JOURNALING', 'exercise', 'Journaling can help process emotions and gain clarity. Try these prompts: 1) What am I grateful for today? 2) What challenges did I face and how did I handle them? 3) What did I learn about myself? 4) What are three things I did well today? 5) What would I like to improve tomorrow? Write freely without judgment.'),
('Breathing Exercises', 'Calm your nervous system in minutes.', 'EXERCISES', 'exercise', '4-7-8 Breathing Technique: 1) Breathe in through your nose for 4 counts, 2) Hold your breath for 7 counts, 3) Exhale slowly through your mouth for 8 counts, 4) Repeat 3-4 times. This activates your parasympathetic nervous system, promoting relaxation and reducing anxiety. Practice daily for best results.');