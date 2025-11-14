
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Users, Save, Trash2, Mail, Key } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TeamSettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [teamData, setTeamData] = useState({
    name: "",
    description: ""
  });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (user.team_id) {
        const teams = await base44.entities.Team.filter({ id: user.team_id });
        if (teams.length > 0) {
          const teamData = teams[0];
          setTeam(teamData);
          setTeamData({
            name: teamData.name || "",
            description: teamData.description || ""
          });
        }
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      toast.error("Failed to load team data");
    }
    setIsLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await base44.entities.Team.update(team.id, teamData);
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
      const response = await base44.functions.invoke('deleteTeam', { team_id: team.id });
      
      if (response.data.success) {
        toast.success("Team deleted successfully");
        
        // Redirect to landing page
        window.location.href = createPageUrl("LandingPage");
      } else {
        throw new Error(response.data.error || 'Failed to delete team');
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team. Please try again.");
      setIsDeleting(false);
    }
  };

  const copyJoinCode = () => {
    if (team?.join_code) {
      navigator.clipboard.writeText(team.join_code);
      toast.success("Team code copied to clipboard!");
    }
  };

  const handleGenerateCoachCode = async () => {
    setIsGeneratingCode(true);
    
    try {
      const response = await base44.functions.invoke('generateCoachCode');
      
      if (response.data.success) {
        setGeneratedCode(response.data.invitation_code);
        toast.success("Coach invitation code generated!");
      } else {
        throw new Error(response.data.error || 'Failed to generate code');
      }
    } catch (error) {
      console.error("Error generating coach code:", error);
      toast.error(error.response?.data?.error || error.message || "Failed to generate code");
    }
    
    setIsGeneratingCode(false);
  };

  const copyCoachCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success("Coach invitation code copied!");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
              <Button 
                variant="outline" 
                onClick={copyJoinCode}
                className="w-full sm:w-auto flex-shrink-0"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
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
                      <p className="text-xs text-emerald-600 mt-2">Valid for 7 days • One-time use only</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={copyCoachCode}
                      className="w-full sm:w-auto flex-shrink-0 border-emerald-300 hover:bg-emerald-50"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setGeneratedCode(null)}
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
