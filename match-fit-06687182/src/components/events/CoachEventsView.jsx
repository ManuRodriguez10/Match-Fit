import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { format, isFuture, isPast, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import EventForm from "./EventForm";
import EventDetails from "./EventDetails";
import { toast } from "sonner";

export default function CoachEventsView({ user }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!user?.team_id) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    loadEvents();
  }, [user?.team_id, location.pathname]);

  useEffect(() => {
    setSelectedEvent(null);
    setShowEventForm(false);
    setEditingEvent(null);
  }, [location.pathname]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", user.team_id)
        .order("date", { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Unable to load events. Please try again.");
      setEvents([]);
    }
    setIsLoading(false);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const payload = {
        ...eventData,
        team_id: user.team_id
      };

      const { error } = await supabase
        .from("events")
        .insert(payload);

      if (error) {
        throw error;
      }

      setShowEventForm(false);
      loadEvents();
      toast.success("Event created");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to create event");
      throw error;
    }
  };

  const handleEditEvent = async (eventData) => {
    try {
      const { error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", editingEvent.id);

      if (error) {
        throw error;
      }

      setEditingEvent(null);
      setShowEventForm(false);
      loadEvents();
      toast.success("Event updated");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error.message || "Failed to update event");
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) {
        throw error;
      }

      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("There was an error deleting the event. Please try again.");
    }
  };

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
      <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader 
          className="pb-3"
          onClick={() => setSelectedEvent(event)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
              <div>
                <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                <p className="text-sm text-gray-600 capitalize">{event.type}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              event.required 
                ? "bg-red-100 text-red-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {event.required ? "Required" : "Optional"}
            </span>
          </div>
        </CardHeader>
        <CardContent onClick={() => setSelectedEvent(event)}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}
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
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter events by time
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Calendar</h1>
            <p className="text-gray-600 mt-1">Schedule and manage team events</p>
          </div>
          <Button className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]" disabled>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Calendar</h1>
          <p className="text-gray-600 mt-1">Schedule and manage team events</p>
        </div>
        {!showEventForm && (
          <Button 
            className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
            onClick={() => setShowEventForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {showEventForm && (
        <EventForm
          event={editingEvent}
          onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => {
            setEditingEvent(event);
            setSelectedEvent(null);
            setShowEventForm(true);
          }}
          onDelete={handleDeleteEvent}
          userRole={user.team_role}
        />
      )}

      {/* Only show event list when not creating/editing and not viewing details */}
      {!showEventForm && !selectedEvent && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {thisWeekEvents.map(renderEventCard)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events this week</h3>
                <p className="text-gray-600 mb-6">There are no events scheduled for this week.</p>
                <Button 
                  className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
                  onClick={() => setShowEventForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all-upcoming" className="mt-6">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(renderEventCard)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first team event</p>
                <Button 
                  className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
                  onClick={() => setShowEventForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Event
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      )}
    </div>
  );
}