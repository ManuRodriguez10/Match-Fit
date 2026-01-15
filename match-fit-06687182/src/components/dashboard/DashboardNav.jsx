import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ClipboardList, 
  UserCircle, 
  Settings,
  Menu,
  X
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

  return (
    <nav className="relative z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#118ff3] to-[#0c5798] flex items-center justify-center shadow-lg shadow-[#118ff3]/30">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
              MatchFit
            </span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.page);
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                    ${active 
                      ? "bg-gradient-to-r from-[#118ff3] to-[#0c5798] text-white shadow-lg shadow-[#118ff3]/30" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-slate-200/60 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.page);
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
                    ${active 
                      ? "bg-gradient-to-r from-[#118ff3] to-[#0c5798] text-white shadow-lg shadow-[#118ff3]/20" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
