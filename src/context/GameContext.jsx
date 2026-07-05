import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { pickRandomPoses } from "../data/poses";

// =============================================
//  GAME CONTEXT
//  Holds all global state for the selfie game.
//  Persists userId to sessionStorage so a page
//  refresh doesn't create a duplicate user.
// =============================================

const GameContext = createContext(null);

const POSES_PER_ROUND = 5;

// Restore userId from sessionStorage on load (avoids duplicate users on refresh)
const storedUserId = sessionStorage.getItem("selfie_userId") || null;
const storedUser   = sessionStorage.getItem("selfie_user")
  ? JSON.parse(sessionStorage.getItem("selfie_user"))
  : null;

export function GameProvider({ children }) {
  // ---- User info ----
  const [user, setUser]         = useState(storedUser);    // { name, gender, age }
  const [userId, setUserId]     = useState(storedUserId);  // Firestore doc ID

  // ---- Game phase: 'onboarding' | 'playing' | 'results' ----
  const [gamePhase, setGamePhase] = useState(
    storedUserId ? "playing" : "onboarding"
  );

  // ---- Pose round state ----
  const [poses, setPoses]              = useState(() => pickRandomPoses(POSES_PER_ROUND));
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [completedSelfies, setCompletedSelfies] = useState([]); // [{ pose, imageUrl, selfieId, points }]
  const [totalScore, setTotalScore]    = useState(0);

  // ---- Judging / upload state ----
  const [isUploading, setIsUploading]  = useState(false);

  // ---- Actions ----

  /** Called after onboarding form is submitted */
  const startGame = useCallback((userInfo, newUserId) => {
    setUser(userInfo);
    setUserId(newUserId);
    sessionStorage.setItem("selfie_userId", newUserId);
    sessionStorage.setItem("selfie_user", JSON.stringify(userInfo));
    setPoses(pickRandomPoses(POSES_PER_ROUND));
    setCurrentPoseIndex(0);
    setCompletedSelfies([]);
    setTotalScore(0);
    setGamePhase("playing");
  }, []);

  /** Called after each selfie is submitted + scored */
  const submitSelfie = useCallback(({ pose, imageUrl, selfieId, points }) => {
    setCompletedSelfies((prev) => [...prev, { pose, imageUrl, selfieId, points }]);
    setTotalScore((prev) => prev + points);
    setCurrentPoseIndex((prev) => prev + 1);
  }, []);

  /** Called when all poses are done → show results */
  const finishGame = useCallback(() => {
    setGamePhase("results");
  }, []);

  /** Play Again — keep same user, fresh pose set */
  const playAgain = useCallback(() => {
    setPoses(pickRandomPoses(POSES_PER_ROUND));
    setCurrentPoseIndex(0);
    setCompletedSelfies([]);
    setTotalScore(0);
    setGamePhase("playing");
  }, []);

  const currentPose = poses[currentPoseIndex] ?? null;

  const value = useMemo(() => ({
    // State
    user,
    userId,
    gamePhase,
    poses,
    currentPoseIndex,
    currentPose,
    completedSelfies,
    totalScore,
    isUploading,
    posesPerRound: POSES_PER_ROUND,
    // Actions
    startGame,
    submitSelfie,
    finishGame,
    playAgain,
    setIsUploading,
  }), [
    user, userId, gamePhase, poses, currentPoseIndex,
    currentPose, completedSelfies, totalScore, isUploading,
    startGame, submitSelfie, finishGame, playAgain,
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
