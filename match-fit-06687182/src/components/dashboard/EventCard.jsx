import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";

export default function EventCard({ event, index }) {
  const getTypeColor = (type) => {
    switch (type) {
      case "game":
        return "bg-red-100 text-red-700 border-red-200";
      case "practice":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-[#118ff3]/30 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 mb-2 group-hover:text-[#118ff3] transition-colors">
            {event.title}
          </h4>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-[#118ff3]" />
              <span>{format(new Date(event.date), "MMM d, h:mm a")}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(event.type)}`}>
              {event.type}
            </span>
            {event.opponent && (
              <span className="text-xs text-slate-500 font-medium">
                vs {event.opponent}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
