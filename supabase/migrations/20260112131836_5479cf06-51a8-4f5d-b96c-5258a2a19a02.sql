-- Tighten chat_protocols security: associate rows with authenticated user
ALTER TABLE public.chat_protocols
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Drop overly permissive public policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='chat_protocols' AND policyname='Allow public insert to chat_protocols'
  ) THEN
    DROP POLICY "Allow public insert to chat_protocols" ON public.chat_protocols;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='chat_protocols' AND policyname='Allow public read access to chat_protocols'
  ) THEN
    DROP POLICY "Allow public read access to chat_protocols" ON public.chat_protocols;
  END IF;
END $$;

-- Create least-privilege policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='chat_protocols' AND policyname='Users can read their own chat protocols'
  ) THEN
    CREATE POLICY "Users can read their own chat protocols"
    ON public.chat_protocols
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='chat_protocols' AND policyname='Users can insert their own chat protocols'
  ) THEN
    CREATE POLICY "Users can insert their own chat protocols"
    ON public.chat_protocols
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS chat_protocols_user_id_idx ON public.chat_protocols(user_id);