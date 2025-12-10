-- Fix All Database Issues
-- This migration ensures all columns and functions exist

-- 1. Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Add duration column to videos table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'videos' 
    AND column_name = 'duration'
  ) THEN
    ALTER TABLE public.videos ADD COLUMN duration INTEGER;
  END IF;
END $$;

-- 3. Add thumbnail_url column to videos table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'videos' 
    AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE public.videos ADD COLUMN thumbnail_url TEXT;
  END IF;
END $$;

-- 4. Ensure all triggers exist
DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON public.social_accounts;
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.schedules;
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Verify videos table structure
-- This will show you what columns exist
-- Run this in Supabase SQL Editor to check:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'videos';

-- 6. Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at);

-- 7. Ensure RLS policies exist for videos
DO $$ 
BEGIN
  -- Drop and recreate policies to ensure they're correct
  DROP POLICY IF EXISTS "Users can view own videos" ON public.videos;
  DROP POLICY IF EXISTS "Users can insert own videos" ON public.videos;
  DROP POLICY IF EXISTS "Users can update own videos" ON public.videos;
  DROP POLICY IF EXISTS "Users can delete own videos" ON public.videos;
  
  -- Recreate policies
  CREATE POLICY "Users can view own videos"
    ON public.videos FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own videos"
    ON public.videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own videos"
    ON public.videos FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own videos"
    ON public.videos FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- 8. Verify table exists and has correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos') THEN
    RAISE EXCEPTION 'Videos table does not exist! Please run initial_schema.sql first.';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'All fixes applied successfully!';
  RAISE NOTICE 'Videos table columns: title, script, caption, video_url, thumbnail_url, status, duration';
END $$;
