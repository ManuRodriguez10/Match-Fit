
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users } from "lucide-react";
import { format, isFuture, isPast, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import EventDetails from "./EventDetails";
import { toast } from "sonner";

export default function PlayerEventsView({ user }) {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.team_id) {
      setEvents([]);
      setLineups([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data: eventData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", user.team_id)
        .order("date", { ascending: true });

      if (eventsError) {
        throw eventsError;
      }
      setEvents(eventData || []);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Unable to load events.");
      setEvents([]);
    }

    try {
      const { data: lineupData, error: lineupsError } = await supabase
        .from("lineups")
        .select("*")
        .eq("team_id", user.team_id)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (lineupsError) {
        throw lineupsError;
      }
      setLineups(lineupData || []);
    } catch (error) {
      // Lineups may not be implemented yet; log and continue.
      console.warn("Lineups unavailable:", error.message);
      setLineups([]);
    }

    setIsLoading(false);
  }, [user?.team_id, location.pathname]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "game":
        return "🏆";
      case "practice":
        return "⚽";
      case "meeting":
        return "📋";
      default:
        return "📅";
    }
  };

  const renderEventCard = (event) => {
    return (
      <Card 
        key={event.id} 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setSelectedEvent(event)}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
              <div>
                <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                <p className="text-sm text-gray-500 capitalize mt-1">{event.type}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {format(new Date(event.date), "eeee, MMMM d 'at' h:mm a")}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
          {event.opponent && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              vs {event.opponent}
            </div>
          )}
          {event.description && (
            <p className="text-sm text-gray-700 mt-2">{event.description}</p>
          )}
          {event.required && (
            <div className="pt-3 flex gap-2">
              <span className="px-3 py-2 text-xs bg-red-100 text-red-800 rounded-md flex items-center">
                Attendance Required
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return isWithinInterval(eventDate, { start: weekStart, end: weekEnd }) && isFuture(eventDate);
  });
  
  const upcomingEvents = events.filter(e => isFuture(new Date(e.date)));
  const pastEvents = events.filter(e => isPast(new Date(e.date)));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Calendar</h1>
          <p className="text-gray-600 mt-1">View team events and schedule</p>
        </div>
        <Card>
          <CardContent>
            <p className="text-gray-500">Loading events...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Calendar</h1>
        <p className="text-gray-600 mt-1">View team events and schedule</p>
      </div>

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          userRole={user.team_role}
        />
      )}

      <Tabs defaultValue="this-week">
        <TabsList>
          <TabsTrigger value="this-week">
            This Week ({thisWeekEvents.length})
          </TabsTrigger>
          <TabsTrigger value="all-upcoming">
            All Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastEvents.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="this-week" className="mt-6">
          {thisWeekEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {thisWeekEvents.map(renderEventCard)}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events this week</h3>
              <p className="text-gray-600">You don't have any events scheduled for this week.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all-upcoming" className="mt-6">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map(renderEventCard)}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600">Your coach hasn't scheduled any events yet. Check back soon!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastEvents.map(renderEventCard)}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No past events</h3>
              <p className="text-gray-600">Past events will appear here once they've occurred.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
