-- Update profiles table to include email column (if it doesn't exist)
-- This adds an email column to the profiles table and populates it from auth.users

-- Step 1: Add email column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Step 2: Update existing profiles with emails from auth.users
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id
AND p.email IS NULL;

-- Step 3: Update the trigger function to also store email when new users are created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, team_role, email)
  VALUES (
    NEW.id,
    '',  -- full_name will be set during role setup
    NULL,  -- role will be set during role setup
    NULL,   -- team_role will be set during role setup
    NEW.email  -- Store email from auth.users
  )
  ON CONFLICT (id) DO UPDATE SET email = NEW.email;  -- Update email if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create a function to sync emails (useful for keeping emails up to date)
CREATE OR REPLACE FUNCTION public.sync_user_emails()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles p
  SET email = au.email
  FROM auth.users au
  WHERE p.id = au.id
  AND (p.email IS NULL OR p.email != au.email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.sync_user_emails() TO authenticated;
