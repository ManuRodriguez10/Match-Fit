import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogIn, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {isCoach ? (
          // Coaches see two options: Create or Join
          <div>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png" alt="MatchFit Logo" className="h-12 w-auto object-contain" />
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-4">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png" alt="MatchFit Logo" className="h-12 w-auto object-contain" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent mb-2">
                Join Your Team
              </h1>
              <p className="text-gray-600">Enter the team code provided by your coach</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-md mx-auto"
            >
              <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {/* Gradient accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]"></div>
                
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#118ff3] to-[#0c5798] rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                      Join Your Team
                    </h2>
                  </div>
                  
                  <div className="text-center space-y-6">
                    <p className="text-gray-600">
                      Your coach should have provided you with a team code. Enter it below to join your team.
                    </p>
                    <Button 
                      onClick={() => setView("join")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 h-12"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Enter Team Code
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Logout Button - Centered at Bottom */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all text-white border-2 border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-700 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}