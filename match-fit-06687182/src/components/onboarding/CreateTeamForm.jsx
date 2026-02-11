import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateTeamForm({ user, onComplete, onBack }) {
  const [teamData, setTeamData] = useState({
    name: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateJoinCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user: authUser },
        error: authError
      } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error("User not authenticated");
      }

      const joinCode = generateJoinCode();

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamData.name,
          description: teamData.description || null,
          sport: "soccer",
          join_code: joinCode,
          created_by: authUser.email
        })
        .select()
        .single();

      if (teamError) {
        throw teamError;
      }

      // Update profile: set team_id, team_role, and ensure creator is head coach.
      // Set profile_completed_for_team_id to null so they must complete profile for this new team.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          team_id: team.id,
          team_role: "coach",
          coach_role: "head_coach", // Creator is always head coach
          profile_completed_for_team_id: null
        })
        .eq("id", authUser.id);

      if (profileError) {
        throw profileError;
      }

      // Team created and profile associated. Let the parent (Dashboard)
      // decide the next step (typically coach profile completion) by
      // reloading the current user.
      await onComplete();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error creating team:", error);
      alert("There was an error creating your team. Please try again.");
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
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent text-center">
                Create Your Team
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">Team Name *</Label>
                <Input
                  id="name"
                  value={teamData.name}
                  onChange={(e) => setTeamData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Thunder Hawks"
                  className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-medium">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={teamData.description}
                  onChange={(e) => setTeamData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us about your team..."
                  rows={3}
                  className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

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
                  className="flex-1 bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
