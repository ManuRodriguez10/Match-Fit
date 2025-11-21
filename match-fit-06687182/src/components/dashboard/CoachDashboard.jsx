import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Calendar,
  Users, 
  Clipboard,
  Plus,
  Trophy,
  AlertTriangle
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

export default function CoachDashboard({ user }) {
  const location = useLocation();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [teamStats, setTeamStats] = useState({ totalPlayers: 0, activeEvents: 0, publishedLineups: 0 });
  const [recentLineups, setRecentLineups] = useState([]);
  const coachName =
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email;
  const isProfileIncomplete = !user.first_name || !user.last_name || !user.coach_role || !user.phone;

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {coachName}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("Events")}>
            <Button className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {isProfileIncomplete && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-4">
            <div className="flex items-start gap-3">
              <div className="text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Finish setting up your coach profile</p>
                <p className="text-sm text-amber-800">
                  Add your name, phone number, role, and experience so players know who is leading the team.
                </p>
              </div>
            </div>
            <Link to={createPageUrl("CoachProfile")}>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Team Players</CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalPlayers}</div>
            <p className="text-xs opacity-90 mt-1">Active roster members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activeEvents}</div>
            <p className="text-xs opacity-90 mt-1">Scheduled ahead</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Published Lineups</CardTitle>
            <Clipboard className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.publishedLineups}</div>
            <p className="text-xs opacity-90 mt-1">For upcoming games</p>
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
                  <div>
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
              <Button variant="outline" className="w-full">View All Events</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Latest Lineups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--primary-main)]" />
              Latest Lineups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLineups.length > 0 ? (
              recentLineups.map((lineup) => (
                <div key={lineup.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Game Lineup</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Formation: {lineup.formation}
                      </p>
                      <p className="text-sm text-gray-600">
                        {lineup.starting_lineup?.length || 0} starters • {lineup.substitutes?.length || 0} subs
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Published
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming lineups</p>
            )}
            <Link to={createPageUrl("Lineups")}>
              <Button variant="outline" className="w-full">Manage Lineups</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}