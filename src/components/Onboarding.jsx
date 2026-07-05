import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { saveUser } from "../firebase";

const GENDERS = [
  { value: "Female", label: "👸 Female", title: "Selfie Queen" },
  { value: "Male",   label: "🤴 Male",   title: "Selfie King"  },
  { value: "Other",  label: "🌟 Other",  title: "Selfie Star"  },
];

export default function Onboarding() {
  const { startGame } = useGame();

  const [name, setName]     = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  async function handleStart(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim())                  return setError("Please enter your name! 😊");
    if (!gender)                       return setError("Pick your gender to get your crown title! 👑");
    if (!age || Number(age) < 5 || Number(age) > 120)
      return setError("Please enter a valid age (5–120)! 🎂");

    setLoading(true);
    try {
      const userInfo = { name: name.trim(), gender, age: Number(age) };

      // Race Firebase against a 5-second timeout so we never hang forever
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firebase timeout")), 5000)
      );

      let newUserId;
      try {
        newUserId = await Promise.race([saveUser(userInfo), timeoutPromise]);
      } catch (firebaseErr) {
        console.warn("Firebase unavailable, using local fallback:", firebaseErr.message);
        newUserId = `local_${Date.now()}`;
      }

      startGame(userInfo, newUserId);
    } catch (err) {
      console.error("Unexpected error:", err);
      // Last-resort fallback — game still starts
      const userInfo = { name: name.trim(), gender, age: Number(age) };
      startGame(userInfo, `local_${Date.now()}`);
    } finally {
      setLoading(false);
    }
  }

  const selectedGender = GENDERS.find((g) => g.value === gender);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative z-10">
      {/* Crown mascot */}
      <motion.div
        className="text-7xl mb-2 select-none"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        👑
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-4xl sm:text-5xl font-black text-center mb-1 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-gradient">Selfie</span>
        <br />
        <span className="text-white">King / Queen</span>
      </motion.h1>

      <motion.p
        className="text-white/60 text-center text-base mb-8 max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Strike a pose. Earn points. Get crowned. 📸
      </motion.p>

      {/* Form card */}
      <motion.div
        className="glass-card w-full max-w-sm p-7 space-y-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wider">
            Your Name
          </label>
          <input
            id="onboarding-name"
            type="text"
            className="game-input"
            placeholder="e.g. Priya, Rahul…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="given-name"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wider">
            Pick Your Crown
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                id={`gender-${g.value.toLowerCase()}`}
                type="button"
                className={`gender-btn text-center text-sm ${gender === g.value ? "active" : ""}`}
                onClick={() => setGender(g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {selectedGender && (
              <motion.p
                key={selectedGender.value}
                className="text-xs text-selfie-pink-300 mt-2 font-semibold text-center"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                You'll be crowned{" "}
                <span className="text-selfie-gold-300 font-black">
                  {selectedGender.title}
                </span>{" "}
                👑
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wider">
            Age
          </label>
          <input
            id="onboarding-age"
            type="number"
            className="game-input"
            placeholder="e.g. 24"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={5}
            max={120}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-selfie-pink-300 text-sm font-semibold text-center py-2 rounded-xl"
              style={{ background: "rgba(255,31,126,0.15)" }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          id="start-challenge-btn"
          type="button"
          className="btn-primary w-full text-center flex items-center justify-center gap-2"
          onClick={handleStart}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? (
            <>
              <span className="animate-spin text-xl">⏳</span>
              Setting up your game…
            </>
          ) : (
            <>
              <span>🎉</span> Start the Challenge!
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Footer note */}
      <motion.p
        className="text-white/30 text-xs mt-8 text-center max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        5 fun poses · Random points · You win every time 😄
      </motion.p>
    </div>
  );
}
