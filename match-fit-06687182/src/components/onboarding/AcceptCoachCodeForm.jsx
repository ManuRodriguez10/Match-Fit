import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AcceptCoachCodeForm({ user, onComplete, onBack }) {
  const [invitationCode, setInvitationCode] = useState("");
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
      // Find invitation by code
      const invitations = await base44.entities.CoachInvitation.filter({ 
        invitation_token: invitationCode.toUpperCase(),
        status: 'pending'
      });
      
      if (invitations.length === 0) {
        setError("Invalid or expired invitation code. Please check the code and try again.");
        setIsSubmitting(false);
        return;
      }
      
      const invitation = invitations[0];
      
      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        setError("This invitation code has expired. Please request a new code from your head coach.");
        await base44.entities.CoachInvitation.update(invitation.id, { status: 'expired' });
        setIsSubmitting(false);
        return;
      }
      
      // Check if user already has a team
      if (user.team_id && user.team_id !== invitation.team_id) {
        setError("You're already part of another team. Please leave that team first.");
        setIsSubmitting(false);
        return;
      }
      
      // Accept the invitation - update user with team_id
      await base44.auth.updateMe({
        team_id: invitation.team_id
      });
      
      // Mark invitation as accepted
      await base44.entities.CoachInvitation.update(invitation.id, { status: 'accepted' });
      
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle>Join Coaching Staff</CardTitle>
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
                <Label htmlFor="invitationCode">Invitation Code *</Label>
                <Input
                  id="invitationCode"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  maxLength={8}
                  required
                  className="text-center text-2xl tracking-wider font-bold"
                />
                <p className="text-sm text-gray-500">
                  Your head coach should have provided you with this one-time code
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || invitationCode.length !== 8}
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