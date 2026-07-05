import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "./context/GameContext";
import Onboarding from "./components/Onboarding";
import GameScreen from "./components/GameScreen";
import ResultScreen from "./components/ResultScreen";
import AdminScreen from "./components/AdminScreen";

const pageVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit:    { opacity: 0, scale: 1.04, transition: { duration: 0.25, ease: "easeIn" } },
};

// Check URL for ?admin param — e.g. http://localhost:5173/?admin
const isAdmin = new URLSearchParams(window.location.search).has("admin");

export default function App() {
  const { gamePhase } = useGame();

  // Admin dashboard — only accessible via /?admin in URL
  if (isAdmin) {
    return <AdminScreen />;
  }

  return (
    <div className="min-h-screen w-full bg-game-gradient font-nunito overflow-x-hidden relative">
      {/* Decorative background orbs */}
      <div className="orb w-96 h-96 top-[-8rem] left-[-8rem] bg-selfie-pink-500 opacity-20" />
      <div className="orb w-80 h-80 bottom-[-6rem] right-[-6rem] bg-selfie-purple-500 opacity-20" />
      <div className="orb w-60 h-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-selfie-gold-400 opacity-5" />

      <AnimatePresence mode="wait">
        {gamePhase === "onboarding" && (
          <motion.div key="onboarding" {...pageVariants} className="min-h-screen">
            <Onboarding />
          </motion.div>
        )}
        {gamePhase === "playing" && (
          <motion.div key="playing" {...pageVariants} className="min-h-screen">
            <GameScreen />
          </motion.div>
        )}
        {gamePhase === "results" && (
          <motion.div key="results" {...pageVariants} className="min-h-screen">
            <ResultScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
