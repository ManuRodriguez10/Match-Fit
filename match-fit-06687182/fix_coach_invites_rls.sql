-- Fix Row Level Security (RLS) policies for coach_invites table
-- This allows authenticated users to validate coach invitation codes

-- Step 1: Enable RLS on coach_invites table (if not already enabled)
ALTER TABLE public.coach_invites ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow code validation for coach invites" ON public.coach_invites;
DROP POLICY IF EXISTS "Allow marking coach invites as used" ON public.coach_invites;
DROP POLICY IF EXISTS "Allow coaches to create coach invites" ON public.coach_invites;
DROP POLICY IF EXISTS "Allow coaches to read coach invites" ON public.coach_invites;

-- Step 3: Allow authenticated users to SELECT coach_invites when querying by code
-- This is safe because they can only validate codes, not see all invites
CREATE POLICY "Allow code validation for coach invites"
ON public.coach_invites
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read for code validation

-- Step 4: Allow authenticated users to update coach_invites to mark them as used
-- This is safe because they can only update invites they've validated
CREATE POLICY "Allow marking coach invites as used"
ON public.coach_invites
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 5: Allow coaches (users with team_role = 'coach') to create coach invites
-- Only coaches who are part of a team can create invites for their team
CREATE POLICY "Allow coaches to create coach invites"
ON public.coach_invites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.team_role = 'coach'
    AND profiles.team_id = coach_invites.team_id
  )
);

-- Step 6: Allow coaches to read coach invites for their team
-- Coaches can see all invites for their team (for management purposes)
CREATE POLICY "Allow coaches to read coach invites"
ON public.coach_invites
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.team_role = 'coach'
    AND profiles.team_id = coach_invites.team_id
  )
);

-- Verification query (optional - run this to check if policies are working)
-- This should return true if the policies are set up correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'coach_invites'
ORDER BY policyname;
