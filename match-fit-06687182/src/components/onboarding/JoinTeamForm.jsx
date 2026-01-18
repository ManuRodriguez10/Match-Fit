import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function JoinTeamForm({ user, onComplete, onBack }) {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
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

      const { data: teams, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("join_code", joinCode.toUpperCase())
        .limit(1);

      if (teamError) {
        throw teamError;
      }

      if (!teams || teams.length === 0) {
        setError("Invalid team code. Please check the code and try again.");
        setIsSubmitting(false);
        return;
      }

      const team = teams[0];

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ team_id: team.id })
        .eq("id", authUser.id);

      if (profileError) {
        throw profileError;
      }

      onComplete();
    } catch (error) {
      console.error("Error joining team:", error);
      setError("There was an error joining the team. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]"></div>
          
          <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack} 
              className="mb-4 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#118ff3] to-[#0c5798] rounded-full flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent text-center">
              Join Your Team
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="joinCode" className="text-gray-700 font-medium">
                Team Code *
              </Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                required
                className="text-center text-2xl tracking-wider font-bold rounded-lg h-14 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 text-center">Ask your coach for this code.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack} 
                className="flex-1 rounded-lg border-gray-200 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? "Joining..." : "Join Team"}
              </Button>
            </div>
          </form>
          </div>
        </motion.div>

        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all text-white border-2 border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
