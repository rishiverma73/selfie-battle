import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useGame } from "../context/GameContext";
import { getRankInfo, getTitleByGender } from "../data/compliments";

// Download a base64 image as a .jpg file
function downloadSelfie(imageUrl, poseName) {
  const a = document.createElement("a");
  a.href = imageUrl;
  a.download = `selfie_${poseName.replace(/\s+/g, "_").toLowerCase()}.jpg`;
  a.click();
}

export default function ResultScreen() {
  const { user, totalScore, completedSelfies, playAgain, posesPerRound } = useGame();

  const maxScore = posesPerRound * 100;
  const title    = getTitleByGender(user?.gender);
  const rank     = getRankInfo(totalScore);

  const confettiFiredRef = useRef(false);

  // Fire confetti on mount
  useEffect(() => {
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#ff1f7e", "#8040ff", "#ffd63d", "#ffffff", "#ff91c4"],
    });
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ["#ff1f7e", "#ffd63d", "#8040ff"] });
    }, 400);
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ["#ff1f7e", "#ffd63d", "#8040ff"] });
    }, 500);
  }, []);

  // Share result
  function handleShare() {
    const text = `🎉 I just played Selfie King/Queen!\n👑 I got crowned "${title}" with ${totalScore}/${maxScore} points!\n${rank.emoji} Rank: ${rank.label}\n\nCome challenge me! 😄`;
    if (navigator.share) {
      navigator.share({ title: "Selfie King/Queen", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        alert("Result copied to clipboard! Share it anywhere 📋");
      });
    }
  }

  // Download all selfies as a zip (one by one)
  function downloadAll() {
    completedSelfies.forEach((s, i) => {
      setTimeout(() => downloadSelfie(s.imageUrl, s.pose?.name || `pose_${i + 1}`), i * 300);
    });
  }

  const scorePercent = Math.round((totalScore / maxScore) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 relative z-10 max-w-lg mx-auto">
      {/* Crown */}
      <motion.div
        className="text-6xl mb-2 select-none"
        animate={{ rotate: [-8, 8, -8], y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        👑
      </motion.div>

      <motion.h1
        className="text-3xl sm:text-4xl font-black text-center leading-tight mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        🎉 Congratulations{" "}
        <span className="text-gradient">{user?.name}!</span>
      </motion.h1>

      <motion.p
        className="text-xl font-bold text-center text-white/90 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        You are officially crowned{" "}
        <span className="text-gradient-gold font-black">{title}</span> 👑
      </motion.p>

      {/* Saved status badge */}
      <motion.div
        className="flex items-center gap-2 mb-5 px-4 py-2 rounded-2xl text-sm font-bold"
        style={{ background: "rgba(0,255,100,0.1)", border: "1px solid rgba(0,255,100,0.3)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-green-400 text-base">💾</span>
        <span className="text-green-300">
          {completedSelfies.length} selfies saved to your device!
        </span>
      </motion.div>

      {/* Score card */}
      <motion.div
        className="glass-card w-full p-6 mb-5 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
      >
        <div className="text-5xl font-black text-gradient-gold mb-1">
          {totalScore}
          <span className="text-2xl text-white/40">/{maxScore}</span>
        </div>
        <div className="text-white/50 text-sm font-bold mb-4">Total Score</div>

        <div className="w-full h-3 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
          <motion.div
            className="h-3 rounded-full"
            style={{ background: "linear-gradient(90deg, #ff1f7e, #ffd63d)" }}
            initial={{ width: 0 }}
            animate={{ width: `${scorePercent}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>

        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl font-black text-base"
          style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-2xl">{rank.emoji}</span>
          <span className={rank.color}>{rank.label}</span>
        </motion.div>
      </motion.div>

      {/* Selfie gallery with download buttons */}
      <motion.div
        className="w-full mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest">
            Your Selfie Gallery 📸
          </h2>
          {completedSelfies.length > 0 && (
            <button
              onClick={downloadAll}
              className="text-xs font-bold px-3 py-1 rounded-xl text-selfie-gold-300 border border-selfie-gold-400/40 hover:bg-selfie-gold-400/10 transition-all"
            >
              ⬇️ Save All
            </button>
          )}
        </div>

        {completedSelfies.length === 0 ? (
          <div className="glass-card p-6 text-center text-white/40 text-sm">
            No selfies captured yet
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {completedSelfies.map((s, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 400 }}
              >
                <div
                  className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-selfie-purple-400 cursor-pointer group"
                  onClick={() => downloadSelfie(s.imageUrl, s.pose?.name || `pose_${i + 1}`)}
                  title="Click to download"
                >
                  <img
                    src={s.imageUrl}
                    alt={s.pose?.name}
                    className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                  />
                  {/* Download icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-lg">
                    ⬇️
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 text-center text-white font-black text-xs py-1"
                    style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}
                  >
                    +{s.points}
                  </div>
                </div>
                <p className="text-white/50 text-xs font-semibold text-center leading-tight line-clamp-1 w-full">
                  {s.pose?.name}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="w-full flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <button
          id="play-again-btn"
          type="button"
          className="btn-primary w-full text-center"
          onClick={playAgain}
        >
          🔄 Play Again
        </button>
        <button
          id="share-result-btn"
          type="button"
          className="btn-secondary w-full text-center"
          onClick={handleShare}
        >
          📤 Share Your Result
        </button>
      </motion.div>

      <p className="text-white/20 text-xs mt-8 text-center">
        Selfie King/Queen · Made with ❤️ and 📸
      </p>
    </div>
  );
}
