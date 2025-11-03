/*
  # Create chat_messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (text, for grouping messages by session)
      - `role` (text, either 'user' or 'assistant')
      - `content` (text, message content)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `chat_messages` table
    - Add policy to allow all users to read and write their own session messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on chat_messages"
  ON chat_messages
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
