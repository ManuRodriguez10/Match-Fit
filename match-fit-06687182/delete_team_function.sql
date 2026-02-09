-- Function to delete a team and disassociate all members
-- This function ensures that coach_role is preserved when team is deleted
-- Only team_id is cleared, allowing users to maintain their role history

CREATE OR REPLACE FUNCTION public.delete_team_and_disassociate_members(team_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all team-related data
  DELETE FROM public.events WHERE team_id = team_id_to_delete;
  DELETE FROM public.lineups WHERE team_id = team_id_to_delete;
  DELETE FROM public.coach_invites WHERE team_id = team_id_to_delete;
  
  -- Disassociate all team members by setting team_id to NULL
  -- IMPORTANT: Do NOT clear coach_role - preserve it for future teams
  UPDATE public.profiles 
  SET team_id = NULL
  WHERE team_id = team_id_to_delete;
  
  -- Finally, delete the team itself
  DELETE FROM public.teams WHERE id = team_id_to_delete;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_team_and_disassociate_members(UUID) TO authenticated;
