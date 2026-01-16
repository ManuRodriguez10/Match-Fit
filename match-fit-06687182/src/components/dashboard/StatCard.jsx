import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, subtitle, gradient, delay = 0 }) {
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Animate value counting up
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepValue = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCount(Math.min(Math.round(stepValue * currentStep), value));
      } else {
        setCount(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        y: -6,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className={`group relative ${gradient} text-white rounded-3xl border border-white/20 shadow-xl shadow-slate-900/10 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/20`}
    >
      {/* Animated shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
        animate={isHovered ? { x: ["-100%", "200%"], opacity: [0, 1, 0] } : {}}
        transition={{ duration: 1.2, ease: "easeInOut", repeat: isHovered ? Infinity : 0, repeatDelay: 2 }}
      />
      
      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Icon */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-500 group-hover:shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Value */}
        <div className="mb-1">
          <div className="text-3xl font-bold text-white tracking-tight">
            {count}
          </div>
        </div>

        {/* Label */}
        <div className="text-sm font-medium text-white/90 mb-1">
          {label}
        </div>

        {/* Subtitle */}
        <div className="text-xs text-white/75">
          {subtitle}
        </div>

        {/* Decorative accent line that expands on hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent origin-left"
          initial={{ scaleX: 0 }}
          animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Glow effect behind card */}
      <motion.div
        className={`absolute -inset-2 ${gradient} opacity-0 blur-xl -z-10`}
        animate={isHovered ? { opacity: 0.4, scale: 1.05 } : { opacity: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}
