import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy, CheckCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function CreateTeamForm({ user, onComplete, onBack }) {
  const [teamData, setTeamData] = useState({
    name: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTeam, setCreatedTeam] = useState(null);

  const handleLogout = async () => {
    try {
      await base44.auth.logout(createPageUrl("LandingPage"));
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const generateJoinCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const joinCode = generateJoinCode();
      
      const team = await base44.entities.Team.create({
        ...teamData,
        sport: "soccer",
        join_code: joinCode,
        created_by: user.email
      });
      
      await base44.auth.updateMe({
        team_id: team.id
      });
      
      setCreatedTeam(team);
    } catch (error) {
      console.error("Error creating team:", error);
      alert("There was an error creating your team. Please try again.");
      setIsSubmitting(false);
    }
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(createdTeam.join_code);
    toast.success("Team code copied to clipboard!");
  };

  if (createdTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Team Created Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Share this code with your players so they can join <strong>{createdTeam.name}</strong>:
                </p>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <p className="text-4xl font-bold text-[var(--primary-main)] tracking-wider mb-3">
                    {createdTeam.join_code}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={copyJoinCode}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Team Code
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Players will need this code to join your team. You can find it later in your team settings.
                </p>
              </div>
              
              <Button 
                onClick={onComplete}
                className="w-full bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Logout Button - Centered at Bottom */}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle>Create Your Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={teamData.name}
                  onChange={(e) => setTeamData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Thunder Hawks"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={teamData.description}
                  onChange={(e) => setTeamData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us about your team..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
                >
                  {isSubmitting ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Logout Button - Centered at Bottom */}
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