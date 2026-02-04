import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../components/UserContext";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Users, Save, Trash2, Key, ArrowLeft, Info, UserPlus, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { motion } from "framer-motion";

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
  const [view, setView] = useState(null); // null = initial, "info" = team information, "invite" = invite members, "danger" = danger zone

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
        toast.error("Failed to load team data");
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
      toast.error("Failed to load team data");
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
      toast.error("Failed to save team settings");
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
      toast.error(error.message || "Failed to delete team. Please try again.");
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
        toast.error(error.message || "Failed to generate code. Please try again.");
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
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          </div>
        </div>
      </div>
    );
  }

  // Only coaches can access team settings
  if (currentUser?.team_role !== "coach") {
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
            <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h3>
            <p className="text-slate-600">Only coaches can access team settings.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!team) {
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Team Found</h3>
            <p className="text-slate-600">Unable to load team information.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const isHeadCoach = currentUser?.coach_role === "head_coach";

  // Initial view with section buttons
  if (!view) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                  Team Settings
                </span>
              </h1>
              <p className="text-slate-600 text-lg">Manage your team's information and settings</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team Information Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={() => setView("info")}
                className="w-full bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:border-slate-300/80 transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#118ff3] to-[#0c5798] flex items-center justify-center mb-4 shadow-lg shadow-[#118ff3]/30 group-hover:scale-110 transition-transform">
                  <Info className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Team Information</h3>
                <p className="text-slate-600 text-sm">Update your team name and description</p>
              </button>
            </motion.div>

            {/* Invite Members Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => setView("invite")}
                className="w-full bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:border-slate-300/80 transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#118ff3] to-[#0c5798] flex items-center justify-center mb-4 shadow-lg shadow-[#118ff3]/30 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Invite Members</h3>
                <p className="text-slate-600 text-sm">Invite players and coaches to your team</p>
              </button>
            </motion.div>

            {/* Danger Zone Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setView("danger")}
                className="w-full bg-white/80 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:border-red-300/80 transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-4 shadow-lg shadow-red-600/30 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-slate-600 text-sm">Delete your team and all associated data</p>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
      <DashboardBackground />
      <DashboardNav user={currentUser} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                Team Settings
              </span>
            </h1>
            <p className="text-slate-600 text-lg">Manage your team's information and settings</p>
          </div>
          <Button
            onClick={() => setView(null)}
            className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-[#118ff3]/30"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Settings
          </Button>
        </motion.div>

        {/* Team Information View */}
        {view === "info" && (
          <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
            <CardHeader className="border-b border-slate-200/50">
              <CardTitle className="text-xl font-bold text-slate-900">Team Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">Team Name</Label>
                  <Input
                    id="name"
                    value={teamData.name}
                    onChange={(e) => setTeamData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Thunder Hawks"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">Team Description</Label>
                  <Textarea
                    id="description"
                    value={teamData.description}
                    onChange={(e) => setTeamData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell us about your team..."
                    rows={4}
                    className="rounded-xl"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl shadow-lg shadow-[#118ff3]/30 px-6 py-6 h-auto"
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
        )}

        {/* Invite Members View */}
        {view === "invite" && (
          <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
            <CardHeader className="border-b border-slate-200/50">
              <CardTitle className="text-xl font-bold text-slate-900">Invite Members</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Invite Players */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Invite Players</h3>
                  <p className="text-slate-600 text-sm">
                    Share this code with players so they can join your team during registration.
                  </p>
                </div>
                <div className="bg-slate-50/80 backdrop-blur-xl border-2 border-dashed border-slate-300/50 rounded-xl p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-slate-500 mb-1 font-medium">Player Team Code</p>
                      <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent tracking-wider break-all">
                        {team.join_code}
                      </p>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
                      <Button 
                        onClick={copyJoinCode}
                        disabled={isCopyingJoinCode}
                        className="w-full sm:w-auto flex-shrink-0 bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl shadow-lg"
                      >
                        <Copy className={`w-4 h-4 mr-2 ${isCopyingJoinCode ? "animate-pulse" : ""}`} />
                        {isCopyingJoinCode ? "Copying..." : "Copy Code"}
                      </Button>
                      {copyIndicators.player && (
                        <span className="text-xs text-emerald-600 font-medium">Code copied to clipboard</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invite Coaches - Full access for head coach, crossed off for assistant coach */}
              <div className={`border-t border-slate-200/50 pt-6 ${!isHeadCoach ? "opacity-60" : ""}`}>
                {!isHeadCoach && (
                  <p className="text-amber-700 text-sm font-medium mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    This section is only available to the head coach.
                  </p>
                )}
                <div className={!isHeadCoach ? "pointer-events-none select-none" : ""}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Invite Coaches</h3>
                      <p className="text-slate-600 text-sm">
                        Generate a one-time code to invite another coach to join your coaching staff.
                      </p>
                    </div>
                    
                    {!generatedCode ? (
                        <motion.div
                          animate={isGeneratingCode ? { scale: [1, 1.02, 1] } : {}}
                          transition={{ duration: 0.5, repeat: isGeneratingCode ? Infinity : 0 }}
                        >
                          <Button 
                            onClick={handleGenerateCoachCode}
                            disabled={isGeneratingCode}
                            className={`bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl shadow-lg shadow-[#118ff3]/30 px-6 py-6 h-auto transition-all ${
                              isGeneratingCode ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                          >
                            {isGeneratingCode ? (
                              <>
                                <Key className="w-4 h-4 mr-2 animate-spin" />
                                Generating Code...
                              </>
                            ) : (
                              <>
                                <Key className="w-4 h-4 mr-2" />
                                Generate One-Time Code
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-emerald-50/80 backdrop-blur-xl border-2 border-emerald-200/50 rounded-xl p-4 md:p-6 shadow-lg">
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
                                  onClick={copyCoachCode}
                                  disabled={isCopyingCoachCode}
                                  className="w-full sm:w-auto flex-shrink-0 bg-white/80 backdrop-blur-xl border border-emerald-300/50 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl shadow-lg"
                                >
                                  <Copy className={`w-4 h-4 mr-2 ${isCopyingCoachCode ? "animate-pulse" : ""}`} />
                                  {isCopyingCoachCode ? "Copying..." : "Copy Code"}
                                </Button>
                                {copyIndicators.coach && (
                                  <span className="text-xs text-emerald-600 font-medium">Coach code copied</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <motion.div
                            animate={isGeneratingCode ? { scale: [1, 1.02, 1] } : {}}
                            transition={{ duration: 0.5, repeat: isGeneratingCode ? Infinity : 0 }}
                          >
                            <Button 
                              onClick={handleGenerateCoachCode}
                              disabled={isGeneratingCode}
                              className={`w-full sm:w-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl shadow-lg transition-all ${
                                isGeneratingCode ? 'opacity-75 cursor-not-allowed' : ''
                              }`}
                            >
                              {isGeneratingCode ? (
                                <>
                                  <Key className="w-4 h-4 mr-2 animate-spin" />
                                  Generating New Code...
                                </>
                              ) : (
                                <>
                                  <Key className="w-4 h-4 mr-2" />
                                  Generate New Code
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      )}
                      
                      <div className="bg-blue-50/80 backdrop-blur-xl border border-blue-200/50 rounded-xl p-4">
                        <p className="text-sm text-slate-700">
                          <strong className="font-semibold">Important:</strong> Share this code with the coach you want to invite. This code can only be used once and will expire after 7 days. The invited coach must enter this code during their onboarding process to join your staff.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone View - Full access for head coach, crossed off for assistant coach */}
        {view === "danger" && (
          <Card className="bg-white/80 backdrop-blur-xl border border-red-200/50 shadow-lg rounded-3xl">
            <CardHeader className="border-b border-red-200/50">
              <CardTitle className="text-xl font-bold text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className={!isHeadCoach ? "opacity-60" : ""}>
                {!isHeadCoach && (
                  <p className="text-amber-700 text-sm font-medium mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    Only the head coach can delete the team.
                  </p>
                )}
                <div className={!isHeadCoach ? "pointer-events-none select-none" : ""}>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Delete Team</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Once you delete your team, there is no going back. This will permanently delete all team data including events, lineups, and disassociate all members from the team.
                    </p>
                    <Button
                      onClick={handleDeleteTeam}
                      disabled={isDeleting || !isHeadCoach}
                      className="bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 rounded-xl shadow-lg px-6 py-6 h-auto"
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
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
