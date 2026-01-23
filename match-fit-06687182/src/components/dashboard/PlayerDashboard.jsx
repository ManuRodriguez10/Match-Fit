import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  Calendar,
  Trophy,
  User,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

import StatCard from "@/components/dashboard/StatCard";
import EventCard from "@/components/dashboard/EventCard";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default function PlayerDashboard({ user }) {
  const location = useLocation();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingLineups, setUpcomingLineups] = useState([]);
  const [playerStats, setPlayerStats] = useState({ 
    upcomingEvents: 0, 
    lineupAppearances: 0 
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const playerName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.email || "Player";
  const firstName = user?.first_name || playerName.split(" ")[0];

  const loadDashboardData = useCallback(async () => {
    if (!user?.team_id) return;
    try {
      const fetchTable = async (promise, label) => {
        const { data, error } = await promise;
        if (error) {
          console.warn(`Error loading ${label}:`, error.message);
          return [];
        }
        return data || [];
      };

      const [events, lineups] = await Promise.all([
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
        )
      ]);

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
      setUpcomingLineups(futureLineups.slice(0, 5));
      
      const lineupCount = futureLineups.filter(lineup => 
        lineup.starting_lineup?.some(player => 
          (player.player_id && player.player_id === user.id) || 
          (player.player_email && player.player_email === user.email)
        ) ||
        lineup.substitutes?.some(sub => 
          (typeof sub === 'string' && sub === user.email) ||
          (typeof sub === 'string' && sub === user.id)
        )
      ).length;

      setPlayerStats({
        upcomingEvents: futureEvents.length,
        lineupAppearances: lineupCount
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }, [user.email, user.team_id, location.pathname]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-update date
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Every minute

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;

    const midnightTimeout = setTimeout(() => {
      setCurrentDate(new Date());
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentDate.getHours();
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
                Player
              </span>
              {user.position && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 backdrop-blur-sm border border-slate-200/60 text-slate-700 text-sm font-medium capitalize">
                  {user.position} {user.jersey_number && `#${user.jersey_number}`}
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60">
            <Calendar className="w-4 h-4 text-[#118ff3]" />
            <span className="font-medium">{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard
            icon={Calendar}
            label="Upcoming Events"
            value={playerStats.upcomingEvents}
            subtitle="Scheduled ahead"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={0}
          />
          <StatCard
            icon={Trophy}
            label="Lineup Spots"
            value={playerStats.lineupAppearances}
            subtitle="Upcoming selections"
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            delay={0.1}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upcoming Events */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-900/5 overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300/50 transition-all duration-300 hover:-translate-y-1"
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
                  <p className="text-sm text-slate-500 mt-2">Your coach will schedule events here</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Lineup Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-900/5 overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="p-6 lg:p-8 border-b border-slate-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Your Lineup Status</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Your selections</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {upcomingLineups.length > 0 ? (
                <>
                  {upcomingLineups.map((lineup) => {
                    const isStarter = lineup.starting_lineup?.some(player => 
                      (player.player_id && player.player_id === user.id) || 
                      (player.player_email && player.player_email === user.email)
                    );
                    const isSubstitute = lineup.substitutes?.some(sub => 
                      (typeof sub === 'string' && sub === user.email) ||
                      (typeof sub === 'string' && sub === user.id)
                    );
                    
                    if (!isStarter && !isSubstitute) return null;

                    const playerAssignment = lineup.starting_lineup?.find(p => 
                      (p.player_id && p.player_id === user.id) || 
                      (p.player_email && p.player_email === user.email)
                    );

                    return (
                      <motion.div
                        key={lineup.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900">Game Lineup</h4>
                          <Badge 
                            variant={isStarter ? "default" : "secondary"}
                            className={isStarter ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-violet-100 text-violet-700 border-violet-200"}
                          >
                            {isStarter ? "Starting XI" : "Substitute"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Formation:</span> {lineup.formation || "N/A"}
                          </p>
                          {isStarter && playerAssignment && (
                            <p className="text-sm text-emerald-600 font-medium">
                              Position: {playerAssignment.position}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <Link to={createPageUrl("Lineups")} className="block">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-slate-200 text-slate-700 hover:bg-[#118ff3] hover:text-white hover:border-[#118ff3] rounded-xl font-semibold transition-all group"
                    >
                      View All Lineups
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-semibold">No upcoming lineups</p>
                  <p className="text-sm text-slate-500 mt-2">Check back when your coach publishes game lineups</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}