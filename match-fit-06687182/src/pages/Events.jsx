import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CoachEventsView from "../components/events/CoachEventsView";
import PlayerEventsView from "../components/events/PlayerEventsView";

export default function EventsPage() {
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

  return (
    <div className="p-6">
      {currentUser?.team_role === "coach" ? (
        <CoachEventsView user={currentUser} />
      ) : (
        <PlayerEventsView user={currentUser} />
      )}
    </div>
  );
}