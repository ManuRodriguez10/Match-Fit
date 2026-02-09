import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../components/UserContext";
import { supabase } from "../api/supabaseClient";
import CoachDashboard from "../components/dashboard/CoachDashboard";
import PlayerDashboard from "../components/dashboard/PlayerDashboard";
import TeamOnboarding from "../components/onboarding/TeamOnboarding";
import PlayerProfileCompletion from "../components/onboarding/PlayerProfileCompletion";
import CoachProfileCompletion from "../components/onboarding/CoachProfileCompletion";

export default function Dashboard() {
  const { currentUser, isLoadingUser, loadCurrentUser } = useUser();
  const [isValidatingTeam, setIsValidatingTeam] = useState(false);
  const lastValidatedTeamIdRef = useRef(null);
  const isValidatingRef = useRef(false);

  // Validate that team_id actually exists in the database
  // Only validate once per team_id change, not on every user update
  useEffect(() => {
    const validateTeam = async () => {
      // Skip if no team_id, still loading, already validating, or already validated this team_id
      if (
        !currentUser?.team_id || 
        isLoadingUser || 
        isValidatingRef.current ||
        lastValidatedTeamIdRef.current === currentUser.team_id
      ) {
        return;
      }

      isValidatingRef.current = true;
      setIsValidatingTeam(true);
      
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("id")
          .eq("id", currentUser.team_id)
          .maybeSingle();

        // Mark this team_id as validated
        lastValidatedTeamIdRef.current = currentUser.team_id;

        // If team doesn't exist, clear team_id from profile
        if (error || !data) {
          console.warn("Team not found, clearing team_id from profile");
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ team_id: null })
            .eq("id", currentUser.id);

          if (!updateError) {
            // Reset validation ref so we can validate again after reload
            lastValidatedTeamIdRef.current = null;
            // Reload user to reflect the cleared team_id (don't await to avoid blocking)
            loadCurrentUser();
          }
        }
      } catch (error) {
        console.error("Error validating team:", error);
        // Reset ref on error so we can retry
        lastValidatedTeamIdRef.current = null;
      } finally {
        isValidatingRef.current = false;
        setIsValidatingTeam(false);
      }
    };

    validateTeam();
  }, [currentUser?.team_id, isLoadingUser]); // Removed loadCurrentUser, currentUser?.id, and isValidatingTeam

  if (isLoadingUser || isValidatingTeam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no user, redirect to landing page (handled by showing landing page content)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to continue</h2>
          <p className="text-gray-600">Authentication system needs to be implemented</p>
        </div>
      </div>
    );
  }

  // Stage 1: Check if user has joined/created a team
  if (!currentUser.team_id) {
    return <TeamOnboarding user={currentUser} onComplete={loadCurrentUser} />;
  }

  // Stage 2: For players, check if they've completed their full profile
  if (currentUser.team_role === "player" && (!currentUser.position || !currentUser.jersey_number)) {
    return <PlayerProfileCompletion user={currentUser} onComplete={loadCurrentUser} />;
  }

  // Stage 3: For coaches, check if they've completed their full profile
  if (currentUser.team_role === "coach" && (!currentUser.first_name || !currentUser.last_name || !currentUser.years_experience || !currentUser.phone)) {
    return <CoachProfileCompletion user={currentUser} onComplete={loadCurrentUser} />;
  }

  // All onboarding complete - show appropriate dashboard
  // Note: Both CoachDashboard and PlayerDashboard now handle their own full-screen layouts
  return (
    <>
      {currentUser.team_role === "coach" ? (
        <CoachDashboard user={currentUser} />
      ) : (
        <PlayerDashboard user={currentUser} />
      )}
    </>
  );
}