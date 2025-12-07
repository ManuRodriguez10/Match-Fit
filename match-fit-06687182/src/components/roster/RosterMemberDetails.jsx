import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Ruler, Weight, Globe, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Helper function to parse date string as local date
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
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
    return member.email; // Fallback to email if first/last name not available
  };

  const handleRemovePlayer = async () => {
    const displayName = getMemberDisplayName();
    if (!confirm(`Are you sure you want to remove ${displayName} from the team? This action cannot be undone.`)) {
      return;
    }

    setIsRemoving(true);
    try {
      // Use the database function to remove the player (bypasses RLS)
      const { error } = await supabase.rpc('remove_player_from_team', {
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

      // Show success message with team name
      const teamNameText = teamName || "the team";
      toast.success(`${displayName} has been successfully removed from ${teamNameText}`);
      
      // Close modal and refresh after a delay to ensure toast is visible
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

  const isCoach = currentUser?.team_role === "coach";
  const isPlayer = member.team_role === "player";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {member.first_name && member.last_name 
              ? `${member.first_name} ${member.last_name}` 
              : member.email}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="capitalize">
              {member.team_role}
            </Badge>
            {isPlayer && member.position && (
              <Badge variant="outline" className="capitalize">
                {member.position}
              </Badge>
            )}
            {isPlayer && member.jersey_number && (
              <Badge variant="outline">
                #{member.jersey_number}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Contact Information - Only visible to coaches */}
          {isCoach && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{member.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Player Details */}
          {isPlayer && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Player Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.date_of_birth && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {format(parseLocalDate(member.date_of_birth), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
                {member.height && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Ruler className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-medium">{member.height}</p>
                    </div>
                  </div>
                )}
                {member.weight && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Weight className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{member.weight}</p>
                    </div>
                  </div>
                )}
                {member.nationality && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Nationality</p>
                      <p className="font-medium">{member.nationality}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coach Details */}
          {member.team_role === "coach" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Coaching Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.coach_role && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{member.coach_role.replace('_', ' ')}</p>
                  </div>
                )}
                {member.years_experience && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{member.years_experience} years</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remove Player Button (Only for coaches removing players) */}
          {isCoach && isPlayer && onPlayerRemoved && (
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleRemovePlayer}
                disabled={isRemoving}
                className="w-full"
              >
                {isRemoving ? (
                  <>
                    <Trash2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing Player...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Player from Team
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2 text-center">
                This will remove the player from your team roster
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}