-- Ensure User Profile Creation
-- This migration fixes the foreign key constraint issue

-- 1. Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, plan, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'free',
    10
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$;

-- 2. Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing auth users who don't have profiles
INSERT INTO public.users (id, email, name, plan, credits)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'User'),
  'free',
  10
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 4. Add a helper function to ensure user exists before operations
CREATE OR REPLACE FUNCTION public.ensure_user_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists in public.users
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
    -- Try to get user from auth.users and create profile
    INSERT INTO public.users (id, email, name, plan, credits)
    SELECT 
      au.id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'name', 'User'),
      'free',
      10
    FROM auth.users au
    WHERE au.id = user_id
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = user_id);
END;
$$;

-- 5. Verify all auth users have profiles
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
  );
  
  IF missing_count > 0 THEN
    RAISE NOTICE 'Found % auth users without profiles. Creating profiles...', missing_count;
    
    INSERT INTO public.users (id, email, name, plan, credits)
    SELECT 
      au.id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'name', 'User'),
      'free',
      10
    FROM auth.users au
    WHERE NOT EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = au.id
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created % user profiles', missing_count;
  ELSE
    RAISE NOTICE 'All auth users have profiles!';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User profile creation fixed!';
  RAISE NOTICE 'All existing auth users now have profiles in public.users table';
END $$;
