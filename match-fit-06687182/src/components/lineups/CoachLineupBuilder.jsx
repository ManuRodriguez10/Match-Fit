import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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

export default function CoachLineupBuilder({ user }) {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formation, setFormation] = useState("4-4-2");
  const [startingLineup, setStartingLineup] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [existingLineup, setExistingLineup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [benchSlots, setBenchSlots] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadLineupForEvent(selectedEventId);
      const event = events.find(e => e.id === selectedEventId);
      setSelectedEvent(event);
    }
  }, [selectedEventId, events]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, playersResponse] = await Promise.all([
        base44.entities.Event.filter({ team_id: user.team_id, type: "game" }, "-date"),
        base44.functions.invoke('getTeamMembers')
      ]);
      
      const allPlayers = playersResponse.data.teamMembers.filter(member => member.team_role === "player");
      
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
      const lineups = await base44.entities.Lineup.filter({ team_id: user.team_id, event_id: eventId });
      if (lineups.length > 0) {
        const lineup = lineups[0];
        setExistingLineup(lineup);
        setFormation(lineup.formation);
        setStartingLineup(lineup.starting_lineup || []);
        setSubstitutes(lineup.substitutes || []);
        if (lineup.substitutes && lineup.substitutes.length > 10) {
          setBenchSlots(lineup.substitutes.length);
        } else {
          setBenchSlots(10); // Reset to default if fewer than 10 subs or none
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

  const handlePlayerSelect = (playerEmail) => {
    if (selectedPosition === "bench") {
      if (!substitutes.includes(playerEmail)) {
        setSubstitutes([...substitutes, playerEmail]);
      }
    } else {
      const existingIndex = startingLineup.findIndex(p => p.position === selectedPosition);
      if (existingIndex >= 0) {
        const updated = [...startingLineup];
        updated[existingIndex] = { player_email: playerEmail, position: selectedPosition };
        setStartingLineup(updated);
      } else {
        setStartingLineup([...startingLineup, { player_email: playerEmail, position: selectedPosition }]);
      }
    }
    setShowPlayerModal(false);
    setSelectedPosition(null);
  };

  const handleRemovePlayer = (positionName) => {
    setStartingLineup(startingLineup.filter(p => p.position !== positionName));
  };

  const handleRemoveSub = (playerEmail) => {
    setSubstitutes(substitutes.filter(email => email !== playerEmail));
  };

  const getAssignedPlayers = () => {
    const assigned = new Set();
    startingLineup.forEach(p => assigned.add(p.player_email));
    substitutes.forEach(email => assigned.add(email));
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
        await base44.entities.Lineup.update(existingLineup.id, lineupData);
        toast.success("Lineup draft saved");
        // Re-fetch lineup to ensure local state is consistent with DB, especially 'published' status
        loadLineupForEvent(selectedEventId);
      } else {
        const newLineup = await base44.entities.Lineup.create(lineupData);
        setExistingLineup(newLineup);
        toast.success("Lineup draft created");
      }
    } catch (error) {
      console.error("Error saving lineup:", error);
      toast.error("Failed to save lineup");
    }
    setIsSaving(false);
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
        await base44.entities.Lineup.update(existingLineup.id, lineupData);
        setExistingLineup(prev => ({ ...prev, published: true })); // Optimistically update published status
      } else {
        const newLineup = await base44.entities.Lineup.create(lineupData);
        setExistingLineup(newLineup);
      }

      // Send email notifications to all players
      await sendLineupNotifications();

      toast.success("Lineup published and players notified!");
    } catch (error) {
      console.error("Error publishing lineup:", error);
      toast.error("Failed to publish lineup");
    } finally {
      setIsPublishing(false);
    }
  };

  const sendLineupNotifications = async () => {
    try {
      const eventTitle = selectedEvent?.title || "your upcoming game";
      const eventDate = selectedEvent?.date ? format(new Date(selectedEvent.date), "MMMM d, yyyy") : "";
      const lineupPageUrl = `${window.location.origin}${createPageUrl(`Lineups?eventId=${selectedEventId}`)}`;
      
      for (const player of players) {
        const playerName = player.first_name && player.last_name 
          ? `${player.first_name} ${player.last_name}` 
          : player.email;
          
        await base44.integrations.Core.SendEmail({
          to: player.email,
          subject: `MatchFit: Lineup Published for ${eventTitle}`,
          body: `Hi ${playerName},\n\nCoach ${user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email} has published the lineup for your upcoming ${eventTitle}${eventDate ? ` on ${eventDate}` : ''}.\n\nClick here to see the lineup: ${lineupPageUrl}\n\nGood luck!\n\n- MatchFit Team `
        });
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      // Don't throw error - lineup is already published
    }
  };

  const handleDeleteLineup = async () => {
    if (!existingLineup) return;
    
    if (!confirm("Are you sure you want to delete this lineup? This action cannot be undone.")) return;

    try {
      await base44.entities.Lineup.delete(existingLineup.id);
      setExistingLineup(null);
      setStartingLineup([]);
      setSubstitutes([]);
      setBenchSlots(10); // Reset bench slots
      setFormation("4-4-2"); // Reset formation
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
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-main)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lineup Builder</h1>
          <p className="text-gray-600 mt-1">Create and manage game lineups</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={createPageUrl("Events")}>
            <Button variant="outline" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add New Game
            </Button>
          </Link>
          {existingLineup && !isSelectedEventPast && (
            <Button variant="destructive" onClick={handleDeleteLineup} className="w-full sm:w-auto">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Lineup
            </Button>
          )}
        </div>
      </div>

      {existingLineup?.published && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            This lineup has been published and players have been notified.
          </AlertDescription>
        </Alert>
      )}

      {isSelectedEventPast && (
        <Alert className="bg-amber-50 border-amber-200">
          <Calendar className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This game has already passed. Lineups cannot be created or edited for past events.
          </AlertDescription>
        </Alert>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-6">No game events scheduled. Create a game event first to build a lineup.</p>
            <Link to={createPageUrl("Events")}>
              <Button className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]">
                <Plus className="w-4 h-4 mr-2" />
                Schedule a Game
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : upcomingEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2 font-medium">No upcoming games available</p>
            <p className="text-gray-500 text-sm mb-6">All scheduled games have already passed. Lineups can only be created for future games.</p>
            <Link to={createPageUrl("Events")}>
              <Button className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]">
                <Plus className="w-4 h-4 mr-2" />
                Schedule a New Game
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Game</label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger>
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
                  <p className="text-xs text-gray-500">Only upcoming games are available for lineup creation</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Formation</label>
                  <Select value={formation} onValueChange={setFormation} disabled={isSelectedEventPast}>
                    <SelectTrigger>
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
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button
                  onClick={handleClearLineup}
                  disabled={isSaving || isPublishing || (startingLineup.length === 0 && substitutes.length === 0)}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Lineup
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  disabled={isSaving || isPublishing}
                  variant="outline"
                  className="flex-1"
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
                  className="flex-1 bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
                >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Publish & Notify Players
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Starting Lineup ({startingLineup.length}/11)</CardTitle>
                </CardHeader>
                <CardContent>
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

              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <CardTitle>Substitutes ({substitutes.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBenchSlots(benchSlots + 1)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bench Slot
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {Array.from({ length: benchSlots }).map((_, index) => {
                      const playerEmail = substitutes[index];
                      const player = playerEmail ? players.find(p => p.email === playerEmail) : null;
                      
                      return (
                        <div
                          key={index}
                          className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[var(--primary-main)] transition-colors cursor-pointer"
                          onClick={() => {
                            if (!playerEmail) {
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
                                {player.first_name && player.last_name ? `${player.first_name} ${player.last_name}` : player.email}
                              </p>
                              <p className="text-[10px] text-gray-500 capitalize truncate">{player.position}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 w-full text-xs h-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSub(playerEmail);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400">
                              <Plus className="w-6 h-6 mx-auto mb-1" />
                              <p className="text-[10px]">Add Player</p>
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

          {selectedEventId && isSelectedEventPast && existingLineup && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Starting Lineup (View Only)</CardTitle>
                </CardHeader>
                <CardContent>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Substitutes (View Only)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {substitutes.map((playerEmail, index) => {
                        const player = players.find(p => p.email === playerEmail);
                        
                        return player ? (
                          <div key={index} className="border-2 border-gray-300 rounded-lg p-3">
                            <div className="text-center">
                              <div className="w-10 h-10 mx-auto bg-gray-200 rounded-full flex items-center justify-center font-bold text-base mb-2">
                                {player.jersey_number}
                              </div>
                              <p className="text-xs font-medium truncate">
                                {player.first_name && player.last_name ? `${player.first_name} ${player.last_name}` : player.email}
                              </p>
                              <p className="text-[10px] text-gray-500 capitalize truncate">{player.position}</p>
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