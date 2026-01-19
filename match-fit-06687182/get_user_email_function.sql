-- Function to get user email from auth.users table
-- This function allows fetching email addresses for team members
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get email from auth.users table
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;
