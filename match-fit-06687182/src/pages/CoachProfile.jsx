import React from "react";
import { useUser } from "../components/UserContext";
import CoachProfileForm from "../components/profile/CoachProfileForm";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { motion } from "framer-motion";

export default function CoachProfilePage() {
  const { currentUser, isLoadingUser, loadCurrentUser } = useUser();

  const handleProfileUpdate = () => {
    // Reload user data after successful update
    loadCurrentUser();
  };

  if (isLoadingUser) {
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

  if (currentUser.team_role !== "coach") {
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
            <p className="text-slate-600">This page is only available to coaches.</p>
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
        <CoachProfileForm user={currentUser} onUpdate={handleProfileUpdate} />
      </div>
    </div>
  );
}