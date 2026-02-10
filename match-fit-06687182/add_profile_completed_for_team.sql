-- Add profile_completed_for_team_id to track when a user has completed their profile for their current team.
-- When a user joins a new team, this is set to null. When they complete the profile form, it's set to team_id.
-- This ensures users who were in a previous team (deleted or kicked) must complete their profile again when joining a new team.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_completed_for_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.profile_completed_for_team_id IS 'Set when user completes profile for their current team. Null when they join a new team until they complete the profile form.';
