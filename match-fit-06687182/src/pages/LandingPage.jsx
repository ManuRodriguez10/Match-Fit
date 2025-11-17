
import React, { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Trophy, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data?.session) {
        navigate(createPageUrl("Dashboard"));
        return;
      }
    } catch (error) {
      console.log("User not authenticated, showing landing page");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = () => {
    navigate(createPageUrl("Login"));
  };

  const handleSignUp = () => {
    navigate(createPageUrl("Signup"));
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-[var(--primary-main)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <style>{`
        :root {
          --primary-main: #118ff3;
          --primary-dark: #0c5798;
          --primary-light: #e7f3fe;
        }
      `}</style>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Marketing Content */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png"
                alt="MatchFit Logo"
                className="h-16 md:h-20 w-auto"
              />
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Simplify Team Management
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                The all-in-one platform for coaches and players to stay organized, connected, and ready for game day.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-lg text-gray-700">Schedule events and track attendance</p>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-lg text-gray-700">Manage your roster effortlessly</p>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-lg text-gray-700">Build and publish game lineups</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start">
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Log In
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center gap-2 justify-center lg:justify-start text-sm text-gray-600">
            </div>
          </div>

          {/* Right Side - Laptop Image Only */}
          <div className="relative order-1 lg:order-2 flex justify-center items-center min-h-[400px]">
            <div className="w-full max-w-md">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/4505875ae_AdobeExpress-file2.png"
                alt="MatchFit on Laptop"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Phone Image */}
      <div className="bg-white py-16 lg:py-24 mt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              MatchFit brings coaches and players together with powerful tools designed for modern team management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Phone Image */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-sm">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/cc5a358c7_AdobeExpress-file1.png"
                  alt="MatchFit on Phone"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Right Side - Feature Cards in Triangle/Staggered Layout */}
            <div className="order-1 lg:order-2 space-y-8">
              {/* Feature 1 - Top */}
              <div className="lg:ml-0">
                <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Scheduling</h3>
                    <p className="text-gray-600">
                      Create games, practices, and meetings with ease. Players get instant notifications and can confirm their attendance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Middle (shifted right) */}
              <div className="lg:ml-12">
                <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-white rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Team Roster</h3>
                    <p className="text-gray-600">
                      Keep all player information organized in one place. Track positions, contact details, and player stats effortlessly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 - Bottom (shifted right more) */}
              <div className="lg:ml-24">
                <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lineup Builder</h3>
                    <p className="text-gray-600">
                      Create game lineups with our intuitive drag-and-drop interface. Publish lineups and notify your team instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[var(--primary-main)] to-[var(--primary-dark)] py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Team Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join coaches and players who are already using MatchFit to stay organized and focused on what matters most - the game.
          </p>
          <Button
            onClick={handleSignUp}
            size="lg"
            className="bg-white text-[var(--primary-main)] hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Login
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
