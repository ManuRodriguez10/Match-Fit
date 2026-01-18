import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, MapPin, Users, Clock, Trash2 } from "lucide-react";
import { format, isFuture, isPast, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import EventForm from "./EventForm";
import EventDetails from "./EventDetails";
import CalendarView from "./CalendarView";
import WeeklyCalendarView from "./WeeklyCalendarView";
import DayDetailsModal from "./DayDetailsModal";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { toast } from "sonner";

export default function CoachEventsView({ user }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [initialEventDate, setInitialEventDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("calendar");
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
    setSelectedDay(null);
    setShowEventForm(false);
    setEditingEvent(null);
    setInitialEventDate(null);
  }, [location.pathname]);

  // Auto-update date for "Today" tab
  useEffect(() => {
    let dailyInterval = null;

    // Update every minute to catch date changes
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Every minute

    // Calculate time until midnight for accurate date change
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;

    const midnightTimeout = setTimeout(() => {
      setCurrentDate(new Date());
      // After midnight, update once per day
      dailyInterval = setInterval(() => {
        setCurrentDate(new Date());
      }, 86400000); // 24 hours
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
      if (dailyInterval) {
        clearInterval(dailyInterval);
      }
    };
  }, []);

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
      setInitialEventDate(null);
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
      setInitialEventDate(null);
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
      setSelectedDay(null);
      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("There was an error deleting the event. Please try again.");
    }
  };

  const handleClearAllPastEvents = async () => {
    if (pastEvents.length === 0) {
      return;
    }

    const confirmMessage = `Are you sure you want to delete all ${pastEvents.length} past event${pastEvents.length === 1 ? '' : 's'}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      const pastEventIds = pastEvents.map(e => e.id);
      const { error } = await supabase
        .from("events")
        .delete()
        .in("id", pastEventIds);

      if (error) {
        throw error;
      }

      setSelectedEvent(null);
      setSelectedDay(null);
      loadEvents();
      toast.success(`Successfully deleted ${pastEvents.length} past event${pastEvents.length === 1 ? '' : 's'}.`);
    } catch (error) {
      console.error("Error clearing past events:", error);
      toast.error("There was an error clearing past events. Please try again.");
    }
  };

  const handleCreateEventForDay = (date) => {
    setSelectedDay(null);
    setEditingEvent(null);
    setInitialEventDate(date);
    setShowEventForm(true);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "game":
        return "bg-gradient-to-br from-red-500 to-red-600";
      case "practice":
        return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "meeting":
        return "bg-gradient-to-br from-purple-500 to-purple-600";
      default:
        return "bg-gradient-to-br from-slate-500 to-slate-600";
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
    const eventDate = new Date(event.date);
    const isToday = format(eventDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onClick={() => setSelectedEvent(event)}
        className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-900/5 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300/80"
      >
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${getEventTypeColor(event.type)}`} />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-2xl ${getEventTypeColor(event.type)} flex items-center justify-center text-white text-xl shadow-lg`}>
                {getEventTypeIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#118ff3] transition-colors line-clamp-2 mb-1">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 capitalize">{event.type}</span>
                  {isToday && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#118ff3]/10 text-[#118ff3] border border-[#118ff3]/20">
                      Today
                    </span>
                  )}
                </div>
              </div>
            </div>
            {event.required && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
                Required
              </span>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-[#118ff3]" />
              <span className="font-medium">{format(eventDate, "MMM d, yyyy")}</span>
              <Clock className="w-4 h-4 text-slate-400 ml-2" />
              <span>{format(eventDate, "h:mm a")}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            
            {event.opponent && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-medium">vs {event.opponent}</span>
              </div>
            )}
            
            {event.description && (
              <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Filter events by time - use currentDate for automatic updates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Today's events - automatically updates when currentDate changes
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return isSameDay(eventDate, currentDate);
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // This week's events - automatically updates when currentDate changes
  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
  });
  
  const upcomingEvents = events.filter(e => isFuture(new Date(e.date)));
  const pastEvents = events.filter(e => isPast(new Date(e.date)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
        <DashboardBackground />
        <DashboardNav user={user} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                  Team Calendar
                </span>
              </h1>
              <p className="text-slate-600 text-lg">Schedule and manage team events</p>
            </div>
            <Button className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white shadow-lg shadow-[#118ff3]/30 rounded-xl px-6 py-6 h-auto" disabled>
              <Plus className="w-5 h-5 mr-2" />
              New Event
            </Button>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center">
            <p className="text-slate-500">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                Team Calendar
              </span>
            </h1>
            <p className="text-slate-600 text-lg">Schedule and manage team events</p>
          </div>
          
          {!showEventForm && (
            <Button 
              className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white shadow-lg shadow-[#118ff3]/30 rounded-xl px-6 py-6 h-auto"
              onClick={() => setShowEventForm(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          )}
        </motion.div>

        {/* Event Form */}
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EventForm
              event={editingEvent}
              initialDate={initialEventDate}
              onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(null);
                setInitialEventDate(null);
              }}
            />
          </motion.div>
        )}

        {/* Event Details */}
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

        {/* Day Details Modal */}
        {selectedDay && (
          <DayDetailsModal
            selectedDate={selectedDay}
            events={events}
            onClose={() => setSelectedDay(null)}
            onEventClick={(event) => {
              setSelectedDay(null);
              setSelectedEvent(event);
            }}
            onEditEvent={(event) => {
              setSelectedDay(null);
              setEditingEvent(event);
              setShowEventForm(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onCreateEvent={handleCreateEventForDay}
            userRole={user?.team_role || "coach"}
          />
        )}

        {/* Event List */}
        {!showEventForm && !selectedEvent && (
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="calendar" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <TabsList className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-1.5 h-auto">
                <TabsTrigger 
                  value="calendar"
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#118ff3] data-[state=active]:to-[#0c5798] data-[state=active]:text-white"
                >
                  Calendar ({events.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="today"
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#118ff3] data-[state=active]:to-[#0c5798] data-[state=active]:text-white"
                >
                  Today ({todayEvents.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="this-week" 
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#118ff3] data-[state=active]:to-[#0c5798] data-[state=active]:text-white"
                >
                  This Week ({thisWeekEvents.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="past"
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#118ff3] data-[state=active]:to-[#0c5798] data-[state=active]:text-white"
                >
                  Past ({pastEvents.length})
                </TabsTrigger>
              </TabsList>
              
              {/* Clear All Past Events Button - only show on Past tab */}
              {activeTab === "past" && pastEvents.length > 0 && (
                <Button
                  onClick={handleClearAllPastEvents}
                  className="bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 shadow-lg shadow-red-600/30 rounded-xl px-4 py-2.5 h-auto text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all past events
                </Button>
              )}
            </div>
            
            <TabsContent value="today" className="mt-0">
              {todayEvents.length > 0 ? (
                <div className="space-y-4">
                  {/* Today's Date Header */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#118ff3] to-[#0c5798] flex items-center justify-center shadow-lg shadow-[#118ff3]/30">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {format(currentDate, "EEEE, MMMM d, yyyy")}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'} scheduled
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Today's Events */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {todayEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {renderEventCard(event)}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No events today
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {format(currentDate, "EEEE, MMMM d, yyyy")} is clear.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl"
                    onClick={() => setShowEventForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-0">
              <CalendarView 
                events={events} 
                onEventClick={setSelectedEvent}
                onDayClick={setSelectedDay}
              />
            </TabsContent>
            
            <TabsContent value="this-week" className="mt-0">
              <WeeklyCalendarView 
                events={thisWeekEvents}
                currentDate={currentDate}
                onEventClick={setSelectedEvent}
                onDayClick={setSelectedDay}
              />
            </TabsContent>
            
            <TabsContent value="past" className="mt-0">
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {renderEventCard(event)}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-12 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No past events</h3>
                  <p className="text-slate-600">Past events will appear here once they've occurred.</p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}