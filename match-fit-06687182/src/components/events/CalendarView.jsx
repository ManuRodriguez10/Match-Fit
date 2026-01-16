import React, { useState } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarView({ events, onEventClick, onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get all days in the month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add days from previous/next month to fill the grid
  const firstDayOfWeek = getDay(monthStart);
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });

  const lastDayOfWeek = getDay(monthEnd);
  const daysAfterMonth = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...daysBeforeMonth, ...daysInMonth, ...daysAfterMonth];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg p-4"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="rounded-xl hover:bg-slate-100 h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-bold text-slate-900 min-w-[180px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="rounded-xl hover:bg-slate-100 h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={goToToday}
          className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl px-3 py-1.5 h-auto text-sm"
        >
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => onDayClick && onDayClick(day)}
                className={`
                  min-h-[70px] p-1.5 rounded-lg border transition-all cursor-pointer
                  ${isCurrentMonth 
                    ? "bg-white/50 border-slate-200/50" 
                    : "bg-slate-50/30 border-slate-100/50"
                  }
                  ${isToday 
                    ? "ring-1 ring-[#118ff3] ring-offset-1 bg-[#118ff3]/5" 
                    : ""
                  }
                  hover:shadow-md hover:border-slate-300/50
                `}
              >
                {/* Day Number */}
                <div className={`
                  text-xs font-semibold mb-1
                  ${isCurrentMonth ? "text-slate-900" : "text-slate-400"}
                  ${isToday ? "text-[#118ff3]" : ""}
                `}>
                  {format(day, "d")}
                </div>

                {/* Events */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`
                        text-[10px] p-1 rounded cursor-pointer transition-all
                        ${getEventTypeColorClass(event.type)} text-white
                        hover:shadow-md hover:opacity-90
                      `}
                    >
                      <div className="font-medium truncate leading-tight">{event.title}</div>
                      <div className="text-[9px] opacity-90 leading-tight">
                        {format(new Date(event.date), "h:mm a")}
                      </div>
                    </motion.div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-slate-500 font-medium px-1">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-200/50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-slate-600">Game</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-xs text-slate-600">Practice</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-xs text-slate-600">Meeting</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
