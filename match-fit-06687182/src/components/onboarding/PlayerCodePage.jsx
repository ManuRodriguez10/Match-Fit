import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Copy, Users, Settings } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function PlayerCodePage({ user, onComplete }) {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.team_id) return;
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("join_code, name")
          .eq("id", user.team_id)
          .single();
        if (error) throw error;
        setTeam(data);
      } catch (error) {
        console.error("Error fetching team:", error);
        toast.error("Failed to load team information");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [user?.team_id]);

  const handleCopyCode = async () => {
    if (!team?.join_code) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(team.join_code);
      toast.success("Player code copied to clipboard!");
    } catch {
      toast.error("Failed to copy code");
    } finally {
      setIsCopying(false);
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  const handleGoToTeamSettings = () => {
    navigate(createPageUrl("TeamSettings"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-pulse text-[#118ff3] mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]"></div>
          
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent text-center">
                Invite Players to Your Team
              </h1>
              <p className="text-gray-600 text-center mt-2 text-sm">
                Share this code with players so they can join <strong>{team?.name}</strong>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-[#e7f3fe] rounded-xl p-6 border-2 border-dashed border-[#118ff3]/30">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Player Team Code</p>
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent tracking-wider break-all">
                    {team?.join_code || "Loading..."}
                  </p>
                </div>
                <Button
                  onClick={handleCopyCode}
                  disabled={isCopying || !team?.join_code}
                  className="w-full bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300 rounded-lg shadow-lg"
                >
                  <Copy className={`w-4 h-4 mr-2 ${isCopying ? "animate-pulse" : ""}`} />
                  {isCopying ? "Copying..." : "Copy Code"}
                </Button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium mb-1">Need to invite coaches?</p>
                    <p className="text-xs text-amber-700">
                      This code is only for players. To invite coaches, go to{" "}
                      <button
                        onClick={handleGoToTeamSettings}
                        className="underline font-semibold hover:text-amber-900"
                      >
                        Team Settings
                      </button>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Continue to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
