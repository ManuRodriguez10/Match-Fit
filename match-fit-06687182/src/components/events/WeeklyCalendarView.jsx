import React from "react";
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";

export default function WeeklyCalendarView({ events, onEventClick, onDayClick, currentDate }) {
  // Get the current week (Monday to Sunday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Get color for event type
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-6"
    >
      {/* Week Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            This week's schedule
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-slate-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, currentDate);

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onDayClick && onDayClick(day)}
                className={`
                  min-h-[120px] p-3 rounded-xl border transition-all cursor-pointer
                  bg-white/50 border-slate-200/50
                  ${isToday 
                    ? "ring-2 ring-[#118ff3] ring-offset-2 bg-[#118ff3]/10 shadow-lg" 
                    : ""
                  }
                  hover:shadow-md hover:border-slate-300/50 hover:bg-white/70
                `}
              >
                {/* Day Number and Date */}
                <div className={`
                  text-sm font-bold mb-2
                  ${isToday ? "text-[#118ff3]" : "text-slate-900"}
                `}>
                  {format(day, "d")}
                </div>
                <div className={`
                  text-xs text-slate-500 mb-3
                  ${isToday ? "text-[#118ff3]/70" : ""}
                `}>
                  {format(day, "MMM")}
                </div>

                {/* Events */}
                <div className="space-y-1.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`
                        text-[11px] p-1.5 rounded-lg transition-all pointer-events-none
                        ${getEventTypeColorClass(event.type)} text-white
                      `}
                    >
                      <div className="font-semibold truncate leading-tight mb-0.5">{event.title}</div>
                      <div className="text-[10px] opacity-90 leading-tight">
                        {format(new Date(event.date), "h:mm a")}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[11px] text-slate-600 font-medium px-1.5 py-1 bg-slate-100 rounded">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200/50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-slate-600 font-medium">Game</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-xs text-slate-600 font-medium">Practice</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-xs text-slate-600 font-medium">Meeting</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}