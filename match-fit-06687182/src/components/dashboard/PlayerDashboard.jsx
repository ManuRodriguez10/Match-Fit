import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  User
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

export default function PlayerDashboard({ user }) {
  const location = useLocation();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingLineups, setUpcomingLineups] = useState([]);
  const [playerStats, setPlayerStats] = useState({ 
    upcomingEvents: 0, 
    lineupAppearances: 0 
  });

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
        lineup.starting_lineup?.some(player => player.player_email === user.email) ||
        lineup.substitutes?.includes(user.email)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Player Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user.email}
          </p>
          {user.position && (
            <Badge variant="outline" className="mt-2 capitalize">
              {user.position} {user.jersey_number && `#${user.jersey_number}`}
            </Badge>
          )}
        </div>
        <Link to={createPageUrl("Profile")}>
          <Button variant="outline">
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats.upcomingEvents}</div>
            <p className="text-xs opacity-90 mt-1">Scheduled ahead</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Lineup Spots</CardTitle>
            <Trophy className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats.lineupAppearances}</div>
            <p className="text-xs opacity-90 mt-1">Upcoming selections</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--primary-main)]" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.date), "MMM d, h:mm a")} • {event.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.type === "game" ? "bg-red-100 text-red-800" :
                        event.type === "practice" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {event.type}
                      </span>
                      {event.opponent && (
                        <span className="text-xs text-gray-500">vs {event.opponent}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
            <Link to={createPageUrl("Events")}>
              <Button variant="outline" className="w-full">View Calendar</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Lineup Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--primary-main)]" />
              Your Lineup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLineups.length > 0 ? (
              <div className="space-y-4">
                {upcomingLineups.map((lineup) => {
                  const isStarter = lineup.starting_lineup?.some(player => player.player_email === user.email);
                  const isSubstitute = lineup.substitutes?.includes(user.email);
                  
                  if (!isStarter && !isSubstitute) return null;

                  return (
                    <div key={lineup.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Game Lineup</h4>
                        <Badge variant={isStarter ? "default" : "secondary"}>
                          {isStarter ? "Starting XI" : "Substitute"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Formation: {lineup.formation}</p>
                      {isStarter && (
                        <p className="text-sm text-emerald-600 mt-1">
                          Position: {lineup.starting_lineup.find(p => p.player_email === user.email)?.position}
                        </p>
                      )}
                    </div>
                  );
                })}
                <Link to={createPageUrl("Lineups")}>
                  <Button variant="outline" className="w-full">View All Lineups</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">No upcoming lineups</p>
                <p className="text-sm text-gray-400">Check back when your coach publishes game lineups</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}