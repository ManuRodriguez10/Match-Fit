import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Calendar,
  Users, 
  ClipboardList,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

import StatCard from "@/components/dashboard/StatCard";
import EventCard from "@/components/dashboard/EventCard";
import LineupCard from "@/components/dashboard/LineupCard";
import ProfileAlert from "@/components/dashboard/ProfileAlert";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default function CoachDashboard({ user }) {
  const location = useLocation();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [teamStats, setTeamStats] = useState({ totalPlayers: 0, activeEvents: 0, publishedLineups: 0 });
  const [recentLineups, setRecentLineups] = useState([]);
  
  const coachName = user?.full_name || 
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || 
    user?.email || "Coach";
  const firstName = user?.first_name || coachName.split(" ")[0];
  const isProfileIncomplete = !user?.first_name || !user?.last_name || !user?.coach_role || !user?.phone;

  useEffect(() => {
    loadDashboardData();
  }, [user?.team_id, location.pathname]);

  const loadDashboardData = async () => {
    if (!user?.team_id) {
      setUpcomingEvents([]);
      setRecentLineups([]);
      setTeamStats({ totalPlayers: 0, activeEvents: 0, publishedLineups: 0 });
      return;
    }
    
    try {
      const fetchTable = async (promise, label) => {
        const { data, error } = await promise;
        if (error) {
          console.warn(`Error loading ${label}:`, error.message);
          return [];
        }
        return data || [];
      };

      const [events, lineups, players] = await Promise.all([
        fetchTable(
          supabase
            .from("events")
            .select("*")
            .eq("team_id", user.team_id)
            .order("date", { ascending: true }),
          "events"
        ),
        fetchTable(
          supabase
            .from("lineups")
            .select("*")
            .eq("team_id", user.team_id)
            .eq("published", true)
            .order("created_at", { ascending: false }),
          "lineups"
        ),
        fetchTable(
          supabase
            .from("profiles")
            .select("id, team_role")
            .eq("team_id", user.team_id),
          "profiles"
        )
      ]);

      const playerMembers = players.filter(member => member.team_role === "player");

      // Filter to only include future events
      const now = new Date();
      const futureEvents = events.filter(event => {
        const eventDate = parseISO(event.date);
        return !isPast(eventDate) || eventDate.toDateString() === now.toDateString();
      });

      // Filter lineups to only include those for future events
      const futureLineups = [];
      for (const lineup of lineups) {
        const lineupEvent = events.find(e => e.id === lineup.event_id);
        if (lineupEvent) {
          const eventDate = parseISO(lineupEvent.date);
          if (!isPast(eventDate) || eventDate.toDateString() === now.toDateString()) {
            futureLineups.push(lineup);
          }
        }
      }

      setUpcomingEvents(futureEvents.slice(0, 5));
      setRecentLineups(futureLineups.slice(0, 3));
      
      setTeamStats({
        totalPlayers: playerMembers.length,
        activeEvents: futureEvents.length,
        publishedLineups: futureLineups.length
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
      {/* Animated backgrounds */}
      <DashboardBackground />
      
      {/* Navigation */}
      <DashboardNav user={user} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-slate-600 font-medium text-lg">{getGreeting()}</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#118ff3]/10 border border-[#118ff3]/20 text-[#0c5798] text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Coach
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60">
            <Calendar className="w-4 h-4 text-[#118ff3]" />
            <span className="font-medium">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
          </div>
        </motion.div>

        {/* Profile Alert */}
        {isProfileIncomplete && <ProfileAlert />}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            icon={Users}
            label="Team Players"
            value={teamStats.totalPlayers}
            subtitle="Active roster"
            gradient="bg-gradient-to-br from-[#118ff3] to-[#0c5798]"
            delay={0}
          />
          <StatCard
            icon={Calendar}
            label="Upcoming Events"
            value={teamStats.activeEvents}
            subtitle="Scheduled ahead"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={0.1}
          />
          <StatCard
            icon={ClipboardList}
            label="Published Lineups"
            value={teamStats.publishedLineups}
            subtitle="Ready for games"
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            delay={0.2}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upcoming Events - Wider Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-slate-900/5 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 lg:p-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#118ff3] to-[#0c5798] flex items-center justify-center shadow-lg shadow-[#118ff3]/30">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Upcoming Events</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Your schedule at a glance</p>
                </div>
              </div>
              <Link to={createPageUrl("Events")}>
                <Button variant="ghost" className="text-[#118ff3] hover:text-[#0c5798] hover:bg-[#118ff3]/10 rounded-xl group">
                  View all
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="p-4 lg:p-6 space-y-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-semibold text-lg">No upcoming events</p>
                  <p className="text-sm text-slate-500 mt-2">Schedule your first event to get started</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Lineups - Narrower Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-slate-900/5 overflow-hidden"
          >
            <div className="p-6 lg:p-8 border-b border-slate-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Recent Lineups</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Latest configurations</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {recentLineups.length > 0 ? (
                recentLineups.map((lineup, index) => (
                  <LineupCard key={lineup.id} lineup={lineup} index={index} />
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-semibold">No lineups yet</p>
                  <p className="text-sm text-slate-500 mt-2">Create your first lineup</p>
                </div>
              )}
              
              <Link to={createPageUrl("Lineups")} className="block">
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-slate-200 text-slate-700 hover:bg-[#118ff3] hover:text-white hover:border-[#118ff3] rounded-xl font-semibold transition-all group"
                >
                  Manage Lineups
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
