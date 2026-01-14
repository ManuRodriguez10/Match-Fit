import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut } from "lucide-react";

export default function AcceptCoachCodeForm({ user, onComplete, onBack }) {
  const navigate = useNavigate();
  const [invitationCode, setInvitationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate(createPageUrl("LandingPage"));
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ team_id: targetTeamId })
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
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <Button variant="ghost" size="icon" onClick={onBack} className="mb-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle>Join Existing Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="invitationCode">Team Code *</Label>
                <Input
                  id="invitationCode"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-wider font-bold"
                />
                <p className="text-sm text-gray-500">
                  Your head coach should have provided you with this team code
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
                >
                  {isSubmitting ? "Joining..." : "Join Team"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
