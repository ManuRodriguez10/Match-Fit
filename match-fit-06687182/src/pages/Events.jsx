import React from "react";
import { useUser } from "../components/UserContext";
import CoachEventsView from "../components/events/CoachEventsView";
import PlayerEventsView from "../components/events/PlayerEventsView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Lock, User } from "lucide-react";

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

  // Check if player profile is incomplete
  const isPlayerProfileIncomplete = currentUser.team_role === "player" && 
    (!currentUser.position || !currentUser.jersey_number);

  if (isPlayerProfileIncomplete) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Player Profile to Unlock Access
            </h3>
            <p className="text-gray-600 mb-6">
              You need to complete your player profile before you can view team events and schedule.
            </p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]">
                <User className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {currentUser.team_role === "coach" ? (
        <CoachEventsView user={currentUser} />
      ) : (
        <PlayerEventsView user={currentUser} />
      )}
    </>
  );
}