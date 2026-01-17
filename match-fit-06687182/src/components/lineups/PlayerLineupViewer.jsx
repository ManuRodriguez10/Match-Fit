import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Trophy } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import LineupField from "./LineupField";
import { motion } from "framer-motion";

export default function PlayerLineupViewer({ user, initialEventId }) {
  const [lineups, setLineups] = useState([]);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]); // New state for team players
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // When events are loaded, select the appropriate event
    if (upcomingEvents.length > 0 && !selectedEventId) {
      if (initialEventId) {
        // Check if initialEventId matches an existing upcoming event
        const matchingEvent = upcomingEvents.find(e => e.id === initialEventId);
        if (matchingEvent) {
          setSelectedEventId(initialEventId);
        } else {
          // Default to first upcoming event if initialEventId doesn't match or is past
          setSelectedEventId(upcomingEvents[0].id);
        }
      } else {
        // No initialEventId, default to first upcoming event
        setSelectedEventId(upcomingEvents[0].id);
      }
    }
  }, [upcomingEvents, initialEventId, selectedEventId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchTable = async (promise, label) => {
        const { data, error } = await promise;
        if (error) {
          console.warn(`Error loading ${label}:`, error.message);
          return [];
        }
        return data || [];
      };

      const [lineupsData, eventsData, playersData] = await Promise.all([
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
            .from("events")
            .select("*")
            .eq("team_id", user.team_id)
            .eq("type", "game")
            .order("date", { ascending: true }),
          "events"
        ),
        fetchTable(
          supabase
            .from("profiles")
            .select("*")
            .eq("team_id", user.team_id),
          "profiles"
        )
      ]);
      
      const allPlayers = playersData.filter(member => member.team_role === "player");
      
      // Filter to only include future games
      const now = new Date();
      const futureGames = eventsData.filter(event => {
        const eventDate = parseISO(event.date);
        return !isPast(eventDate) || eventDate.toDateString() === now.toDateString();
      });
      
      setLineups(lineupsData);
      setEvents(eventsData);
      setUpcomingEvents(futureGames);
      setTeamPlayers(allPlayers);
    } catch (error) {
      console.error("Error loading lineups:", error);
    }
    setIsLoading(false);
  };

  const getFieldPositions = (formation) => {
    const formations = {
      "4-4-2": [
        { name: "GK", label: "Goalkeeper", top: "85%", left: "50%" },
        { name: "LB", label: "Left Back", top: "65%", left: "15%" },
        { name: "CB1", label: "Center Back", top: "70%", left: "40%" },
        { name: "CB2", label: "Center Back", top: "70%", left: "60%" },
        { name: "RB", label: "Right Back", top: "65%", left: "85%" },
        { name: "LM", label: "Left Mid", top: "40%", left: "15%" },
        { name: "CM1", label: "Center Mid", top: "45%", left: "40%" },
        { name: "CM2", label: "Center Mid", top: "45%", left: "60%" },
        { name: "RM", label: "Right Mid", top: "40%", left: "85%" },
        { name: "ST1", label: "Striker", top: "15%", left: "40%" },
        { name: "ST2", label: "Striker", top: "15%", left: "60%" }
      ],
      "4-3-3": [
        { name: "GK", label: "Goalkeeper", top: "85%", left: "50%" },
        { name: "LB", label: "Left Back", top: "65%", left: "15%" },
        { name: "CB1", label: "Center Back", top: "70%", left: "40%" },
        { name: "CB2", label: "Center Back", top: "70%", left: "60%" },
        { name: "RB", label: "Right Back", top: "65%", left: "85%" },
        { name: "CM1", label: "Center Mid", top: "45%", left: "33%" },
        { name: "CM2", label: "Center Mid", top: "45%", left: "50%" },
        { name: "CM3", label: "Center Mid", top: "45%", left: "67%" },
        { name: "LW", label: "Left Wing", top: "15%", left: "15%" },
        { name: "ST", label: "Striker", top: "10%", left: "50%" },
        { name: "RW", label: "Right Wing", top: "15%", left: "85%" }
      ],
      "3-5-2": [
        { name: "GK", label: "Goalkeeper", top: "85%", left: "50%" },
        { name: "CB1", label: "Center Back", top: "70%", left: "25%" },
        { name: "CB2", label: "Center Back", top: "70%", left: "50%" },
        { name: "CB3", label: "Center Back", top: "70%", left: "75%" },
        { name: "LWB", label: "Left Wing Back", top: "50%", left: "10%" },
        { name: "CM1", label: "Center Mid", top: "50%", left: "33%" },
        { name: "CM2", label: "Center Mid", top: "50%", left: "50%" },
        { name: "CM3", label: "Center Mid", top: "50%", left: "67%" },
        { name: "RWB", label: "Right Wing Back", top: "50%", left: "90%" },
        { name: "ST1", label: "Striker", top: "15%", left: "40%" },
        { name: "ST2", label: "Striker", top: "15%", left: "60%" }
      ],
      "4-2-3-1": [
        { name: "GK", label: "Goalkeeper", top: "85%", left: "50%" },
        { name: "LB", label: "Left Back", top: "65%", left: "15%" },
        { name: "CB1", label: "Center Back", top: "70%", left: "40%" },
        { name: "CB2", label: "Center Back", top: "70%", left: "60%" },
        { name: "RB", label: "Right Back", top: "65%", left: "85%" },
        { name: "CDM1", label: "Def Mid", top: "50%", left: "40%" },
        { name: "CDM2", label: "Def Mid", top: "50%", left: "60%" },
        { name: "LAM", label: "Left Attack Mid", top: "30%", left: "20%" },
        { name: "CAM", label: "Center Attack Mid", top: "30%", left: "50%" },
        { name: "RAM", label: "Right Attack Mid", top: "30%", left: "80%" },
        { name: "ST", label: "Striker", top: "10%", left: "50%" }
      ],
      "3-4-3": [
        { name: "GK", label: "Goalkeeper", top: "85%", left: "50%" },
        { name: "CB1", label: "Center Back", top: "70%", left: "25%" },
        { name: "CB2", label: "Center Back", top: "70%", left: "50%" },
        { name: "CB3", label: "Center Back", top: "70%", left: "75%" },
        { name: "LM", label: "Left Mid", top: "45%", left: "15%" },
        { name: "CM1", label: "Center Mid", top: "45%", left: "40%" },
        { name: "CM2", label: "Center Mid", top: "45%", left: "60%" },
        { name: "RM", label: "Right Mid", top: "45%", left: "85%" },
        { name: "LW", label: "Left Wing", top: "15%", left: "20%" },
        { name: "ST", label: "Striker", top: "10%", left: "50%" },
        { name: "RW", label: "Right Wing", top: "15%", left: "80%" }
      ]
    };
    return formations[formation] || formations["4-4-2"];
  };

  const getLineupForEvent = (eventId) => {
    return lineups.find(l => l.event_id === eventId);
  };

  const isPlayerInLineup = (lineup, playerEmail, playerId) => {
    const inStarting = lineup.starting_lineup?.some(p => 
      (p.player_id && p.player_id === playerId) || 
      (p.player_email && p.player_email === playerEmail)
    );
    const inSubs = lineup.substitutes?.some(sub => 
      (typeof sub === 'string' && sub === playerEmail) ||
      (typeof sub === 'string' && sub === playerId)
    );
    return inStarting || inSubs;
  };

  // New helper function to get player details by email or id
  const getPlayerByIdentifier = (identifier) => {
    return teamPlayers.find(p => p.id === identifier || p.email === identifier);
  };

  // Check if event is in the past
  const isEventPast = (eventDate) => {
    const date = parseISO(eventDate);
    const now = new Date();
    return isPast(date) && date.toDateString() !== now.toDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#118ff3]"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                Game Lineups
              </span>
            </h1>
            <p className="text-slate-600 text-lg">View team lineups for upcoming games</p>
          </div>
          <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Games Scheduled</h3>
              <p className="text-slate-600">Your coach hasn't scheduled any games yet.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                Game Lineups
              </span>
            </h1>
            <p className="text-slate-600 text-lg">View team lineups for upcoming games</p>
          </div>
          <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Games</h3>
              <p className="text-slate-600 mb-2">All scheduled games have already passed.</p>
              <p className="text-slate-500 text-sm">Lineups are only shown for future games.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                Game Lineups
              </span>
            </h1>
            <p className="text-slate-600 text-lg">View team lineups for upcoming games</p>
          </div>
        </motion.div>

        <Tabs value={selectedEventId} onValueChange={setSelectedEventId} className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-1.5 h-auto w-full justify-start overflow-x-auto flex-wrap">
            {upcomingEvents.map((event) => {
              const lineup = getLineupForEvent(event.id);
              const inLineup = lineup ? isPlayerInLineup(lineup, user.email, user.id) : false;
              
              return (
                <TabsTrigger 
                  key={event.id} 
                  value={event.id} 
                  className="flex items-center gap-2 text-xs md:text-sm rounded-xl px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#118ff3] data-[state=active]:to-[#0c5798] data-[state=active]:text-white"
                >
                  <span className="truncate max-w-[120px] md:max-w-none">{event.title || format(new Date(event.date), "MMM d")}</span>
                  {inLineup && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>}
                </TabsTrigger>
              );
            })}
          </TabsList>

        {upcomingEvents.map((event) => {
          const lineup = getLineupForEvent(event.id);
          const inStarting = lineup?.starting_lineup?.some(p => 
            (p.player_id && p.player_id === user.id) || 
            (p.player_email && p.player_email === user.email)
          );
          const inSubs = lineup?.substitutes?.some(sub => 
            (typeof sub === 'string' && sub === user.email) ||
            (typeof sub === 'string' && sub === user.id)
          );
          const eventIsPast = isEventPast(event.date);
          
          return (
            <TabsContent key={event.id} value={event.id} className="space-y-6">
              {/* Event Details Card */}
              <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                <CardHeader className="border-b border-slate-200/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">{event.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                      </p>
                      {event.location && (
                        <p className="text-sm text-slate-600">{event.location}</p>
                      )}
                    </div>
                    {(inStarting || inSubs) && (
                      <div className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                        inStarting 
                          ? "bg-green-100/80 text-green-800 border border-green-200/50" 
                          : "bg-blue-100/80 text-blue-800 border border-blue-200/50"
                      }`}>
                        {inStarting ? "Starting XI" : "Substitute"}
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Past Event Alert */}
              {eventIsPast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50/80 backdrop-blur-xl border border-amber-200/50 rounded-2xl p-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-amber-800 font-medium">
                      This game has already passed. You are viewing the historical lineup.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Lineup Display or Not Published Message */}
              {lineup ? (
                <>
                  <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                    <CardHeader className="border-b border-slate-200/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Starting Lineup - {lineup.formation}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="w-full mx-auto">
                        <div className="relative w-full bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden" style={{ paddingTop: "60%" }}>
                          {/* Field lines */}
                          <div className="absolute inset-0">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40"></div>
                            <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute top-0 left-1/4 right-1/4 h-14 border-2 border-white/40 border-t-0"></div>
                            <div className="absolute bottom-0 left-1/4 right-1/4 h-14 border-2 border-white/40 border-b-0"></div>
                            <div className="absolute top-0 left-[37.5%] right-[37.5%] h-7 border-2 border-white/40 border-t-0"></div>
                            <div className="absolute bottom-0 left-[37.5%] right-[37.5%] h-7 border-2 border-white/40 border-b-0"></div>
                          </div>
                          
                          {/* Players */}
                          {getFieldPositions(lineup.formation).map((pos) => {
                            const playerAssignment = lineup.starting_lineup?.find(p => p.position === pos.name);
                            const playerIdentifier = playerAssignment?.player_id || playerAssignment?.player_email;
                            const player = playerIdentifier ? getPlayerByIdentifier(playerIdentifier) : null;
                            const displayName = player && player.first_name && player.last_name
                              ? `${player.first_name} ${player.last_name}`
                              : (playerIdentifier || null); // Fallback to identifier if name not found
                            const isCurrentPlayer = (playerAssignment?.player_id === user.id) || 
                              (playerAssignment?.player_email === user.email);
                            
                            return (
                              <div
                                key={pos.name}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                style={{ top: pos.top, left: pos.left }}
                              >
                                {displayName ? (
                                  <div className={`flex flex-col items-center ${isCurrentPlayer ? 'scale-110' : ''}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg ${
                                      isCurrentPlayer 
                                        ? 'bg-yellow-500 ring-2 ring-yellow-300' 
                                        : 'bg-blue-600'
                                    }`}>
                                      {player?.jersey_number || (displayName.split(' ').map(n => n[0]).join('')).slice(0, 2)}
                                    </div>
                                    <span className="mt-1 text-[8px] md:text-xs font-semibold text-white bg-black/40 px-1.5 md:px-2 py-0.5 rounded whitespace-nowrap max-w-[60px] md:max-w-none truncate">
                                      {displayName}
                                    </span>
                                    <span className="text-[8px] md:text-[10px] text-white/80">{pos.label}</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center">
                                      <span className="text-white/60 text-[10px]">?</span>
                                    </div>
                                    <span className="mt-1 text-[8px] md:text-[10px] text-white/70">{pos.label}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {lineup.substitutes && lineup.substitutes.length > 0 && (
                    <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                      <CardHeader className="border-b border-slate-200/50">
                        <CardTitle className="text-xl font-bold text-slate-900">Substitutes ({lineup.substitutes.length})</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                          {lineup.substitutes.map((playerIdentifier) => {
                            const player = getPlayerByIdentifier(playerIdentifier);
                            const displayName = player && player.first_name && player.last_name
                              ? `${player.first_name} ${player.last_name}`
                              : playerIdentifier; // Fallback to identifier
                            const isCurrentPlayer = (playerIdentifier === user.id) || (playerIdentifier === user.email);
                            
                            return (
                              <div key={playerIdentifier} className={`bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl p-3 text-center shadow-lg ${
                                isCurrentPlayer ? 'ring-2 ring-yellow-500 bg-yellow-50/80' : ''
                              }`}>
                                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto rounded-full flex items-center justify-center font-bold text-base md:text-lg mb-2 bg-slate-200 text-slate-700">
                                  {player?.jersey_number || (displayName.split(' ').map(n => n[0]).join('')).slice(0, 2)}
                                </div>
                                <p className="text-xs md:text-sm font-medium truncate text-slate-900">{displayName}</p>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                  <CardContent className="py-8 sm:py-16">
                    <div className="max-w-4xl mx-auto">
                      <div className="relative w-full bg-gradient-to-b from-green-600 to-green-700 rounded-2xl overflow-hidden" style={{ paddingTop: "60%" }}>
                        {/* Field lines */}
                        <div className="absolute inset-0">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40"></div>
                          <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                          <div className="absolute top-0 left-1/4 right-1/4 h-14 border-2 border-white/40 border-t-0"></div>
                          <div className="absolute bottom-0 left-1/4 right-1/4 h-14 border-2 border-white/40 border-b-0"></div>
                          <div className="absolute top-0 left-[37.5%] right-[37.5%] h-7 border-2 border-white/40 border-t-0"></div>
                          <div className="absolute bottom-0 left-[37.5%] right-[37.5%] h-7 border-2 border-white/40 border-b-0"></div>
                        </div>
                        
                        {/* Not Published Message */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 text-center max-w-xs sm:p-8 sm:max-w-md mx-4 border border-slate-200/50">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                              <Trophy className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                              Lineup Not Published Yet
                            </h3>
                            <p className="text-sm text-slate-600">
                              Your coach hasn't published the lineup for this game yet. Check back soon!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          );
        })}
        </Tabs>
    </div>
  );
}