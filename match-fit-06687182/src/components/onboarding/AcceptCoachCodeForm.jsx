import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AcceptCoachCodeForm({ user, onComplete, onBack }) {
  const [invitationCode, setInvitationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const {
        data: { user: authUser },
        error: authError
      } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error("User not authenticated");
      }

      if (user.team_id) {
        setError("You're already part of a team. Please leave that team first.");
        setIsSubmitting(false);
        return;
      }

      const normalizedCode = invitationCode.trim().toUpperCase();
      const nowIso = new Date().toISOString();

      let targetTeamId = null;
      let coachInviteId = null;

      // First, try to find coach invite
      const { data: invite, error: inviteError } = await supabase
        .from("coach_invites")
        .select("*")
        .eq("code", normalizedCode)
        .eq("used", false)
        .gt("expires_at", nowIso)
        .order("expires_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      // If there's an actual error (not just no results), handle it
      if (inviteError) {
        console.error("Error looking up coach invite:", inviteError);
        console.error("Error details:", {
          message: inviteError.message,
          code: inviteError.code,
          details: inviteError.details,
          hint: inviteError.hint
        });
        // Show more specific error message
        const errorMsg = inviteError.code === 'PGRST301' || inviteError.message?.includes('permission') 
          ? "You don't have permission to validate coach codes. Please contact support."
          : `There was an error validating the coach code: ${inviteError.message}. Please try again.`;
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // If coach invite found, use it
      if (invite) {
        targetTeamId = invite.team_id;
        coachInviteId = invite.id;
      } else {
        // Only if no coach invite found, fall back to player code
        const { data: teams, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("join_code", normalizedCode)
          .limit(1);

        if (teamError) {
          throw teamError;
        }

        if (!teams || teams.length === 0) {
          setError("Invalid invitation code. Please check the code and try again.");
          setIsSubmitting(false);
          return;
        }

        targetTeamId = teams[0].id;
      }

      // Update profile: set team_id, team_role, and coach_role.
      // Set profile_completed_for_team_id to null so they must complete profile for this new team.
      const updateData = { team_id: targetTeamId, profile_completed_for_team_id: null };
      
      // If joining via coach invite, set team_role and coach_role from the invite (invited_role)
      if (coachInviteId && invite) {
        updateData.team_role = "coach";
        updateData.coach_role = invite.invited_role === "head_coach" ? "head_coach" : "assistant_coach";
      }
      // If joining via player code (fallback), don't change coach_role (player joining as player)
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", authUser.id);

      if (profileError) {
        throw profileError;
      }

      if (coachInviteId) {
        await supabase
          .from("coach_invites")
          .update({ used: true })
          .eq("id", coachInviteId);
      }

      onComplete();
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setError("There was an error joining the team. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]"></div>
          
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#118ff3] to-[#0c5798] rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent text-center">
                Join Existing Team
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="invitationCode" className="text-gray-700 font-medium">Team Code *</Label>
                <Input
                  id="invitationCode"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-wider font-bold rounded-lg h-14 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 text-center">
                  Your head coach should have provided you with this team code
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onBack} 
                  className="flex-1 rounded-lg border-gray-200 hover:bg-gray-50"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? "Joining..." : "Join Team"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
