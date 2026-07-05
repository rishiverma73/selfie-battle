import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { saveSelfie, saveSession } from "../firebase";
import { awardRandomPoints } from "../data/compliments";
import { getTitleByGender } from "../data/compliments";
import PoseCard from "./PoseCard";
import CameraCapture from "./CameraCapture";
import JudgingAnimation from "./JudgingAnimation";
import ScoreReveal from "./ScoreReveal";

// Stage: 'idle' | 'judging' | 'scored'
export default function GameScreen() {
  const {
    user, userId,
    poses, currentPoseIndex, currentPose,
    completedSelfies, totalScore, posesPerRound,
    submitSelfie, finishGame,
  } = useGame();

  const [stage, setStage]         = useState("idle");    // idle | judging | scored
  const [pendingPoints, setPendingPoints] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const pendingDataRef = useRef(null); // holds { selfieId, imageUrl, points } while judging

  const isLastPose = currentPoseIndex === posesPerRound - 1;

  // Called when user taps "Looks Good, Submit!" in CameraCapture
  const handleCapture = useCallback(async (imageBlob) => {
    const points = awardRandomPoints();
    setPendingPoints(points);
    setStage("judging");

    // ── Set local fallback immediately so the game never gets stuck ──
    const localId  = `local_${Date.now()}`;
    const localUrl = URL.createObjectURL(imageBlob);
    pendingDataRef.current = { selfieId: localId, imageUrl: localUrl, points };

    // ── Judging timer fires after 1.6s NO MATTER WHAT ──
    setTimeout(() => {
      setStage("scored");
    }, 1600);

    // ── Upload runs in background, updates ref if it finishes in time ──
    setIsUploading(true);
    try {
      const uploadTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout")), 8000)
      );
      const result = await Promise.race([
        saveSelfie({
          userId,
          poseName: currentPose.name,
          imageBlob,
          pointsEarned: points,
        }),
        uploadTimeout,
      ]);
      // Upgrade from local blob to real Firebase URL
      pendingDataRef.current = {
        selfieId: result.selfieId,
        imageUrl: result.imageUrl,
        points,
      };
    } catch (err) {
      console.warn("Upload failed/timed out — using local preview:", err.message);
    } finally {
      setIsUploading(false);
    }
  }, [userId, currentPose]);

  // Called when user taps "Next Pose" or "See My Results"
  const handleNext = useCallback(async () => {
    const { selfieId, imageUrl, points } = pendingDataRef.current || {};
    submitSelfie({ pose: currentPose, imageUrl, selfieId, points });
    setStage("idle");

    if (isLastPose) {
      // ✅ Go to results screen IMMEDIATELY — never wait on Firebase
      finishGame();

      // Save session in background (doesn't block UI)
      const newSelfieIds = [
        ...completedSelfies.map((s) => s.selfieId),
        selfieId,
      ].filter(Boolean);
      const newTotal = totalScore + (points || 0);

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session save timeout")), 5000)
        );
        await Promise.race([
          saveSession({
            userId,
            totalScore: newTotal,
            title: getTitleByGender(user?.gender),
            selfieIds: newSelfieIds,
          }),
          timeoutPromise,
        ]);
      } catch (err) {
        console.warn("Session save failed/timed out:", err.message);
      }
    }
  }, [currentPose, completedSelfies, totalScore, userId, user, isLastPose, submitSelfie, finishGame]);

  if (!currentPose) return null;

  const progress = ((currentPoseIndex) / posesPerRound) * 100;
  const scoreDisplay = totalScore + (stage === "scored" ? pendingPoints : 0);

  return (
    <div className="min-h-screen flex flex-col px-4 py-5 relative z-10 max-w-lg mx-auto">
      {/* Header — score + progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          {/* Pose counter */}
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="text-lg">📸</span>
            <span className="font-bold text-white/80 text-sm">
              Pose <span className="text-selfie-pink-300 font-black">{currentPoseIndex + 1}</span>
              <span className="text-white/40"> / {posesPerRound}</span>
            </span>
          </div>

          {/* Score */}
          <motion.div
            className="glass-card px-4 py-2 flex items-center gap-2"
            key={scoreDisplay}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg">⭐</span>
            <span className="font-black text-selfie-gold-300 text-base">{scoreDisplay}</span>
            <span className="text-white/40 text-xs font-semibold">pts</span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          <motion.div
            className="h-2 rounded-full"
            style={{ background: "linear-gradient(90deg, #ff1f7e, #8040ff)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="idle"
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Pose challenge card */}
              <PoseCard pose={currentPose} />

              {/* Camera */}
              <div className="glass-card p-4">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest text-center mb-3">
                  📸 Your Camera
                </p>
                <CameraCapture onCapture={handleCapture} disabled={isUploading} />
              </div>
            </motion.div>
          )}

          {stage === "judging" && (
            <motion.div
              key="judging"
              className="glass-card flex-1 flex items-center justify-center min-h-64"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <JudgingAnimation />
            </motion.div>
          )}

          {stage === "scored" && (
            <motion.div
              key="scored"
              className="glass-card flex-1 flex items-center justify-center min-h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScoreReveal
                points={pendingPoints}
                onNext={handleNext}
                isLast={isLastPose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completed selfies mini-strip */}
      {completedSelfies.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {completedSelfies.map((s, i) => (
            <div key={i} className="flex-shrink-0 relative">
              <img
                src={s.imageUrl}
                alt={s.pose?.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-selfie-purple-500"
              />
              <span className="absolute -top-1 -right-1 bg-selfie-gold-400 text-gray-900 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
