
import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase } from "@/api/supabaseClient";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clipboard,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProvider, useUser } from "@/components/UserContext";
import { toast } from "sonner";

const TEAM_DEPENDENT_PAGES = ["Events", "Roster", "Lineups", "TeamSettings", "Profile", "PlayerRoster", "CoachProfile"];

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoadingUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const authFreePages = ["LandingPage", "Login", "Signup"];

  useEffect(() => {
    if (!isLoadingUser && !currentUser && !authFreePages.includes(currentPageName)) {
      window.location.href = createPageUrl("Login");
    }
  }, [isLoadingUser, currentUser, currentPageName]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const userTeamId = currentUser?.user_metadata?.team_id || currentUser?.team_id;
    if (!isLoadingUser && currentUser && !userTeamId && TEAM_DEPENDENT_PAGES.includes(currentPageName)) {
      navigate(createPageUrl("Dashboard"), { replace: true });
    }
  }, [isLoadingUser, currentUser, currentPageName, navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = createPageUrl("Login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  // Global CSS variables - always included
  const globalStyles = (
    <style>{`
      :root {
        --primary-main: #118ff3;
        --primary-dark: #0c5798;
        --primary-light: #e7f3fe;
        --text-on-primary: #ffffff;
      }
    `}</style>
  );

  // If still loading user data (except for landing page), show loading
  if (isLoadingUser && !currentUser && currentPageName !== "LandingPage") {
    return (
      <>
        {globalStyles}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-[var(--primary-main)] mb-4">Loading...</div>
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
      </>
    );
  }

  // If loading is complete, it's not an auth-free page, and there's no current user,
  // the useEffect above will handle the redirect. Don't render anything here.
  if (!currentUser && !isLoadingUser && !authFreePages.includes(currentPageName)) {
    return null;
  }

  // Check if user is in onboarding state (only after user is loaded)
  const userTeamRole = currentUser?.user_metadata?.team_role || currentUser?.team_role;
  const userTeamId = currentUser?.user_metadata?.team_id || currentUser?.team_id;
  const resolvedName =
    currentUser?.full_name ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" ") ||
    currentUser?.user_metadata?.full_name ||
    currentUser?.email ||
    "User";
  const resolvedInitial = resolvedName.trim().charAt(0)?.toUpperCase() || "U";

  const isOnboarding = currentPageName === "Dashboard" && currentUser && !userTeamId;

  // If landing page or onboarding, render without layout
  if (authFreePages.includes(currentPageName) || isOnboarding) {
    return (
      <>
        {globalStyles}
        {children}
      </>
    );
  }

  const coachNavigation = [
    { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { title: "Events", url: createPageUrl("Events"), icon: Calendar },
    { title: "Roster", url: createPageUrl("Roster"), icon: Users },
    { title: "Lineups", url: createPageUrl("Lineups"), icon: Clipboard },
    { title: "Profile", url: createPageUrl("CoachProfile"), icon: User },
    { title: "Team Settings", url: createPageUrl("TeamSettings"), icon: Settings },
  ];

  const playerNavigation = [
    { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { title: "Calendar", url: createPageUrl("Events"), icon: Calendar },
    { title: "Roster", url: createPageUrl("PlayerRoster"), icon: Users },
    { title: "Lineups", url: createPageUrl("Lineups"), icon: Clipboard },
    { title: "Profile", url: createPageUrl("Profile"), icon: User },
  ];

  const navigation = userTeamRole === "coach" ? coachNavigation : playerNavigation;

  // Hide sidebar on Dashboard, Events, Roster, PlayerRoster, Lineups, Profile, CoachProfile, and TeamSettings pages (uses navbar instead)
  const pagesWithoutSidebar = ["Dashboard", "Events", "Roster", "PlayerRoster", "Lineups", "Profile", "CoachProfile", "TeamSettings"];
  const showSidebar = !pagesWithoutSidebar.includes(currentPageName);

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary-main: #118ff3;
          --primary-dark: #0c5798;
          --primary-light: #e7f3fe;
          --text-on-primary: #ffffff;
        }

        .brand-gradient {
          background: linear-gradient(135deg, var(--primary-main) 0%, var(--primary-dark) 100%);
        }

        .page-gradient {
          background: linear-gradient(to bottom, #d4ebfc 0%, #e7f3fe 20%, rgba(255, 255, 255, 1) 60%);
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Mobile Header - Hidden on Dashboard (uses navbar instead) */}
      {showSidebar && (
        <header className="lg:hidden brand-gradient text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/b49de559c_MatchFitSmallLogo.png" alt="MatchFit Logo" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-lg">MatchFit</h1>
              <p className="text-xs opacity-90">
                {currentUser.team_role === "coach" ? "Coach Portal" : "Player Portal"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>
      )}

      <div className="flex">
        {/* Desktop Sidebar - Hidden on Dashboard (uses navbar instead) */}
        {showSidebar && (
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 brand-gradient">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 flex-shrink-0 px-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/b49de559c_MatchFitSmallLogo.png" alt="MatchFit Logo" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <h1 className="font-bold text-xl">MatchFit</h1>
                  <p className="text-xs opacity-90">
                    {currentUser.team_role === "coach" ? "Coach Portal" : "Player Portal"}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === item.url
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="flex-shrink-0 px-3 pb-3">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-blue-100 hover:bg-white/10 hover:text-white justify-start"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Log Out
              </Button>
            </div>

            {/* Desktop Sidebar - User Profile Section */}
            <div className="flex-shrink-0 flex border-t border-white/20 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {resolvedInitial}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {resolvedName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
        )}

        {/* Mobile Menu - Hidden on Dashboard (uses navbar instead) */}
        {showSidebar && mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 brand-gradient animate-slide-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center h-16 flex-shrink-0 px-6 text-white border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/b49de559c_MatchFitSmallLogo.png" alt="MatchFit Logo" className="h-6 w-6 object-contain" />
                    </div>
                    <h1 className="font-bold text-lg">MatchFit</h1>
                  </div>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        location.pathname === item.url
                          ? "bg-white/20 text-white"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.title}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Logout Button */}
                <div className="flex-shrink-0 px-3 pb-3">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full text-blue-100 hover:bg-white/10 hover:text-white justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Log Out
                  </Button>
                </div>

                {/* Mobile User Profile */}
                <div className="flex-shrink-0 flex border-t border-white/20 p-4">
                  <div className="flex items-center w-full">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {resolvedInitial}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {resolvedName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? "lg:pl-64" : ""}`}>
          <div className={`min-h-screen ${showSidebar ? "page-gradient" : ""}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <UserProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </UserProvider>
  );
}
