import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogIn, LogOut } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CreateTeamForm from "./CreateTeamForm";
import JoinTeamForm from "./JoinTeamForm";
import AcceptCoachCodeForm from "./AcceptCoachCodeForm";

export default function TeamOnboarding({ user, onComplete }) {
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
                Team Setup
              </h1>
              <p className="text-gray-600">Create a new team or join an existing one</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Create Team Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="cursor-pointer"
                onClick={() => setView("create")}
              >
                <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  {/* Gradient accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]"></div>
                  
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent mb-3">
                      Create New Team
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Set up a new team and get a unique join code to invite players.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 text-left max-w-xs mx-auto">
                      <li>• Name your team</li>
                      <li>• Get a unique team code</li>
                      <li>• Invite players instantly</li>
                      <li>• Full team management</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Join Existing Team Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="cursor-pointer"
                onClick={() => setView("acceptCoachCode")}
              >
                <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  {/* Gradient accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]"></div>
                  
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#118ff3] to-[#0c5798] rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent mb-3">
                      Join Existing Team
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Join an existing team's coaching staff using an invitation code.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 text-left max-w-xs mx-auto">
                      <li>• Get code from head coach</li>
                      <li>• Join coaching staff</li>
                      <li>• Access team management</li>
                      <li>• Collaborate with team</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
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

        {/* Logout Button - Only on choice screen */}
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