import React, { useState, useEffect } from "react"
import { supabase } from "@/api/supabaseClient"
import { useNavigate } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, Trophy, CheckCircle, Sparkles } from "lucide-react"
import { AnimatedBackground } from "@/components/landing/AnimatedBackground"
import { FloatingElements } from "@/components/landing/FloatingElements"
import { GradientOrbs } from "@/components/landing/GradientOrbs"
import { SoccerFieldBackground } from "@/components/landing/SoccerFieldBackground"

export default function LandingPage() {
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    setIsLoaded(true)
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      if (data?.session) {
        navigate(createPageUrl("Dashboard"))
        return
      }
    } catch (error) {
      console.log("User not authenticated, showing landing page")
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleLogin = () => {
    navigate(createPageUrl("Login"))
  }

  const handleSignUp = () => {
    navigate(createPageUrl("Signup"))
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] flex items-center justify-center">
        <div className="animate-pulse text-[#118ff3]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
      {/* Dynamic Backgrounds */}
      <AnimatedBackground />
      <GradientOrbs />
      <FloatingElements />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          {/* Left Side - Marketing Content */}
          <div
            className={`space-y-8 text-center lg:text-left transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Logo with glow effect */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div className="absolute inset-0 bg-[#118ff3]/20 blur-xl rounded-full scale-150" />
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png"
                  alt="MatchFit Logo"
                  className="h-16 md:h-20 w-auto relative"
                />
              </div>
            </div>

            {/* Headline with gradient text */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#118ff3]/10 border border-[#118ff3]/20 text-[#0c5798] text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Team Management Made Simple
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                <span className="text-gray-900">Simplify </span>
                <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                  Team Management
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed text-pretty">
                The all-in-one platform for coaches and players to stay organized, connected, and ready for game day.
              </p>
            </div>

            {/* Features List with animations */}
            <div className="space-y-4">
              {[
                {
                  icon: Calendar,
                  text: "Schedule events and track attendance",
                  color: "bg-[#118ff3]/10",
                  iconColor: "text-[#118ff3]",
                  delay: "100ms",
                },
                {
                  icon: Users,
                  text: "Manage your roster effortlessly",
                  color: "bg-emerald-100",
                  iconColor: "text-emerald-600",
                  delay: "200ms",
                },
                {
                  icon: Trophy,
                  text: "Build and publish game lineups",
                  color: "bg-amber-100",
                  iconColor: "text-amber-600",
                  delay: "300ms",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 justify-center lg:justify-start transition-all duration-700 ${
                    isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                  }`}
                  style={{ transitionDelay: feature.delay }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <p className="text-lg text-gray-700 font-medium">{feature.text}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-[#118ff3] hover:bg-[#0c5798] text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#118ff3]/25 transition-all group"
              >
                Log In
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={handleSignUp}
                variant="outline"
                size="lg"
                className="border-2 border-[#118ff3]/30 text-[#0c5798] hover:bg-[#118ff3]/10 px-8 py-6 text-lg font-semibold rounded-xl transition-all bg-transparent"
              >
                Create Account
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-4 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Free to start
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                No credit card required
              </div>
            </div>
          </div>

          {/* Right Side - Dynamic Visual */}
          <div
            className={`relative flex justify-center items-center transition-all duration-1000 delay-300 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border-2 border-[#118ff3]/20 animate-spin-slow" />
              <div
                className="absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full border border-[#118ff3]/10 animate-spin-slow"
                style={{ animationDirection: "reverse", animationDuration: "25s" }}
              />
              <div
                className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full border border-dashed border-[#118ff3]/10 animate-spin-slow"
                style={{ animationDuration: "30s" }}
              />
            </div>

            {/* Center content - App preview cards */}
            <div className="relative z-10 w-full max-w-md">
              {/* Main card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#118ff3]/10 border border-white/50 p-6 transform hover:scale-[1.02] transition-transform">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Upcoming Events</h3>
                    <span className="text-xs text-[#118ff3] font-medium bg-[#118ff3]/10 px-2 py-1 rounded-full">
                      3 this week
                    </span>
                  </div>

                  {/* Event items */}
                  {[
                    { title: "Practice Session", time: "Today, 4:00 PM", attending: 12, color: "bg-[#118ff3]" },
                    { title: "League Match", time: "Sat, 2:00 PM", attending: 15, color: "bg-emerald-500" },
                    { title: "Team Meeting", time: "Sun, 10:00 AM", attending: 8, color: "bg-amber-500" },
                  ].map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className={`w-2 h-10 ${event.color} rounded-full`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.time}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {event.attending}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification card */}
              <div
                className="absolute -top-4 -right-4 md:-right-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Attendance Confirmed</p>
                    <p className="text-xs text-gray-500">12 players attending</p>
                  </div>
                </div>
              </div>

              {/* Floating stat card */}
              <div
                className="absolute -bottom-4 -left-4 md:-left-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-float"
                style={{ animationDelay: "2s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#118ff3]/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#118ff3]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Season Record</p>
                    <p className="text-xs text-gray-500">8 Wins - 2 Losses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 backdrop-blur-sm py-20 lg:py-28 relative z-10">
        <SoccerFieldBackground />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#118ff3]/10 border border-[#118ff3]/20 text-[#0c5798] text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                Manage Your Team
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-pretty">
              MatchFit brings coaches and players together with powerful tools designed for modern team management.
            </p>
          </div>

          {/* Feature Cards - Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Team Roster */}
            <div className="group">
              <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 hover:border-emerald-300 transition-all hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Team Roster</h3>
                <p className="text-gray-600 leading-relaxed">
                  Keep all player information organized in one place. Track positions, contact details, and stats
                  effortlessly.
                </p>
              </div>
            </div>

            {/* Lineup Builder */}
            <div className="group">
              <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 hover:border-amber-300 transition-all hover:shadow-xl hover:shadow-amber-500/5">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Lineup Builder</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create game lineups with our intuitive interface. Publish lineups and notify your team instantly.
                </p>
              </div>
            </div>

            {/* Smart Scheduling - Full width card at bottom */}
            <div className="md:col-span-2 group">
              <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-[#118ff3]/5 to-[#0c5798]/5 border border-[#118ff3]/10 hover:border-[#118ff3]/30 transition-all hover:shadow-xl hover:shadow-[#118ff3]/5">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 bg-[#118ff3] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#118ff3]/30 group-hover:scale-110 transition-transform">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Scheduling</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Create games, practices, and meetings with ease. Players get instant notifications and can confirm
                      their attendance with a single tap.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {["Recurring events", "Reminders", "RSVP tracking"].map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-[#118ff3]/10 text-[#0c5798] text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 lg:py-28 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#118ff3] to-[#0c5798]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Ready to Transform Your Team Management?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto text-pretty">
            Join coaches and players who are already using MatchFit to stay organized and focused on what matters most —
            the game.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSignUp}
              size="lg"
              className="bg-white text-[#118ff3] hover:bg-gray-100 px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all group"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={handleLogin}
              variant="outline"
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg font-semibold rounded-xl transition-all bg-transparent"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png"
              alt="MatchFit Logo"
              className="h-8 w-auto brightness-0 invert opacity-50"
            />
            <p className="text-sm">© 2026 MatchFit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
