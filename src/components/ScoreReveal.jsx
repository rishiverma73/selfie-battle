import React from "react";
import { motion } from "framer-motion";
import { getRandomCompliment } from "../data/compliments";

/**
 * ScoreReveal — shown after judging animation to display awarded points.
 * Props:
 *  points    — number (70–100)
 *  onNext()  — called to advance to the next pose
 *  isLast    — if true, shows "See Results!" instead of "Next Pose"
 */
export default function ScoreReveal({ points, onNext, isLast }) {
  const compliment = getRandomCompliment(points);

  return (
    <motion.div
      className="flex flex-col items-center gap-5 py-6 px-4 text-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Big points number */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
      >
        <div
          className="text-6xl font-black"
          style={{
            background: "linear-gradient(135deg, #ffd63d, #f59e00)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          +{points}
        </div>
        <div className="text-white/60 text-sm font-bold -mt-1">POINTS</div>

        {/* Particle burst */}
        {["🌟", "✨", "💫", "⭐"].map((star, i) => (
          <motion.span
            key={i}
            className="absolute text-xl select-none"
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos((i / 4) * Math.PI * 2) * 60,
              y: Math.sin((i / 4) * Math.PI * 2) * 60,
              scale: 0,
            }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
            style={{
              top: "50%", left: "50%",
              marginTop: -14, marginLeft: -14,
            }}
          >
            {star}
          </motion.span>
        ))}
      </motion.div>

      {/* Compliment message */}
      <motion.p
        className="text-white font-bold text-base sm:text-lg max-w-xs leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {compliment}
      </motion.p>

      {/* Next button */}
      <motion.button
        id="next-pose-btn"
        type="button"
        className="btn-primary px-10 py-4 text-base"
        onClick={onNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.97 }}
      >
        {isLast ? "🎉 See My Results!" : "Next Pose →"}
      </motion.button>
    </motion.div>
  );
}
