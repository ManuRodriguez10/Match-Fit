import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../components/UserContext";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Target, Zap, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import RosterMemberDetails from "../components/roster/RosterMemberDetails";

// Helper function to parse date string as local date
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function RosterPage() {
  const location = useLocation();
  const { currentUser, isLoadingUser } = useUser();
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadTeamMembers();
    }
  }, [currentUser, location.pathname]);

  const loadTeamMembers = async () => {
    if (!currentUser?.team_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch team members from profiles table
      const { data: members, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('team_id', currentUser.team_id)
        .order('team_role', { ascending: false })
        .order('last_name');

      if (error) {
        console.error("Error loading team members:", error);
      } else {
        setTeamMembers(members || []);
      }
    } catch (error) {
      console.error("Roster - Error loading roster data:", error);
    }
    setIsLoading(false);
  };

  if (isLoadingUser || isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Only coaches can view the full roster
  if (currentUser?.team_role !== "coach") {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Roster Access</h3>
          <p className="text-gray-600">Only coaches can view the team roster.</p>
        </div>
      </div>
    );
  }

  // Group team members by role and position
  const coaches = teamMembers.filter(m => m.team_role === "coach");
  const allPlayers = teamMembers.filter(m => m.team_role === "player");
  const goalkeepers = allPlayers.filter(p => p.position === "goalkeeper");
  const defenders = allPlayers.filter(p => p.position === "defender");
  const midfielders = allPlayers.filter(p => p.position === "midfielder");
  const forwards = allPlayers.filter(p => p.position === "forward");
  const playersWithoutPosition = allPlayers.filter(p => !p.position || !["goalkeeper", "defender", "midfielder", "forward"].includes(p.position));

  const getPositionIcon = (position) => {
    switch (position) {
      case "goalkeeper":
        return <Shield className="w-5 h-5 text-blue-600" />;
      case "defender":
        return <Target className="w-5 h-5 text-green-600" />;
      case "midfielder":
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case "forward":
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderPlayerCard = (player) => {
    const parsedDate = parseLocalDate(player.date_of_birth);
    
    return (
      <Card 
        key={player.id} 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setSelectedMember(player)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-main)] to-[var(--primary-dark)] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {player.jersey_number || "?"}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {player.first_name && player.last_name 
                    ? `${player.first_name} ${player.last_name}` 
                    : player.email}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getPositionIcon(player.position)}
                  <span className="text-sm text-gray-600 capitalize">{player.position}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Date of Birth</p>
              <p className="font-medium">
                {parsedDate && !isNaN(parsedDate) ? format(parsedDate, "MMM d, yyyy") : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Jersey #</p>
              <p className="font-medium">{player.jersey_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Height</p>
              <p className="font-medium">{player.height || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Weight</p>
              <p className="font-medium">{player.weight || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Nationality</p>
              <p className="font-medium">{player.nationality || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCoachCard = (coach) => (
    <Card 
      key={coach.id} 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setSelectedMember(coach)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {coach.first_name && coach.last_name 
                ? `${coach.first_name} ${coach.last_name}` 
                : coach.email}
            </CardTitle>
            <p className="text-sm text-gray-600">Coach</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{coach.email}</p>
          </div>
          {coach.phone && (
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{coach.phone}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const hasMembers = teamMembers.length > 0;
  const hasPlayers = allPlayers.length > 0;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Roster</h1>
        <p className="text-gray-600 mt-1">View and manage your team members</p>
      </div>

      {selectedMember && (
        <RosterMemberDetails
          member={selectedMember}
          currentUser={currentUser}
          onClose={() => setSelectedMember(null)}
          onPlayerRemoved={loadTeamMembers}
        />
      )}

      {!hasMembers ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Players Added Yet</h3>
          <p className="text-gray-600 mb-6">
            Share your team code with players so they can join your roster.
          </p>
        </div>
      ) : (
        <>
          {/* Coaching Staff - Shows Only Coaches */}
          {hasMembers && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Coaching Staff</h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {coaches.length}
                </span>
              </div>
              {coaches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coaches.map(renderCoachCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200">
                  No coaches found.
                </div>
              )}
            </div>
          )}

          {/* Players - Tabbed by Position - Shows Only Players */}
          {hasMembers && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Players</h2>
              {hasPlayers ? (
                <Tabs defaultValue={
                goalkeepers.length > 0 ? "goalkeepers" :
                defenders.length > 0 ? "defenders" :
                midfielders.length > 0 ? "midfielders" :
                forwards.length > 0 ? "forwards" :
                playersWithoutPosition.length > 0 ? "no-position" : "goalkeepers"
              }>
                <TabsList>
                  {goalkeepers.length > 0 && (
                    <TabsTrigger value="goalkeepers">
                      Goalkeepers ({goalkeepers.length})
                    </TabsTrigger>
                  )}
                  {defenders.length > 0 && (
                    <TabsTrigger value="defenders">
                      Defenders ({defenders.length})
                    </TabsTrigger>
                  )}
                  {midfielders.length > 0 && (
                    <TabsTrigger value="midfielders">
                      Midfielders ({midfielders.length})
                    </TabsTrigger>
                  )}
                  {forwards.length > 0 && (
                    <TabsTrigger value="forwards">
                      Forwards ({forwards.length})
                    </TabsTrigger>
                  )}
                  {playersWithoutPosition.length > 0 && (
                    <TabsTrigger value="no-position">
                      Other ({playersWithoutPosition.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                {goalkeepers.length > 0 && (
                  <TabsContent value="goalkeepers" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {goalkeepers.map(renderPlayerCard)}
                    </div>
                  </TabsContent>
                )}

                {defenders.length > 0 && (
                  <TabsContent value="defenders" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {defenders.map(renderPlayerCard)}
                    </div>
                  </TabsContent>
                )}

                {midfielders.length > 0 && (
                  <TabsContent value="midfielders" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {midfielders.map(renderPlayerCard)}
                    </div>
                  </TabsContent>
                )}

                {forwards.length > 0 && (
                  <TabsContent value="forwards" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {forwards.map(renderPlayerCard)}
                    </div>
                  </TabsContent>
                )}

                 {playersWithoutPosition.length > 0 && (
                   <TabsContent value="no-position" className="mt-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {playersWithoutPosition.map(renderPlayerCard)}
                     </div>
                   </TabsContent>
                 )}
               </Tabs>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200">
                  No players found.
                </div>
              )}
             </div>
           )}
        </>
      )}
    </div>
  );
}