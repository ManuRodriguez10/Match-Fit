import React from "react";
import { motion } from "framer-motion";
import { X, Plus, Edit, Trash2, Calendar as CalendarIcon, MapPin, Users, Clock } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";

export default function DayDetailsModal({ 
  selectedDate, 
  events, 
  onClose, 
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  onCreateEvent,
  userRole
}) {
  if (!selectedDate) return null;

  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return isSameDay(eventDate, selectedDate);
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const getEventTypeColorClass = (type) => {
    switch (type) {
      case "game":
        return "bg-red-500";
      case "practice":
        return "bg-blue-500";
      case "meeting":
        return "bg-purple-500";
      default:
        return "bg-slate-500";
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#118ff3] to-[#0c5798] flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h2>
                <p className="text-sm text-slate-500">
                  {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userRole === "coach" && dayEvents.length > 0 && (
                <Button
                  onClick={() => onCreateEvent(selectedDate)}
                  className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl px-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="p-6 overflow-y-auto flex-1">
          {dayEvents.length > 0 ? (
            <div className="space-y-3">
              {dayEvents.map((event) => {
                const eventDate = new Date(event.date);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-4 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${getEventTypeColorClass(event.type)} flex items-center justify-center text-white text-lg shadow-lg flex-shrink-0`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[#118ff3] transition-colors">
                            {event.title}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="w-4 h-4 text-[#118ff3]" />
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
                                <span>vs {event.opponent}</span>
                              </div>
                            )}
                            {event.description && (
                              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {event.required && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
                            Required
                          </span>
                        )}
                        {userRole === "coach" && (
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditEvent(event)}
                              className="rounded-lg hover:bg-slate-100 h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteEvent(event.id)}
                              className="rounded-lg hover:bg-red-50 hover:text-red-600 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No events scheduled</h3>
              <p className="text-slate-600 mb-6">
                {userRole === "coach" 
                  ? "This day is free. Add an event to get started."
                  : "Your coach hasn't added any events to this day."}
              </p>
              {userRole === "coach" && (
                <Button
                  onClick={() => onCreateEvent(selectedDate)}
                  className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
