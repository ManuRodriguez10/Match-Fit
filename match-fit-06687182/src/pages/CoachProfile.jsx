import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CoachProfileForm from "../components/profile/CoachProfileForm";

export default function CoachProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setIsLoading(false);
  };

  const handleProfileUpdate = () => {
    // Reload user data after successful update
    loadCurrentUser();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.team_role !== "coach") {
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