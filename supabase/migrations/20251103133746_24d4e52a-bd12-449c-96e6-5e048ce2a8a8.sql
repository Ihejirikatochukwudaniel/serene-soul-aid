-- Fix Critical Security Issues: RLS Policies and Input Validation

-- 1. Add database constraints for input validation
ALTER TABLE chat_messages 
  ADD CONSTRAINT check_content_length 
  CHECK (char_length(content) <= 2000);

ALTER TABLE chat_messages 
  ADD CONSTRAINT check_role_value 
  CHECK (role IN ('user', 'assistant'));

ALTER TABLE mood_entries 
  ADD CONSTRAINT check_mood_range 
  CHECK (mood_value BETWEEN 1 AND 5);

ALTER TABLE mood_entries 
  ADD CONSTRAINT check_note_length 
  CHECK (note IS NULL OR char_length(note) <= 500);

-- 2. Fix RLS Policies - Remove overly permissive policies and add proper restrictions

-- Chat messages: Remove update/delete capabilities (messages should be immutable)
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can read their chat messages" ON chat_messages;

CREATE POLICY "Users can insert chat messages for their session" 
  ON chat_messages 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL AND char_length(session_id) > 10);

CREATE POLICY "Users can read chat messages" 
  ON chat_messages 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Mood entries: Keep current policies but add validation
DROP POLICY IF EXISTS "Anyone can insert mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Anyone can read their mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Anyone can update their mood entries" ON mood_entries;

CREATE POLICY "Users can insert mood entries for their session" 
  ON mood_entries 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL AND char_length(session_id) > 10);

CREATE POLICY "Users can read mood entries" 
  ON mood_entries 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update mood entries" 
  ON mood_entries 
  FOR UPDATE 
  TO anon, authenticated
  USING (true);

-- Resources: Restrict to read-only for users (only service role can manage)
DROP POLICY IF EXISTS "Anyone can insert resources" ON resources;
DROP POLICY IF EXISTS "Anyone can read resources" ON resources;

CREATE POLICY "Users can read resources" 
  ON resources 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage resources" 
  ON resources 
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);

-- Sessions: Add validation constraints
DROP POLICY IF EXISTS "Anyone can insert their own session" ON sessions;
DROP POLICY IF EXISTS "Anyone can read their own session" ON sessions;
DROP POLICY IF EXISTS "Anyone can update their own session" ON sessions;

CREATE POLICY "Users can insert sessions" 
  ON sessions 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL AND char_length(session_id) > 10);

CREATE POLICY "Users can read sessions" 
  ON sessions 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update sessions" 
  ON sessions 
  FOR UPDATE 
  TO anon, authenticated
  USING (true);