import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogIn, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import CreateTeamForm from "./CreateTeamForm";
import JoinTeamForm from "./JoinTeamForm";
import AcceptCoachCodeForm from "./AcceptCoachCodeForm";

export default function TeamOnboarding({ user, onComplete, onBackToRoleSelection }) {
  const [view, setView] = useState("choice"); // "choice", "create", "join", "acceptCoachCode"
  const navigate = useNavigate();
  
  const isCoach = user.team_role === "coach";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate(createPageUrl("LandingPage"));
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (view === "create" && isCoach) {
    return (
      <CreateTeamForm 
        user={user} 
        onComplete={onComplete}
        onBack={() => setView("choice")}
      />
    );
  }

  if (view === "join") {
    return (
      <JoinTeamForm 
        user={user} 
        onComplete={onComplete}
        onBack={() => setView("choice")}
      />
    );
  }

  if (view === "acceptCoachCode" && isCoach) {
    return (
      <AcceptCoachCodeForm 
        user={user} 
        onComplete={onComplete}
        onBack={() => setView("choice")}
      />
    );
  }

  // Choice screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {isCoach ? (
          // Coaches see two options: Create or Join
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/b49de559c_MatchFitSmallLogo.png" alt="MatchFit Logo" className="h-10 w-10 object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Setup</h1>
              <p className="text-gray-600">Create a new team or join an existing one</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Create Team Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-[var(--primary-main)]"
                onClick={() => setView("create")}
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">Create New Team</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Set up a new team and get a unique join code to invite players.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Name your team</li>
                    <li>• Get a unique team code</li>
                    <li>• Invite players instantly</li>
                    <li>• Full team management</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Join Existing Team Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-[var(--primary-main)]"
                onClick={() => setView("acceptCoachCode")}
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Join Existing Team</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Join an existing team's coaching staff using an invitation code.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Get code from head coach</li>
                    <li>• Join coaching staff</li>
                    <li>• Access team management</li>
                    <li>• Collaborate with team</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Players see original vertical layout
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/b49de559c_MatchFitSmallLogo.png" alt="MatchFit Logo" className="h-10 w-10 object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Your Team</h1>
              <p className="text-gray-600">Enter the team code provided by your coach</p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Join Your Team</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Your coach should have provided you with a team code. Enter it below to join your team.
                </p>
                <Button 
                  onClick={() => setView("join")}
                  className="w-full bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Enter Team Code
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Back to Role Selection Button */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={onBackToRoleSelection}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role Selection
          </Button>
        </div>

        {/* Logout Button - Centered at Bottom */}
        <div className="mt-4 text-center">
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