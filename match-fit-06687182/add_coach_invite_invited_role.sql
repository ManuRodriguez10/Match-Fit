-- Add invited_role to coach_invites so the head coach can invite as Assistant or Head Coach.
-- Run this in the Supabase SQL editor.

ALTER TABLE public.coach_invites
ADD COLUMN IF NOT EXISTS invited_role text NOT NULL DEFAULT 'assistant_coach';

-- Optional: restrict to allowed values
ALTER TABLE public.coach_invites
DROP CONSTRAINT IF EXISTS coach_invites_invited_role_check;

ALTER TABLE public.coach_invites
ADD CONSTRAINT coach_invites_invited_role_check
CHECK (invited_role IN ('assistant_coach', 'head_coach'));

COMMENT ON COLUMN public.coach_invites.invited_role IS 'Role to assign when the invite is used: assistant_coach or head_coach';
