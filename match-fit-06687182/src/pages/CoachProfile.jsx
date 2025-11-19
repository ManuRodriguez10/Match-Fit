import React from "react";
import { useUser } from "../components/UserContext";
import CoachProfileForm from "../components/profile/CoachProfileForm";

export default function CoachProfilePage() {
  const { currentUser, isLoadingUser, loadCurrentUser } = useUser();

  const handleProfileUpdate = () => {
    // Reload user data after successful update
    loadCurrentUser();
  };

  if (isLoadingUser) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
        </div>
      </div>
    );
  }

  if (currentUser.team_role !== "coach") {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">This page is only available to coaches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <CoachProfileForm user={currentUser} onUpdate={handleProfileUpdate} />
    </div>
  );
}