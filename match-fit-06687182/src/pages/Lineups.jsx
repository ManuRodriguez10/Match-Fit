import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../components/UserContext";
import CoachLineupBuilder from "../components/lineups/CoachLineupBuilder";
import PlayerLineupViewer from "../components/lineups/PlayerLineupViewer";

export default function LineupsPage() {
  const location = useLocation();
  const { currentUser, isLoadingUser } = useUser();
  const [initialEventId, setInitialEventId] = useState(null);

  useEffect(() => {
    // Extract eventId from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const eventIdParam = urlParams.get('eventId');
    if (eventIdParam) {
      setInitialEventId(eventIdParam);
    } else {
      setInitialEventId(null);
    }
  }, [location.pathname, location.search]);

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

  return (
    <div className="p-6">
      {currentUser?.team_role === "coach" ? (
        <CoachLineupBuilder user={currentUser} />
      ) : (
        <PlayerLineupViewer user={currentUser} initialEventId={initialEventId} />
      )}
    </div>
  );
}