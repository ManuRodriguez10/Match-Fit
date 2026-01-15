import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, subtitle, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-slate-900/5 overflow-hidden hover:shadow-2xl hover:shadow-slate-900/10 transition-all"
    >
      <div className={`${gradient} text-white p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm font-medium opacity-90">{label}</div>
        <div className="text-xs opacity-75 mt-1">{subtitle}</div>
      </div>
    </motion.div>
  );
}
