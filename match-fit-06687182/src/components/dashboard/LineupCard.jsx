import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function LineupCard({ lineup, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-slate-900">Game Lineup</h4>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Formation:</span> {lineup.formation || "N/A"}
            </p>
            <p className="text-xs text-slate-500">
              {lineup.starting_lineup?.length || 0} starters • {lineup.substitutes?.length || 0} subs
            </p>
          </div>
        </div>
        
        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 whitespace-nowrap">
          Published
        </span>
      </div>
    </motion.div>
  );
}
