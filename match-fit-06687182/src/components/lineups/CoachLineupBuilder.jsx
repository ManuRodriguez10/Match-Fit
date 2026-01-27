import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Send, Plus, Trash2, CheckCircle, Calendar, RefreshCw } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import LineupField from "./LineupField";
import PlayerSelectionModal from "./PlayerSelectionModal";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function CoachLineupBuilder({ user }) {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formation, setFormation] = useState("4-4-2");
  const [startingLineup, setStartingLineup] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [existingLineup, setExistingLineup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [benchSlots, setBenchSlots] = useState(10);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [location.pathname]);

  useEffect(() => {
    if (selectedEventId) {
      loadLineupForEvent(selectedEventId);
      const event = events.find(e => e.id === selectedEventId);
      setSelectedEvent(event);
      // Reset edit mode when switching events
      setIsEditMode(false);
    }
  }, [selectedEventId, events]);

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

      const [eventsData, playersData] = await Promise.all([
        fetchTable(
          supabase
            .from("events")
            .select("*")
            .eq("team_id", user.team_id)
            .eq("type", "game")
            .order("date", { ascending: false }),
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
      
      // Filter to only include future games for lineup creation
      const now = new Date();
      const futureGames = eventsData.filter(event => {
        const eventDate = parseISO(event.date);
        return !isPast(eventDate) || eventDate.toDateString() === now.toDateString();
      });
      
      setEvents(eventsData);
      setUpcomingEvents(futureGames);
      setPlayers(allPlayers);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
    setIsLoading(false);
  };

  const loadLineupForEvent = async (eventId) => {
    try {
      const { data: lineupsData, error } = await supabase
        .from("lineups")
        .select("*")
        .eq("team_id", user.team_id)
        .eq("event_id", eventId)
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      if (lineupsData && lineupsData.length > 0) {
        const lineup = lineupsData[0];
        setExistingLineup(lineup);
        setFormation(lineup.formation);
        setStartingLineup(lineup.starting_lineup || []);
        setSubstitutes(lineup.substitutes || []);
        if (lineup.substitutes && lineup.substitutes.length > 10) {
          setBenchSlots(lineup.substitutes.length);
        } else {
          setBenchSlots(10);
        }
      } else {
        setExistingLineup(null);
        setFormation("4-4-2");
        setStartingLineup([]);
        setSubstitutes([]);
        setBenchSlots(10);
      }
    } catch (error) {
      console.error("Error loading lineup:", error);
      toast.error("Failed to load lineup for event.");
    }
  };

  const getFieldPositions = () => {
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

  const handlePositionClick = (positionName) => {
    setSelectedPosition(positionName);
    setShowPlayerModal(true);
  };

  const handlePlayerSelect = (playerId) => {
    if (selectedPosition === "bench") {
      if (!substitutes.includes(playerId)) {
        setSubstitutes([...substitutes, playerId]);
      }
    } else {
      const existingIndex = startingLineup.findIndex(p => p.position === selectedPosition);
      if (existingIndex >= 0) {
        const updated = [...startingLineup];
        updated[existingIndex] = { player_id: playerId, position: selectedPosition };
        setStartingLineup(updated);
      } else {
        setStartingLineup([...startingLineup, { player_id: playerId, position: selectedPosition }]);
      }
    }
    setShowPlayerModal(false);
    setSelectedPosition(null);
  };

  const handleRemovePlayer = (positionName) => {
    setStartingLineup(startingLineup.filter(p => p.position !== positionName));
  };

  const handleRemoveSub = (playerId) => {
    setSubstitutes(substitutes.filter(id => id !== playerId));
  };

  // Remove a bench slot (only if empty and not reducing below assigned players)
  const handleRemoveBenchSlot = (index) => {
    // Don't allow removing slots that have players assigned
    if (substitutes[index]) {
      return;
    }
    
    // Don't allow reducing below the number of assigned players
    const minSlots = substitutes.length;
    if (benchSlots <= minSlots) {
      toast.warning(`Cannot remove bench slots. You have ${minSlots} players assigned.`);
      return;
    }
    
    setBenchSlots(benchSlots - 1);
  };

  const getAssignedPlayers = () => {
    const assigned = new Set();
    startingLineup.forEach(p => assigned.add(p.player_id || p.player_email));
    substitutes.forEach(id => assigned.add(id));
    return assigned;
  };

  const handleSaveDraft = async () => {
    if (!selectedEventId) {
      toast.error("Please select a game event");
      return;
    }

    setIsSaving(true);
    try {
      const lineupData = {
        team_id: user.team_id,
        event_id: selectedEventId,
        formation,
        starting_lineup: startingLineup,
        substitutes,
        published: existingLineup?.published || false
      };

      if (existingLineup) {
        const { error } = await supabase
          .from("lineups")
          .update(lineupData)
          .eq("id", existingLineup.id);
        
        if (error) {
          console.error("Error saving lineup (update):", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Error details:", error.details);
          console.error("Error hint:", error.hint);
          console.error("Full error object:", JSON.stringify(error, null, 2));
          throw error;
        }
        toast.success("Lineup draft saved");
        loadLineupForEvent(selectedEventId);
      } else {
        const { data, error } = await supabase
          .from("lineups")
          .insert(lineupData)
          .select()
          .single();
        
        if (error) {
          console.error("Error saving lineup (insert):", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Error details:", error.details);
          console.error("Error hint:", error.hint);
          console.error("Full error object:", JSON.stringify(error, null, 2));
          throw error;
        }
        setExistingLineup(data);
        toast.success("Lineup draft created");
      }
    } catch (error) {
      console.error("Error saving lineup:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      // Show more detailed error message
      const errorMessage = error.message || "Failed to save lineup";
      const errorDetails = error.details ? `: ${error.details}` : "";
      const errorHint = error.hint ? ` (${error.hint})` : "";
      toast.error(`Failed to save lineup: ${errorMessage}${errorDetails}${errorHint}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedEventId) {
      toast.error("Please select a game event");
      return;
    }

    if (startingLineup.length !== 11) {
      toast.error("Please assign all 11 starting positions");
      return;
    }

    setIsPublishing(true);
    try {
      const lineupData = {
        team_id: user.team_id,
        event_id: selectedEventId,
        formation,
        starting_lineup: startingLineup,
        substitutes,
        published: true
      };

      if (existingLineup) {
        const { error } = await supabase
          .from("lineups")
          .update(lineupData)
          .eq("id", existingLineup.id);
        
        if (error) {
          console.error("Error publishing lineup (update):", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        setExistingLineup(prev => ({ ...prev, published: true }));
      } else {
        const { data, error } = await supabase
          .from("lineups")
          .insert(lineupData)
          .select()
          .single();
        
        if (error) {
          console.error("Error publishing lineup (insert):", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        setExistingLineup(data);
      }

      // Send email notifications to all players
      // TODO: Implement email notifications using Supabase Edge Functions or another service
      // await sendLineupNotifications();

      toast.success("Lineup published!");
      // Exit edit mode after publishing to show read-only view
      setIsEditMode(false);
    } catch (error) {
      console.error("Error publishing lineup:", error);
      // Show more detailed error message
      const errorMessage = error.message || "Failed to publish lineup";
      const errorDetails = error.details ? `: ${error.details}` : "";
      const errorHint = error.hint ? ` (${error.hint})` : "";
      toast.error(`Failed to publish lineup: ${errorMessage}${errorDetails}${errorHint}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // TODO: Implement email notifications using Supabase Edge Functions or another service
  // const sendLineupNotifications = async () => {
  //   try {
  //     const eventTitle = selectedEvent?.title || "your upcoming game";
  //     const eventDate = selectedEvent?.date ? format(new Date(selectedEvent.date), "MMMM d, yyyy") : "";
  //     const lineupPageUrl = `${window.location.origin}${createPageUrl(`Lineups?eventId=${selectedEventId}`)}`;
  //     
  //     for (const player of players) {
  //       const playerName = player.first_name && player.last_name 
  //         ? `${player.first_name} ${player.last_name}` 
  //         : player.email;
  //         
  //       // TODO: Implement email sending via Supabase Edge Function or email service
  //     }
  //   } catch (error) {
  //     console.error("Error sending notifications:", error);
  //   }
  // };

  const handleDeleteLineup = async () => {
    if (!existingLineup) return;
    
    if (!confirm("Are you sure you want to delete this lineup? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("lineups")
        .delete()
        .eq("id", existingLineup.id);
      
      if (error) throw error;
      
      setExistingLineup(null);
      setStartingLineup([]);
      setSubstitutes([]);
      setBenchSlots(10);
      setFormation("4-4-2");
      toast.success("Lineup deleted");
    } catch (error) {
      console.error("Error deleting lineup:", error);
      toast.error("Failed to delete lineup");
    }
  };

  const handleClearLineup = () => {
    if (!confirm("Are you sure you want to clear the current lineup? All unsaved selections will be lost.")) return;
    
    setStartingLineup([]);
    setSubstitutes([]);
    setBenchSlots(10);
    toast.info("Lineup cleared. You can start building a new lineup.");
  };

  // Check if the selected event is in the past
  const isSelectedEventPast = selectedEvent && isPast(parseISO(selectedEvent.date)) && parseISO(selectedEvent.date).toDateString() !== new Date().toDateString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#118ff3]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                Lineup Builder
              </span>
            </h1>
            <p className="text-slate-600 text-lg">Create and manage game lineups</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={createPageUrl("Events")}>
              <Button className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-[#118ff3]/30">
                <Plus className="w-5 h-5 mr-2" />
                Add New Game
              </Button>
            </Link>
            {existingLineup && !isSelectedEventPast && (
              <Button 
                onClick={handleDeleteLineup} 
                className="bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 rounded-xl px-6 py-6 h-auto shadow-lg"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Lineup
              </Button>
            )}
          </div>
        </motion.div>

        {existingLineup?.published && !isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50/80 backdrop-blur-xl border border-green-200/50 rounded-2xl p-4 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">
                  This lineup has been published and players have been notified.
                </p>
              </div>
              <Button
                onClick={() => setIsEditMode(true)}
                className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl px-6 py-2 h-auto shadow-lg shadow-[#118ff3]/30"
              >
                Edit Lineup
              </Button>
            </div>
          </motion.div>
        )}

        {isSelectedEventPast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50/80 backdrop-blur-xl border border-amber-200/50 rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-amber-800 font-medium">
                This game has already passed. Lineups cannot be created or edited for past events.
              </p>
            </div>
          </motion.div>
        )}

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No game events scheduled</h3>
            <p className="text-slate-600 mb-6">Create a game event first to build a lineup.</p>
            <Link to={createPageUrl("Events")}>
              <Button className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl shadow-lg shadow-[#118ff3]/30">
                <Plus className="w-4 h-4 mr-2" />
                Schedule a Game
              </Button>
            </Link>
          </motion.div>
        ) : upcomingEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming games available</h3>
            <p className="text-slate-600 mb-6">All scheduled games have already passed. Lineups can only be created for future games.</p>
            <Link to={createPageUrl("Events")}>
              <Button className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl shadow-lg shadow-[#118ff3]/30">
                <Plus className="w-4 h-4 mr-2" />
                Schedule a New Game
              </Button>
            </Link>
          </motion.div>
        ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
              <CardHeader className="border-b border-slate-200/50">
                <CardTitle className="text-xl font-bold text-slate-900">Game Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Game</label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Choose a game..." />
                    </SelectTrigger>
                    <SelectContent>
                      {upcomingEvents.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {format(new Date(event.date), "MMM d, yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Only upcoming games are available for lineup creation</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
              <CardHeader className="border-b border-slate-200/50">
                <CardTitle className="text-xl font-bold text-slate-900">Formation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Formation</label>
                  <Select 
                    value={formation} 
                    onValueChange={setFormation} 
                    disabled={isSelectedEventPast || (existingLineup?.published && !isEditMode)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-4-2">4-4-2</SelectItem>
                      <SelectItem value="4-3-3">4-3-3</SelectItem>
                      <SelectItem value="3-5-2">3-5-2</SelectItem>
                      <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                      <SelectItem value="3-4-3">3-4-3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedEventId && !isSelectedEventPast && (
            <>
              {existingLineup?.published && !isEditMode ? (
                // Read-only view for published lineups
                <>
                  <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                    <CardHeader className="border-b border-slate-200/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Starting Lineup (View Only)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="w-full mx-auto lg:max-w-4xl xl:max-w-5xl">
                        <LineupField
                          formation={formation}
                          positions={getFieldPositions()}
                          startingLineup={startingLineup}
                          players={players}
                          onPositionClick={() => {}}
                          onRemovePlayer={() => {}}
                          isEditable={false}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {substitutes.length > 0 && (
                    <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                      <CardHeader className="border-b border-slate-200/50">
                        <CardTitle className="text-xl font-bold text-slate-900">Substitutes (View Only)</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                          {substitutes.map((playerId, index) => {
                            const player = players.find(p => p.id === playerId);
                            
                            return player ? (
                              <div key={index} className="bg-white/80 backdrop-blur-xl border-2 border-slate-300/50 rounded-xl p-3">
                                <div className="text-center">
                                  <div className="w-10 h-10 mx-auto bg-slate-200 rounded-full flex items-center justify-center font-bold text-base mb-2">
                                    {player.jersey_number}
                                  </div>
                                  <p className="text-xs font-medium truncate text-slate-900">
                                    {player.first_name && player.last_name ? `${player.first_name} ${player.last_name}` : (player.email || `Player ${player.id.slice(0, 8)}`)}
                                  </p>
                                  <p className="text-[10px] text-slate-500 capitalize truncate">{player.position}</p>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                // Editable view (when not published or in edit mode)
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {existingLineup?.published && isEditMode && (
                      <Button
                        onClick={() => {
                          // Reload the lineup to reset any unsaved changes
                          loadLineupForEvent(selectedEventId);
                          setIsEditMode(false);
                        }}
                        className="flex-1 bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl px-6 py-6 h-auto shadow-lg"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={handleClearLineup}
                      disabled={isSaving || isPublishing || (startingLineup.length === 0 && substitutes.length === 0)}
                      className="flex-1 bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl px-6 py-6 h-auto shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Lineup
                    </Button>
                    <Button
                      onClick={handleSaveDraft}
                      disabled={isSaving || isPublishing}
                      className="flex-1 bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl px-6 py-6 h-auto shadow-lg"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Draft
                    </Button>
                    <Button
                      onClick={handlePublish}
                      disabled={isSaving || isPublishing || startingLineup.length !== 11}
                      className="flex-1 bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-[#118ff3]/30"
                    >
                      {isPublishing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {existingLineup?.published ? "Update & Re-notify Players" : "Publish & Notify Players"}
                    </Button>
                  </div>

                  <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                    <CardHeader className="border-b border-slate-200/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Starting Lineup ({startingLineup.length}/11)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="w-full mx-auto lg:max-w-4xl xl:max-w-5xl">
                        <LineupField
                          formation={formation}
                          positions={getFieldPositions()}
                          startingLineup={startingLineup}
                          players={players}
                          onPositionClick={handlePositionClick}
                          onRemovePlayer={handleRemovePlayer}
                          isEditable={true}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 border-b border-slate-200/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Substitutes ({substitutes.length})</CardTitle>
                      <Button
                        onClick={() => setBenchSlots(benchSlots + 1)}
                        className="bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl shadow-lg w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Bench Slot
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {Array.from({ length: benchSlots }).map((_, index) => {
                          const playerId = substitutes[index];
                          const player = playerId ? players.find(p => p.id === playerId) : null;
                          
                          return (
                            <div
                              key={index}
                              className="relative bg-white/80 backdrop-blur-xl border-2 border-dashed border-slate-300/50 rounded-xl p-3 hover:border-[#118ff3] hover:shadow-lg transition-all cursor-pointer"
                              onClick={() => {
                                if (!playerId) {
                                  setSelectedPosition("bench");
                                  setShowPlayerModal(true);
                                }
                              }}
                            >
                              {player ? (
                                <div className="text-center">
                                  <div className="w-10 h-10 mx-auto bg-gray-200 rounded-full flex items-center justify-center font-bold text-base mb-2">
                                    {player.jersey_number}
                                  </div>
                                  <p className="text-xs font-medium truncate">
                                    {player.first_name && player.last_name ? `${player.first_name} ${player.last_name}` : (player.email || `Player ${player.id.slice(0, 8)}`)}
                                  </p>
                                  <p className="text-[10px] text-gray-500 capitalize truncate">{player.position}</p>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveSub(playerId);
                                    }}
                                    className="mt-2 w-full text-xs h-7 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 relative">
                                  {/* Add delete button for empty slots */}
                                  {benchSlots > substitutes.length && (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveBenchSlot(index);
                                      }}
                                      className="absolute top-0 right-0 p-1 h-6 w-6 text-slate-400 hover:text-red-500 bg-transparent hover:bg-red-50 rounded-lg"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Plus className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                                  <p className="text-[10px] text-slate-500">Add Player</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}

          {selectedEventId && isSelectedEventPast && existingLineup && (
            <>
              <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                <CardHeader className="border-b border-slate-200/50">
                  <CardTitle className="text-xl font-bold text-slate-900">Starting Lineup (View Only)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="w-full mx-auto lg:max-w-4xl xl:max-w-5xl">
                    <LineupField
                      formation={formation}
                      positions={getFieldPositions()}
                      startingLineup={startingLineup}
                      players={players}
                      onPositionClick={() => {}}
                      onRemovePlayer={() => {}}
                      isEditable={false}
                    />
                  </div>
                </CardContent>
              </Card>

              {substitutes.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-3xl">
                  <CardHeader className="border-b border-slate-200/50">
                    <CardTitle className="text-xl font-bold text-slate-900">Substitutes (View Only)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {substitutes.map((playerId, index) => {
                        const player = players.find(p => p.id === playerId);
                        
                        return player ? (
                          <div key={index} className="bg-white/80 backdrop-blur-xl border-2 border-slate-300/50 rounded-xl p-3">
                            <div className="text-center">
                              <div className="w-10 h-10 mx-auto bg-slate-200 rounded-full flex items-center justify-center font-bold text-base mb-2">
                                {player.jersey_number}
                              </div>
                              <p className="text-xs font-medium truncate text-slate-900">
                                {player.first_name && player.last_name ? `${player.first_name} ${player.last_name}` : (player.email || `Player ${player.id.slice(0, 8)}`)}
                              </p>
                              <p className="text-[10px] text-slate-500 capitalize truncate">{player.position}</p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {showPlayerModal && (
        <PlayerSelectionModal
          players={players}
          assignedPlayers={getAssignedPlayers()}
          onSelect={handlePlayerSelect}
          onClose={() => {
            setShowPlayerModal(false);
            setSelectedPosition(null);
          }}
        />
      )}
    </div>
  );
}