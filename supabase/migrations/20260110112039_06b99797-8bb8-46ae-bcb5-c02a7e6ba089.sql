-- Create chat_protocols table for Gemini Agent conversation logs
CREATE TABLE public.chat_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  full_transcript TEXT NOT NULL,
  summary TEXT
);

-- Enable Row Level Security
ALTER TABLE public.chat_protocols ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for admin dashboard)
CREATE POLICY "Allow public read access to chat_protocols" 
ON public.chat_protocols 
FOR SELECT 
USING (true);

-- Create policy for public insert (for webhook/API access)
CREATE POLICY "Allow public insert to chat_protocols" 
ON public.chat_protocols 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster session lookups
CREATE INDEX idx_chat_protocols_session_id ON public.chat_protocols(session_id);
CREATE INDEX idx_chat_protocols_created_at ON public.chat_protocols(created_at DESC);