import React from "react";
import { useUser } from "../components/UserContext";
import PlayerProfileForm from "../components/profile/PlayerProfileForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Lock, User } from "lucide-react";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { currentUser, isLoadingUser, loadCurrentUser } = useUser();

  const handleProfileUpdate = () => {
    // Reload user data after successful update
    loadCurrentUser();
  };

  if (isLoadingUser && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.team_role !== "player") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h3>
            <p className="text-slate-600">This page is only available to players.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Check if player profile is incomplete
  const isPlayerProfileIncomplete = !currentUser.position || !currentUser.jersey_number;

  if (isPlayerProfileIncomplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={currentUser} />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
              <CardContent className="py-12 text-center">
                <Lock className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Complete Player Profile to Unlock Access
                </h3>
                <p className="text-slate-600 mb-6">
                  You need to complete your player profile before you can edit your profile information.
                </p>
                <Link to={createPageUrl("Dashboard")}>
                  <Button className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white shadow-lg shadow-[#118ff3]/30 rounded-xl">
                    <User className="w-4 h-4 mr-2" />
                    Complete Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
      <DashboardBackground />
      <DashboardNav user={currentUser} />
      <div className="relative z-10">
        <PlayerProfileForm user={currentUser} onUpdate={handleProfileUpdate} />
      </div>
    </div>
  );
}