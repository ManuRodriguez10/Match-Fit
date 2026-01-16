import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase } from "@/api/supabaseClient";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ClipboardList, 
  UserCircle, 
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";

export default function DashboardNav({ user }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isCoach = user?.team_role === "coach";
  
  const coachNavItems = [
    { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
    { name: "Events", page: "Events", icon: Calendar },
    { name: "Roster", page: "Roster", icon: Users },
    { name: "Lineups", page: "Lineups", icon: ClipboardList },
    { name: "Profile", page: "CoachProfile", icon: UserCircle },
    { name: "Team Settings", page: "TeamSettings", icon: Settings },
  ];

  const playerNavItems = [
    { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
    { name: "Calendar", page: "Events", icon: Calendar },
    { name: "Roster", page: "PlayerRoster", icon: Users },
    { name: "Lineups", page: "Lineups", icon: ClipboardList },
    { name: "Profile", page: "Profile", icon: UserCircle },
  ];

  const navItems = isCoach ? coachNavItems : playerNavItems;

  const isActive = (page) => {
    const currentPath = location.pathname;
    if (page === "Dashboard") {
      return currentPath === "/Dashboard" || currentPath === "/" || currentPath === "";
    }
    return currentPath.includes(page) || currentPath === createPageUrl(page);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = createPageUrl("Login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="relative z-20 bg-white/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png"
              alt="MatchFit Logo"
              className="h-10 md:h-12 w-auto"
            />
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.page);
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all
                    ${active 
                      ? "bg-[#118ff3] text-white" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Logout Button - Desktop */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all text-white border-2 border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-700 ml-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.page);
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all
                    ${active 
                      ? "bg-[#118ff3] text-white" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Logout Button - Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all text-white border-2 border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-700 w-full"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
