import React from "react";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2, MapPin, Calendar as CalendarIcon, Users, Clock, ArrowLeft } from "lucide-react";
import { format, isPast } from "date-fns";
import { motion } from "framer-motion";

export default function EventDetails({ event, onClose, onEdit, onDelete, userRole, onBackToDay }) {
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
  
  const isCoach = userRole === "coach";
  const isEventPast = isPast(new Date(event.date));
  
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
        {/* Gradient accent bar */}
        <div className={`h-1 ${getEventTypeColor(event.type)}`} />
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-14 h-14 rounded-2xl ${getEventTypeColor(event.type)} flex items-center justify-center text-white text-2xl shadow-lg flex-shrink-0`}>
                {getEventTypeIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{event.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500 capitalize">{event.type}</span>
                  {isEventPast && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                      Past Event
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onBackToDay && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onBackToDay}
                  className="rounded-xl hover:bg-slate-100"
                  title="Back to day view"
                >
                  <ArrowLeft className="w-5 h-5" />
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
        
        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 rounded-xl bg-[#118ff3]/10 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-[#118ff3]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Date & Time</p>
                <p className="font-medium">{format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
            
            {event.opponent && (
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Opponent</p>
                  <p className="font-medium">vs {event.opponent}</p>
                </div>
              </div>
            )}
            
            {event.description && (
              <div className="pt-2">
                <p className="text-sm text-slate-500 mb-2">Description</p>
                <p className="text-slate-700 leading-relaxed">{event.description}</p>
              </div>
            )}
            
            <div className="flex items-center gap-2 pt-2">
              <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
                event.required 
                  ? "bg-red-100 text-red-700 border border-red-200" 
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {event.required ? "Attendance Required" : "Optional"}
              </span>
            </div>
          </div>

          {/* Action Buttons - Only show for coaches */}
          {isCoach && onEdit && onDelete && (
            <div className="flex gap-3 pt-4 border-t border-slate-200/50">
              {/* Only show Edit button for future events */}
              {!isEventPast && (
                <Button 
                  onClick={() => onEdit(event)} 
                  className="flex-1 bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl shadow-lg shadow-[#118ff3]/30"
                >
                  <Edit className="w-4 h-4 mr-2"/>
                  Edit Event
                </Button>
              )}
              <Button 
                onClick={() => onDelete(event.id)} 
                className={isEventPast ? "w-full bg-red-500 hover:bg-red-600 text-white rounded-xl" : "flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl"}
              >
                <Trash2 className="w-4 h-4 mr-2"/>
                Delete Event
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}