import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { format, isPast } from "date-fns";

export default function EventDetails({ event, onClose, onEdit, onDelete, userRole }) {
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl relative max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getEventTypeIcon(event.type)}</span>
              <div>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <p className="text-sm text-gray-500 capitalize mt-1">{event.type}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto flex-1 pt-6">
          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span>{format(new Date(event.date), "eeee, MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{event.location}</span>
            </div>
            {event.opponent && (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="font-medium">Opponent:</span>
                <span>{event.opponent}</span>
              </div>
            )}
            {event.description && (
              <div className="pt-2">
                <p className="text-gray-700">{event.description}</p>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                event.required 
                  ? "bg-red-100 text-red-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {event.required ? "Attendance Required" : "Optional"}
              </span>
              {isEventPast && (
                <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700">
                  Past Event
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons - Only show for coaches */}
          {isCoach && onEdit && onDelete && (
            <div className="flex gap-3 pt-2 border-t">
              {/* Only show Edit button for future events */}
              {!isEventPast && (
                <Button onClick={() => onEdit(event)} className="flex-1">
                  <Edit className="w-4 h-4 mr-2"/>
                  Edit Event
                </Button>
              )}
              <Button 
                onClick={() => onDelete(event.id)} 
                variant="destructive"
                className={isEventPast ? "w-full" : "flex-1"}
              >
                <Trash2 className="w-4 h-4 mr-2"/>
                Delete Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}