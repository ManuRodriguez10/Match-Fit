import React from "react";
import { useUser } from "../components/UserContext";
import CoachDashboard from "../components/dashboard/CoachDashboard";
import PlayerDashboard from "../components/dashboard/PlayerDashboard";
import RoleSetup from "../components/onboarding/RoleSetup";
import TeamOnboarding from "../components/onboarding/TeamOnboarding";
import PlayerProfileCompletion from "../components/onboarding/PlayerProfileCompletion";

export default function Dashboard() {
  const { currentUser, isLoadingUser, loadCurrentUser } = useUser();

  const handleResetRole = async () => {
    try {
      await loadCurrentUser();
    } catch (error) {
      console.error("Error resetting role:", error);
    }
  };

  if (isLoadingUser) {
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

  // Stage 1: Check if user has selected their role
  if (!currentUser.team_role) {
    return <RoleSetup user={currentUser} onComplete={loadCurrentUser} />;
  }

  // Stage 2: Check if user has joined/created a team
  if (!currentUser.team_id) {
    return <TeamOnboarding user={currentUser} onComplete={loadCurrentUser} onBackToRoleSelection={handleResetRole} />;
  }

  // Stage 3: For players, check if they've completed their full profile
  if (currentUser.team_role === "player" && (!currentUser.position || !currentUser.jersey_number)) {
    return <PlayerProfileCompletion user={currentUser} onComplete={loadCurrentUser} />;
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