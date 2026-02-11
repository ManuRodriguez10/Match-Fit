import React, { useState, useEffect } from "react";
import { supabase, safeRpc } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { X, Trash2, Mail, Phone, Calendar, Ruler, Weight, Globe, Users, Shield, Target, Zap, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { canRemovePlayers, canRemoveCoaches } from "@/utils/permissions";
import PermissionLabel from "@/components/common/PermissionLabel";

// Helper function to parse date string as local date
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getPositionColor = (position) => {
  switch (position) {
    case "goalkeeper":
      return "bg-gradient-to-br from-blue-500 to-blue-600";
    case "defender":
      return "bg-gradient-to-br from-green-500 to-green-600";
    case "midfielder":
      return "bg-gradient-to-br from-yellow-500 to-yellow-600";
    case "forward":
      return "bg-gradient-to-br from-red-500 to-red-600";
    default:
      return "bg-gradient-to-br from-slate-500 to-slate-600";
  }
};

const getPositionIcon = (position) => {
  switch (position) {
    case "goalkeeper":
      return <Shield className="w-6 h-6 text-white" />;
    case "defender":
      return <Target className="w-6 h-6 text-white" />;
    case "midfielder":
      return <Zap className="w-6 h-6 text-white" />;
    case "forward":
      return <TrendingUp className="w-6 h-6 text-white" />;
    default:
      return <Users className="w-6 h-6 text-white" />;
  }
};

export default function RosterMemberDetails({ member, currentUser, onClose, onPlayerRemoved }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [teamName, setTeamName] = useState(null);

  // Fetch team name when component mounts
  useEffect(() => {
    const fetchTeamName = async () => {
      if (currentUser?.team_id) {
        try {
          const { data, error } = await supabase
            .from('teams')
            .select('name')
            .eq('id', currentUser.team_id)
            .single();
          
          if (!error && data) {
            setTeamName(data.name);
          }
        } catch (error) {
          console.error("Error fetching team name:", error);
        }
      }
    };
    
    fetchTeamName();
  }, [currentUser?.team_id]);

  const getMemberDisplayName = () => {
    if (member.first_name && member.last_name) {
      return `${member.first_name} ${member.last_name}`;
    }
    return member.email;
  };

  const handleRemovePlayer = async () => {
    const displayName = getMemberDisplayName();
    if (!confirm(`Are you sure you want to remove ${displayName} from the team? This action cannot be undone.`)) {
      return;
    }

    setIsRemoving(true);
    try {
      const { error } = await safeRpc('remove_player_from_team', {
        player_profile_id: member.id
      });

      if (error) {
        console.error("Full Supabase error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        throw error;
      }

      const teamNameText = teamName || "the team";
      toast.success(`${displayName} has been successfully removed from ${teamNameText}`);
      
      setTimeout(() => {
        onClose();
        if (onPlayerRemoved) {
          onPlayerRemoved();
        }
      }, 500);
    } catch (error) {
      console.error("Error removing player:", error);
      toast.error("Failed to remove player. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveCoach = async () => {
    const displayName = getMemberDisplayName();
    if (!confirm(`Are you sure you want to remove ${displayName} from the team? This action cannot be undone.`)) {
      return;
    }

    setIsRemoving(true);
    try {
      const { error } = await safeRpc("remove_coach_from_team", {
        coach_profile_id: member.id
      });

      if (error) {
        console.error("Error removing coach:", error);
        throw error;
      }

      const teamNameText = teamName || "the team";
      toast.success(`${displayName} has been successfully removed from ${teamNameText}`);
      
      setTimeout(() => {
        onClose();
        if (onPlayerRemoved) {
          onPlayerRemoved();
        }
      }, 500);
    } catch (error) {
      console.error("Error removing coach:", error);
      toast.error("Failed to remove coach. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  const isCoach = currentUser?.team_role === "coach";
  const isPlayer = member.team_role === "player";
  const isCoachMember = member.team_role === "coach";
  const isSelf = currentUser?.id === member.id;
  const isMemberHeadCoach = isCoachMember && member.coach_role === "head_coach";
  
  // Can remove players if head coach, can remove assistant coaches if head coach, but cannot remove other head coaches
  const canRemove = !isSelf && !isMemberHeadCoach && (isPlayer ? canRemovePlayers(currentUser) : canRemoveCoaches(currentUser));

  const positionColor = isPlayer && member.position ? getPositionColor(member.position) : "bg-gradient-to-br from-[#118ff3] to-[#0c5798]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Gradient accent bar */}
        <div className={`h-1 ${positionColor}`} />
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {isPlayer && member.jersey_number ? (
                <div className={`w-14 h-14 rounded-2xl ${positionColor} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                  {member.jersey_number}
                </div>
              ) : (
                <div className={`w-14 h-14 rounded-2xl ${positionColor} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  {isPlayer && member.position ? getPositionIcon(member.position) : <Users className="w-7 h-7 text-white" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {member.first_name && member.last_name 
                    ? `${member.first_name} ${member.last_name}` 
                    : member.email}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 capitalize">
                    {member.team_role}
                  </span>
                  {isPlayer && member.position && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 capitalize">
                      {member.position}
                    </span>
                  )}
                  {isPlayer && member.jersey_number && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#118ff3]/10 text-[#118ff3] border border-[#118ff3]/20">
                      #{member.jersey_number}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-xl hover:bg-slate-100 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Contact Information - Visible to coaches (for all members) and to players (for coaches only) */}
          {(isCoach || isCoachMember) && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50">
                  <div className="w-10 h-10 rounded-xl bg-[#118ff3]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#118ff3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="font-semibold text-slate-900 truncate">{member.email}</p>
                  </div>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Phone</p>
                      <p className="font-semibold text-slate-900">{member.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Player Details */}
          {isPlayer && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Player Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.date_of_birth && (
                  <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
                      <p className="font-semibold text-slate-900">
                        {format(parseLocalDate(member.date_of_birth), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
                {member.height && (
                  <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Ruler className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Height</p>
                      <p className="font-semibold text-slate-900">{member.height}</p>
                    </div>
                  </div>
                )}
                {member.weight && (
                  <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Weight className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Weight</p>
                      <p className="font-semibold text-slate-900">{member.weight}</p>
                    </div>
                  </div>
                )}
                {member.nationality && (
                  <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Nationality</p>
                      <p className="font-semibold text-slate-900">{member.nationality}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coach Details */}
          {isCoachMember && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Coaching Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.coach_role && (
                  <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50">
                    <div className="w-10 h-10 rounded-xl bg-[#118ff3]/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-[#118ff3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Role</p>
                      <p className="font-semibold text-slate-900 capitalize">{member.coach_role.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}
                {member.years_experience && (
                  <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Experience</p>
                      <p className="font-semibold text-slate-900">{member.years_experience} years</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remove Member Button - Show for coaches with appropriate permissions */}
          {isCoach && ((isPlayer && onPlayerRemoved) || (isCoachMember && onPlayerRemoved)) && !isSelf && (
            <div className="pt-4 border-t border-slate-200/50 space-y-4">
              {!canRemove && (
                <PermissionLabel 
                  message={
                    isSelf
                      ? "You cannot remove yourself from the team"
                      : isMemberHeadCoach
                      ? "Head coaches cannot be removed from the team"
                      : isPlayer 
                      ? "Only coaches can remove players from the roster" 
                      : "Only head coaches can remove coaches from the roster"
                  } 
                />
              )}
              <Button
                onClick={isPlayer ? handleRemovePlayer : handleRemoveCoach}
                disabled={isRemoving || !canRemove}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30 rounded-xl py-3 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRemoving ? (
                  <>
                    <Trash2 className="w-5 h-5 mr-2 animate-spin" />
                    {isPlayer ? "Removing Player..." : "Removing Coach..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 mr-2" />
                    {isPlayer ? "Remove Player from Team" : "Remove Coach from Team"}
                  </>
                )}
              </Button>
              <p className="text-sm text-slate-500 mt-3 text-center">
                This will remove the {isPlayer ? "player" : "coach"} from your team roster
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}