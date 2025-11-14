import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function JoinTeamForm({ user, onComplete, onBack }) {
  const [joinCode, setJoinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await base44.auth.logout(createPageUrl("LandingPage"));
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      // Find team by join code
      const teams = await base44.entities.Team.filter({ join_code: joinCode.toUpperCase() });
      
      if (teams.length === 0) {
        setError("Invalid team code. Please check the code and try again.");
        setIsSubmitting(false);
        return;
      }
      
      const team = teams[0];
      
      // Update user with team_id - this sets them as a player on the team
      await base44.auth.updateMe({
        team_id: team.id
      });
      
      onComplete();
    } catch (error) {
      console.error("Error joining team:", error);
      setError("There was an error joining the team. Please try again.");
      setIsSubmitting(false);
    }
  };

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
            <CardTitle>Join a Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="joinCode">Team Code *</Label>
                <Input
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-wider font-bold"
                />
                <p className="text-sm text-gray-500">
                  Your coach should have provided you with this code
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || joinCode.length !== 6}
                  className="flex-1 bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
                >
                  {isSubmitting ? "Joining..." : "Join Team"}
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