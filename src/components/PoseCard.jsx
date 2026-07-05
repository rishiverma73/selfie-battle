import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PoseCard — displays the current pose challenge with emoji and description.
 * Animates in from the right on each new pose.
 */
export default function PoseCard({ pose }) {
  if (!pose) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pose.id}
        className="glass-card p-6 text-center w-full"
        initial={{ opacity: 0, x: 60, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -60, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Emoji */}
        <motion.div
          className="text-6xl mb-3 select-none"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {pose.emoji}
        </motion.div>

        {/* Pose name */}
        <h2 className="text-xl font-black text-gradient mb-1">{pose.name}</h2>

        {/* Description */}
        <p className="text-white/80 text-sm sm:text-base leading-relaxed font-semibold">
          {pose.description}
        </p>

        {/* Decorative sparkles */}
        <div className="flex justify-center gap-3 mt-4 text-xl opacity-60 select-none">
          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.span>
          <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>⭐</motion.span>
          <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
