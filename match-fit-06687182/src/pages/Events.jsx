import React from "react";
import { useUser } from "../components/UserContext";
import CoachEventsView from "../components/events/CoachEventsView";
import PlayerEventsView from "../components/events/PlayerEventsView";

export default function EventsPage() {
  const { currentUser, isLoadingUser } = useUser();

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

  return (
    <div className="p-6">
      {currentUser.team_role === "coach" ? (
        <CoachEventsView user={currentUser} />
      ) : (
        <PlayerEventsView user={currentUser} />
      )}
    </div>
  );
}