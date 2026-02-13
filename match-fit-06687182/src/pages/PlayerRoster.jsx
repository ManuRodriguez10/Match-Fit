import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useUser } from "../components/UserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Shield, Target, Zap, TrendingUp, Lock, User, ArrowLeft, Grid3x3, List } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import RosterMemberDetails from "../components/roster/RosterMemberDetails";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function PlayerRosterPage() {
  const { currentUser, isLoadingUser } = useUser();
  const [teamMembers, setTeamMembers] = useState([]);
  const [team, setTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [viewMode, setViewMode] = useState("card");

  useEffect(() => {
    if (currentUser) {
    loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser?.team_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('team_id', currentUser.team_id)
        .order('team_role', { ascending: false })
        .order('last_name');

      if (membersError) {
        console.error("Error loading team members:", membersError);
      } else {
        setTeamMembers(members || []);
      }

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', currentUser.team_id)
        .single();

      if (teamError) {
        console.error("PlayerRoster - Error loading team:", teamError);
      } else {
        setTeam(teamData);
      }
    } catch (error) {
      console.error("PlayerRoster - Error loading roster data:", error);
    }
    setIsLoading(false);
  };

  if (isLoadingUser || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.team_role !== "player") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center"
          >
            <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Roster Access</h3>
            <p className="text-slate-600">This page is only available to players.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const isPlayerProfileIncomplete = !currentUser.position || !currentUser.jersey_number;

  if (isPlayerProfileIncomplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center"
          >
            <Lock className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Complete Player Profile to Unlock Access
            </h3>
            <p className="text-slate-600 mb-6">
              You need to complete your player profile before you can view the team roster.
            </p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl">
                <User className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const coaches = teamMembers.filter(m => m.team_role === "coach");
  const headCoaches = coaches.filter(c => c.coach_role === "head_coach");
  const assistantCoaches = coaches.filter(c => c.coach_role === "assistant_coach");
  const otherCoaches = coaches.filter(c => !c.coach_role || (c.coach_role !== "head_coach" && c.coach_role !== "assistant_coach"));
  const allPlayers = teamMembers.filter(m => m.team_role === "player");
  const goalkeepers = allPlayers.filter(p => p.position === "goalkeeper");
  const defenders = allPlayers.filter(p => p.position === "defender");
  const midfielders = allPlayers.filter(p => p.position === "midfielder");
  const forwards = allPlayers.filter(p => p.position === "forward");
  const playersWithoutPosition = allPlayers.filter(p => !p.position || !["goalkeeper", "defender", "midfielder", "forward"].includes(p.position));

  const getFilteredPlayers = () => {
    let players = [];
    if (selectedPosition === "all") {
      players = allPlayers;
    } else if (selectedPosition === "goalkeeper") {
      players = goalkeepers;
    } else if (selectedPosition === "defender") {
      players = defenders;
    } else if (selectedPosition === "midfielder") {
      players = midfielders;
    } else if (selectedPosition === "forward") {
      players = forwards;
    } else if (selectedPosition === "no-position") {
      players = playersWithoutPosition;
    } else {
      players = allPlayers;
    }
    return [...players].sort((a, b) => {
      const numA = a.jersey_number ? parseInt(a.jersey_number, 10) : Infinity;
      const numB = b.jersey_number ? parseInt(b.jersey_number, 10) : Infinity;
      return numA - numB;
    });
  };

  const filteredPlayers = getFilteredPlayers();

  const getPositionIcon = (position, className = "w-5 h-5") => {
    switch (position) {
      case "goalkeeper": return <Shield className={className} />;
      case "defender": return <Target className={className} />;
      case "midfielder": return <Zap className={className} />;
      case "forward": return <TrendingUp className={className} />;
      default: return <Users className={className} />;
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case "goalkeeper": return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "defender": return "bg-gradient-to-br from-green-500 to-green-600";
      case "midfielder": return "bg-gradient-to-br from-yellow-500 to-yellow-600";
      case "forward": return "bg-gradient-to-br from-red-500 to-red-600";
      default: return "bg-gradient-to-br from-slate-500 to-slate-600";
    }
  };

  const renderPlayerCard = (player, index) => {
    const parsedDate = parseLocalDate(player.date_of_birth);
    return (
      <motion.div
        key={player.id} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={() => setSelectedMember(player)}
        className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-900/5 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300/80"
      >
        <div className={`absolute top-0 left-0 right-0 h-1 ${getPositionColor(player.position)}`} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-14 h-14 rounded-2xl ${getPositionColor(player.position)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {player.jersey_number || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#118ff3] transition-colors mb-1">
                  {player.first_name && player.last_name ? `${player.first_name} ${player.last_name}` : player.email}
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${getPositionColor(player.position)}/20 flex items-center justify-center`}>
                    {getPositionIcon(player.position, "w-4 h-4 text-slate-700")}
                  </div>
                  <span className="text-sm text-slate-600 capitalize font-medium">{player.position || "No position"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
              <p className="text-sm font-semibold text-slate-900">
                {parsedDate && !isNaN(parsedDate) ? format(parsedDate, "MMM d, yyyy") : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Jersey #</p>
              <p className="text-sm font-semibold text-slate-900">{player.jersey_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Height</p>
              <p className="text-sm font-semibold text-slate-900">{player.height || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Weight</p>
              <p className="text-sm font-semibold text-slate-900">{player.weight || "N/A"}</p>
            </div>
            {player.nationality && (
            <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Nationality</p>
                <p className="text-sm font-semibold text-slate-900">{player.nationality}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderPlayerListRow = (player, index) => {
    const parsedDate = parseLocalDate(player.date_of_birth);
    return (
      <motion.div
        key={player.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        whileHover={{ x: 4 }}
        onClick={() => setSelectedMember(player)}
        className="group relative bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/50 shadow-md shadow-slate-900/5 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/10 hover:border-slate-300/80"
      >
        <div className={`absolute top-0 left-0 bottom-0 w-1 ${getPositionColor(player.position)}`} />
        <div className="p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${getPositionColor(player.position)} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
            {player.jersey_number || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-base text-slate-900 group-hover:text-[#118ff3] transition-colors">
                {player.first_name && player.last_name ? `${player.first_name} ${player.last_name}` : player.email}
              </h3>
              <div className={`w-6 h-6 rounded-lg ${getPositionColor(player.position)}/20 flex items-center justify-center`}>
                {getPositionIcon(player.position, "w-3 h-3 text-slate-700")}
              </div>
              <span className="text-xs text-slate-600 capitalize font-medium">{player.position || "No position"}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            <div className="text-right min-w-[100px]">
              <p className="text-xs text-slate-500">Date of Birth</p>
              <p className="text-sm font-semibold text-slate-900">
                {parsedDate && !isNaN(parsedDate) ? format(parsedDate, "MMM d, yyyy") : "N/A"}
              </p>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="text-xs text-slate-500">Height</p>
              <p className="text-sm font-semibold text-slate-900">{player.height || "N/A"}</p>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="text-xs text-slate-500">Weight</p>
              <p className="text-sm font-semibold text-slate-900">{player.weight || "N/A"}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCoachCard = (coach, index) => (
    <motion.div
      key={coach.id} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => setSelectedMember(coach)}
      className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-900/5 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300/80"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-br from-[#118ff3] to-[#0c5798]" />
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#118ff3] to-[#0c5798] flex items-center justify-center shadow-lg shadow-[#118ff3]/30">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#118ff3] transition-colors mb-1">
              {coach.first_name && coach.last_name ? `${coach.first_name} ${coach.last_name}` : coach.email}
            </h3>
            <p className="text-sm text-slate-600 font-medium">Coach</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <div>
            <p className="text-xs text-slate-500 mb-1">Email</p>
            <p className="text-sm font-semibold text-slate-900">{coach.email}</p>
            </div>
          {coach.phone && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Phone</p>
              <p className="text-sm font-semibold text-slate-900">{coach.phone}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
  
  const hasMembers = teamMembers.length > 0;
  const hasPlayers = allPlayers.length > 0;
  const hasCoaches = coaches.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
      <DashboardBackground />
      <DashboardNav user={currentUser} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
      <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                {view === "coaches" ? "Coaching Staff" : view === "players" ? "Players" : "Team Roster"}
              </span>
            </h1>
            <p className="text-lg">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent font-semibold">
                {team?.name ? `${team.name} - ` : ""}
                {view === "coaches" ? "View your coaching staff" : view === "players" ? "View your teammates" : "View your team members"}
              </span>
        </p>
      </div>
          {view && (
            <Button
              onClick={() => { setView(null); setSelectedPosition("all"); }}
              className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white shadow-lg shadow-[#118ff3]/30 rounded-xl px-6 py-6 h-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Roster
            </Button>
          )}
        </motion.div>

      {selectedMember && (
        <RosterMemberDetails
          member={selectedMember}
          currentUser={currentUser}
          onClose={() => setSelectedMember(null)}
        />
      )}

        {!view && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl"
          >
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setView("coaches")}
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-900/5 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300/80 p-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-br from-[#118ff3] to-[#0c5798]" />
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#118ff3] to-[#0c5798] flex items-center justify-center shadow-lg shadow-[#118ff3]/30">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Coaching Staff</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {hasCoaches ? `${coaches.length} ${coaches.length === 1 ? 'coach' : 'coaches'}` : 'No coaches'}
          </p>
        </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setView("players")}
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-900/5 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300/80 p-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-br from-purple-500 to-purple-600" />
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Players</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {hasPlayers ? `${allPlayers.length} ${allPlayers.length === 1 ? 'player' : 'players'}` : 'No players'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {view === "coaches" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {hasCoaches ? (
              <>
                {headCoaches.length > 0 && (
            <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Head Coach</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {headCoaches.map((coach, index) => renderCoachCard(coach, index))}
                    </div>
                  </div>
                )}
                {assistantCoaches.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Assistant Coach</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assistantCoaches.map((coach, index) => renderCoachCard(coach, index))}
                    </div>
                  </div>
                )}
                {otherCoaches.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Other Coaches</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {otherCoaches.map((coach, index) => renderCoachCard(coach, index))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Coaches Found</h3>
                <p className="text-slate-600">There are no coaches on your team yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {view === "players" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Players</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
                    {selectedPosition !== "all" && ` (${selectedPosition})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl p-1 shadow-md flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("card")}
                    className={`h-8 w-8 rounded-lg transition-all ${viewMode === "card" ? "bg-gradient-to-r from-[#118ff3] to-[#0c5798] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={`h-8 w-8 rounded-lg transition-all ${viewMode === "list" ? "bg-gradient-to-r from-[#118ff3] to-[#0c5798] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl px-4 py-2.5 shadow-md">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600 mr-1">Positions:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-blue-600"></div>
                      <span className="text-xs text-slate-600">GK</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gradient-to-br from-green-500 to-green-600"></div>
                      <span className="text-xs text-slate-600">DEF</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gradient-to-br from-yellow-500 to-yellow-600"></div>
                      <span className="text-xs text-slate-600">MID</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gradient-to-br from-red-500 to-red-600"></div>
                      <span className="text-xs text-slate-600">FWD</span>
                    </div>
                  </div>
                </div>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger className="w-[200px] bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl">
                    <SelectValue placeholder="Filter by position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions ({allPlayers.length})</SelectItem>
                    <SelectItem value="goalkeeper">Goalkeepers ({goalkeepers.length})</SelectItem>
                    <SelectItem value="defender">Defenders ({defenders.length})</SelectItem>
                    <SelectItem value="midfielder">Midfielders ({midfielders.length})</SelectItem>
                    <SelectItem value="forward">Forwards ({forwards.length})</SelectItem>
                    {playersWithoutPosition.length > 0 && (
                      <SelectItem value="no-position">Other ({playersWithoutPosition.length})</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredPlayers.length > 0 ? (
              viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlayers.map((player, index) => renderPlayerCard(player, index))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPlayers.map((player, index) => renderPlayerListRow(player, index))}
                </div>
              )
            ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center">
                <Target className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Players Found</h3>
                <p className="text-slate-600">
                  {selectedPosition === "all"
                    ? "There are no players on your team yet."
                    : `No ${selectedPosition} players found.`}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {!hasMembers && !view && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Team Members Added Yet</h3>
            <p className="text-slate-600">
              Your team roster will appear here once members join.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
