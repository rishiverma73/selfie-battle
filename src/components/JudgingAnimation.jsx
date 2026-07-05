import React from "react";
import { motion } from "framer-motion";

const JUDGING_MESSAGES = [
  "Judging your pose… 🧑‍⚖️",
  "Our experts are deliberating… 🕵️",
  "Processing pure charisma… ✨",
  "Calculating your swag level… 💅",
  "Analyzing your main character energy… 🎬",
];

/**
 * JudgingAnimation — shown for 1.5s while "scoring" a pose.
 */
export default function JudgingAnimation() {
  const message = JUDGING_MESSAGES[Math.floor(Math.random() * JUDGING_MESSAGES.length)];

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-5 py-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated scale emoji */}
      <motion.div
        className="text-6xl select-none"
        animate={{ rotate: [-10, 10, -10], scale: [1, 1.15, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        ⚖️
      </motion.div>

      {/* Message */}
      <p className="text-white font-bold text-lg text-center px-4">{message}</p>

      {/* Bouncing dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ background: "linear-gradient(135deg, #ff1f7e, #8040ff)" }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
