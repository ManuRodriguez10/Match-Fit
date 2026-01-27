import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../components/UserContext";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Users, Save, Trash2, Key } from "lucide-react";
import { toast } from "sonner";
import { formatOperationError, isNetworkError } from "@/utils/errorHandling";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from "date-fns";

export default function TeamSettingsPage() {
  const location = useLocation();
  const { currentUser, isLoadingUser } = useUser();
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [teamData, setTeamData] = useState({
    name: "",
    description: ""
  });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [generatedCodeExpiry, setGeneratedCodeExpiry] = useState(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isCopyingJoinCode, setIsCopyingJoinCode] = useState(false);
  const [isCopyingCoachCode, setIsCopyingCoachCode] = useState(false);
  const [copyIndicators, setCopyIndicators] = useState({ player: false, coach: false });
  const copyIndicatorTimeouts = useRef({ player: null, coach: null });
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadTeamData();
    }
    
    // Cleanup: Reset generated code state when component unmounts
    return () => {
      setGeneratedCode(null);
      setGeneratedCodeExpiry(null);
    };
  }, [currentUser, location.pathname]);

  const loadTeamData = async () => {
    if (!currentUser?.team_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: teamData, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', currentUser.team_id)
        .single();

      if (error) {
        console.error("Error loading team:", error);
        toast.error(formatOperationError(error, "load team data", isNetworkError(error)));
      } else {
        setTeam(teamData);
        setTeamData({
          name: teamData.name || "",
          description: teamData.description || ""
        });
        // Don't automatically load active coach invite - only show code when explicitly generated
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      toast.error(formatOperationError(error, "load team data", isNetworkError(error)));
    }
    setIsLoading(false);
  };

  const loadActiveCoachInvite = async (teamId) => {
    try {
      const { data, error } = await supabase
        .from("coach_invites")
        .select("*")
        .eq("team_id", teamId)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        setGeneratedCode(null);
        setGeneratedCodeExpiry(null);
        return;
      }

      if (data) {
        setGeneratedCode(data.code);
        setGeneratedCodeExpiry(data.expires_at);
      } else {
        setGeneratedCode(null);
        setGeneratedCodeExpiry(null);
      }
    } catch (error) {
      console.warn("Coach invite lookup failed:", error.message);
      setGeneratedCode(null);
      setGeneratedCodeExpiry(null);
    }
  };

  const copyTextToClipboard = async (value, successMessage) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success(successMessage, { position: "top-center", duration: 2000 });
    } catch (error) {
      console.error("Clipboard error:", error);
      toast.error("Unable to copy to clipboard. Please try again.", { position: "top-center" });
      throw error;
    }
  };

  const triggerCopyIndicator = (key) => {
    if (copyIndicatorTimeouts.current[key]) {
      clearTimeout(copyIndicatorTimeouts.current[key]);
    }
    setCopyIndicators(prev => ({ ...prev, [key]: true }));
    copyIndicatorTimeouts.current[key] = setTimeout(() => {
      setCopyIndicators(prev => ({ ...prev, [key]: false }));
    }, 1800);
  };

  useEffect(() => {
    return () => {
      Object.values(copyIndicatorTimeouts.current).forEach((timeoutId) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      });
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('teams')
        .update(teamData)
        .eq('id', team.id);

      if (error) {
        throw error;
      }

      setTeam({ ...team, ...teamData });
      toast.success("Team settings saved successfully!");
    } catch (error) {
      console.error("Error saving team:", error);
      toast.error(formatOperationError(error, "save team settings", isNetworkError(error)));
    }
    setIsSaving(false);
  };

  const handleDeleteTeam = async () => {
    const confirmText = window.prompt(
      `This action is PERMANENT and will delete all team data including events, lineups, and disassociate all members.\n\nType "${team.name}" to confirm deletion:`
    );
    
    if (confirmText !== team.name) {
      if (confirmText !== null) {
        toast.error("Team name did not match. Deletion cancelled.");
      }
      return;
    }

    setIsDeleting(true);
    
    try {
      const teamId = team.id;

      const cleanupResults = await Promise.all([
        supabase.from("profiles").update({ team_id: null, team_role: null }).eq("team_id", teamId),
        supabase.from("events").delete().eq("team_id", teamId),
        supabase.from("lineups").delete().eq("team_id", teamId),
        supabase.from("coach_invites").delete().eq("team_id", teamId)
      ]);

      const cleanupError = cleanupResults.find((result) => result.error)?.error;
      if (cleanupError) {
        throw cleanupError;
      }

      const { error: deleteTeamError } = await supabase.from('teams').delete().eq('id', teamId);
      if (deleteTeamError) {
        throw deleteTeamError;
      }

      toast.success("Team deleted successfully.");
      navigate(createPageUrl("Dashboard"), { replace: true });
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error(formatOperationError(error, "delete team", isNetworkError(error)));
      setIsDeleting(false);
      return;
    }

    setIsDeleting(false);
  };

  const copyJoinCode = async () => {
    if (!team?.join_code || isCopyingJoinCode) return;
    setIsCopyingJoinCode(true);
    try {
      await copyTextToClipboard(team.join_code, "Team code copied to clipboard!");
      triggerCopyIndicator("player");
    } finally {
      setIsCopyingJoinCode(false);
    }
  };

  const handleGenerateCoachCode = async () => {
    if (!team || isGeneratingCode) return;
    setIsGeneratingCode(true);
    
    try {
      await supabase
        .from("coach_invites")
        .update({ used: true })
        .eq("team_id", team.id)
        .eq("used", false);

      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const code = Array.from({ length: 6 })
        .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
        .join("");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from("coach_invites")
        .insert({
          team_id: team.id,
          code,
          created_by: currentUser.id,
          expires_at: expiresAt.toISOString(),
          used: false
        })
        .select();

      if (error) {
        throw error;
      }

      const invite = Array.isArray(data) ? data[0] : data;
      if (!invite) {
        throw new Error("Unable to create invite code. Please try again.");
      }

      setGeneratedCode(invite.code);
      setGeneratedCodeExpiry(invite.expires_at);
      toast.success("Coach invitation code generated!", { position: "top-center", duration: 2500 });
    } catch (error) {
      console.error("Error generating coach code:", error);
      if (error?.code === "42P01") {
        toast.error("Missing coach_invites table in Supabase. Please run the latest SQL migration.");
      } else {
        toast.error(formatOperationError(error, "generate coach invite code", isNetworkError(error)));
      }
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyCoachCode = async () => {
    if (!generatedCode || isCopyingCoachCode) return;
    setIsCopyingCoachCode(true);
    try {
      await copyTextToClipboard(generatedCode, "Coach invitation code copied!");
      triggerCopyIndicator("coach");
    } finally {
      setIsCopyingCoachCode(false);
    }
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

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
        </div>
      </div>
    );
  }

  // Only coaches can access team settings
  if (currentUser?.team_role !== "coach") {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">Only coaches can access team settings.</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Found</h3>
          <p className="text-gray-600">Unable to load team information.</p>
        </div>
      </div>
    );
  }

  const isHeadCoach = currentUser?.coach_role === "head_coach";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Settings</h1>
        <p className="text-gray-600 mt-1">Manage your team's information and settings</p>
        <div className="mt-4">
          <Link to={createPageUrl("Roster")}>
            <Button variant="outline" className="w-full sm:w-auto">
              <Users className="w-4 h-4 mr-2" />
              View Team Members
            </Button>
          </Link>
        </div>
      </div>

      {/* Team Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={teamData.name}
                onChange={(e) => setTeamData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Thunder Hawks"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Team Description</Label>
              <Textarea
                id="description"
                value={teamData.description}
                onChange={(e) => setTeamData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell us about your team..."
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSaving}
              className="w-full sm:w-auto bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
            >
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team Invite Code - Players */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Players</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm md:text-base">
            Share this code with players so they can join your team during registration.
          </p>
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 mb-1">Player Team Code</p>
                <p className="text-2xl md:text-4xl font-bold text-[var(--primary-main)] tracking-wider break-all">
                  {team.join_code}
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={copyJoinCode}
                  disabled={isCopyingJoinCode}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  <Copy className={`w-4 h-4 mr-2 ${isCopyingJoinCode ? "animate-pulse" : ""}`} />
                  {isCopyingJoinCode ? "Copying..." : "Copy Code"}
                </Button>
                {copyIndicators.player && (
                  <span className="text-xs text-emerald-600">Code copied to clipboard</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Coaches - Only for Head Coaches */}
      {isHeadCoach && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Coaches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm md:text-base">
              Generate a one-time code to invite another coach to join your coaching staff.
            </p>
            
            {!generatedCode ? (
              <Button 
                onClick={handleGenerateCoachCode}
                disabled={isGeneratingCode}
                className="w-full sm:w-auto bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
              >
                {isGeneratingCode ? (
                  <>
                    <Key className="w-4 h-4 mr-2 animate-pulse" />
                    Generating Code...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Generate One-Time Code
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-emerald-600 font-medium mb-1">Coach Invitation Code</p>
                      <p className="text-2xl md:text-3xl font-bold text-emerald-700 tracking-wider break-all">
                        {generatedCode}
                      </p>
                      {generatedCodeExpiry ? (
                        <p className="text-xs text-emerald-600 mt-2">
                          Expires {formatDistanceToNow(new Date(generatedCodeExpiry), { addSuffix: true })} • One-time use only
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-600 mt-2">Valid for 7 days • One-time use only</p>
                      )}
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        onClick={copyCoachCode}
                        disabled={isCopyingCoachCode}
                        className="w-full sm:w-auto flex-shrink-0 border-emerald-300 hover:bg-emerald-50"
                      >
                        <Copy className={`w-4 h-4 mr-2 ${isCopyingCoachCode ? "animate-pulse" : ""}`} />
                        {isCopyingCoachCode ? "Copying..." : "Copy Code"}
                      </Button>
                      {copyIndicators.coach && (
                        <span className="text-xs text-emerald-600">Coach code copied</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleGenerateCoachCode}
                  className="w-full sm:w-auto"
                >
                  Generate New Code
                </Button>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Important:</strong> Share this code with the coach you want to invite. This code can only be used once and will expire after 7 days. The invited coach must enter this code during their onboarding process to join your staff.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone - Delete Team */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Delete Team</h4>
            <p className="text-sm text-gray-600 mb-4">
              Once you delete your team, there is no going back. This will permanently delete all team data including events, lineups, and disassociate all members from the team.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteTeam}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Trash2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting Team...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Team
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
