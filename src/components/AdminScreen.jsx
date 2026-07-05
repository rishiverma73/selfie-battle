import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllSelfiesFromFirestore,
  getAllUsersFromFirestore,
  getAllSessionsFromFirestore,
  getAllLocalSelfies,
} from "../firebase";

// Format timestamp nicely
function formatTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Download a single selfie image
function downloadSelfie(imageBase64, name, poseName) {
  const a = document.createElement("a");
  a.href = imageBase64;
  a.download = `${name}_${poseName}.jpg`.replace(/\s+/g, "_");
  a.click();
}

// Credentials config (Change these as you wish!)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "adminpassword";

export default function AdminScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin_authenticated") === "true";
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [tab, setTab]         = useState("selfies"); // selfies | players
  const [selfies, setSelfies] = useState([]);
  const [users, setUsers]     = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [selected, setSelected] = useState(null); // enlarged selfie

  // Only run the database fetch effect if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [s, u, sess] = await Promise.all([
          getAllSelfiesFromFirestore(),
          getAllUsersFromFirestore(),
          getAllSessionsFromFirestore(),
        ]);
        setSelfies(s);
        setUsers(u);
        setSessions(sess);
      } catch (e) {
        // Firestore not set up yet — fall back to localStorage
        setError("Firebase not connected. Showing locally saved data only.");
        const local = getAllLocalSelfies();
        setSelfies(local.map((s) => ({ ...s, imageBase64: s.imageBase64 })));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password! ❌");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setUsernameInput("");
    setPasswordInput("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-game-gradient font-nunito flex flex-col items-center justify-center px-4 relative">
        <div className="orb w-96 h-96 top-[-8rem] left-[-8rem] bg-selfie-pink-500 opacity-20" />
        <div className="orb w-80 h-80 bottom-[-6rem] right-[-6rem] bg-selfie-purple-500 opacity-20" />

        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-2">🔐</div>
          <h1 className="text-3xl font-black text-white">
            Admin <span className="text-gradient">Portal</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">Authorized access only</p>
        </motion.div>

        <motion.div
          className="glass-card w-full max-w-sm p-7 space-y-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                className="game-input"
                placeholder="Enter username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                className="game-input"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-selfie-pink-300 text-sm font-semibold text-center py-2 rounded-xl"
                style={{ background: "rgba(255,31,126,0.15)" }}
              >
                {loginError}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="btn-primary w-full text-center py-3 text-base"
              whileTap={{ scale: 0.97 }}
            >
              Sign In 🚀
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }


  // Merge user info into sessions
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const selfiesByUser = selfies.reduce((acc, s) => {
    const uid = s.userId || "unknown";
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(s);
    return acc;
  }, {});

  const totalPlayers = users.length;
  const totalSelfies = selfies.length;
  const topSession   = [...sessions].sort((a, b) => b.totalScore - a.totalScore)[0];

  return (
    <div className="min-h-screen bg-game-gradient font-nunito relative">
      {/* Background orbs */}
      <div className="orb w-96 h-96 top-[-8rem] left-[-8rem] bg-selfie-pink-500 opacity-10" />
      <div className="orb w-80 h-80 bottom-0 right-[-6rem] bg-selfie-purple-500 opacity-10" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute right-0 top-0">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-300 transition-all active:scale-95"
            >
              🚪 Log Out
            </button>
          </div>

          <div className="text-5xl mb-2">👑</div>
          <h1 className="text-3xl font-black text-white mb-1">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-white/50 text-sm">Sabke selfies aur scores yahan dekho</p>
        </motion.div>

        {/* Error banner */}
        {error && (
          <div className="glass-card p-4 mb-6 border border-yellow-500/30 text-yellow-300 text-sm font-semibold text-center">
            ⚠️ {error}
            <div className="text-white/50 text-xs mt-1">
              Firestore setup karo (neeche instructions hain) to sabke selfies dikhe.
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Players", value: totalPlayers, emoji: "👥" },
            { label: "Total Selfies", value: totalSelfies, emoji: "📸" },
            { label: "Top Score", value: topSession?.totalScore ?? "—", emoji: "🏆" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-white/50 text-xs font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: "selfies", label: "📸 Selfies" },
            { id: "players", label: "👥 Players" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                tab === t.id
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
              style={
                tab === t.id
                  ? { background: "linear-gradient(135deg,#ff1f7e,#8040ff)" }
                  : { background: "rgba(255,255,255,0.06)" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-10 h-10 border-4 border-selfie-pink-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 font-semibold">Loading data...</p>
          </div>
        )}

        {/* SELFIES TAB — grouped by user */}
        {!loading && tab === "selfies" && (
          <div className="space-y-6">
            {Object.keys(selfiesByUser).length === 0 ? (
              <div className="glass-card p-10 text-center text-white/40">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-semibold">Koi selfie nahi mili abhi tak.</p>
                <p className="text-xs mt-2">Firestore setup karo aur doston ko link share karo!</p>
              </div>
            ) : (
              Object.entries(selfiesByUser).map(([uid, userSelfies]) => {
                const u = userMap[uid];
                return (
                  <motion.div
                    key={uid}
                    className="glass-card p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* User header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-black"
                        style={{ background: "linear-gradient(135deg,#ff1f7e,#8040ff)" }}
                      >
                        {u?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-black text-white text-base">
                          {u?.name || "Unknown Player"}
                        </div>
                        <div className="text-white/50 text-xs">
                          {u?.gender} · Age {u?.age} · {formatTime(u?.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Selfie grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {userSelfies.map((s, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div
                            className="relative aspect-square rounded-xl overflow-hidden border-2 border-selfie-purple-500 cursor-pointer group"
                            onClick={() => setSelected(s)}
                          >
                            <img
                              src={s.imageBase64 || s.imageUrl}
                              alt={s.poseName}
                              className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                            />
                            {/* Points badge */}
                            <div
                              className="absolute bottom-0 left-0 right-0 text-center text-white font-black text-xs py-0.5"
                              style={{ background: "linear-gradient(transparent,rgba(0,0,0,0.8))" }}
                            >
                              +{s.pointsEarned}
                            </div>
                            {/* Hover: enlarge icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-xl">
                              🔍
                            </div>
                          </div>
                          <p className="text-white/50 text-xs text-center leading-tight line-clamp-1">
                            {s.poseName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* PLAYERS TAB */}
        {!loading && tab === "players" && (
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="glass-card p-10 text-center text-white/40">
                <div className="text-4xl mb-3">👥</div>
                <p className="font-semibold">Koi player nahi mila abhi tak.</p>
              </div>
            ) : (
              users.map((u, i) => {
                const sess = sessions.find((s) => s.userId === u.id);
                const uSelfies = selfiesByUser[u.id] || [];
                return (
                  <motion.div
                    key={u.id}
                    className="glass-card p-4 flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#ff1f7e,#8040ff)" }}
                    >
                      {u.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-white text-base truncate">{u.name}</div>
                      <div className="text-white/50 text-xs">{u.gender} · Age {u.age}</div>
                      <div className="text-white/30 text-xs">{formatTime(u.createdAt)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {sess && (
                        <>
                          <div className="text-selfie-gold-300 font-black text-lg">{sess.totalScore} pts</div>
                          <div className="text-white/50 text-xs">{sess.title}</div>
                        </>
                      )}
                      <div className="text-white/40 text-xs">{uSelfies.length} selfies</div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Setup instructions if Firestore not connected */}
        {error && (
          <div className="glass-card p-6 mt-6">
            <h3 className="font-black text-white text-lg mb-3">🔥 Firestore Setup (1 baar karo)</h3>
            <ol className="space-y-2 text-sm text-white/70 font-semibold list-decimal list-inside">
              <li>
                <a
                  href="https://console.firebase.google.com/project/selfie-battle-651a9/firestore"
                  target="_blank"
                  rel="noreferrer"
                  className="text-selfie-pink-300 underline"
                >
                  Firebase Console → Firestore
                </a>{" "}
                → "Create database" → "Start in production mode" → Region: <b>asia-south1</b> → Enable
              </li>
              <li>Page refresh karo — sab automatically save hone lagega!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Enlarged selfie modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass-card p-4 max-w-sm w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selected.imageBase64 || selected.imageUrl}
                alt={selected.poseName}
                className="w-full rounded-2xl mb-3 object-cover"
              />
              <div className="text-center">
                <div className="font-black text-white text-lg">{selected.poseName}</div>
                <div className="text-selfie-gold-300 font-bold">+{selected.pointsEarned} points</div>
                <div className="text-white/40 text-xs mt-1">{formatTime(selected.takenAt)}</div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  className="btn-primary flex-1 py-3 text-sm"
                  onClick={() => downloadSelfie(selected.imageBase64 || selected.imageUrl, "selfie", selected.poseName)}
                >
                  ⬇️ Download
                </button>
                <button
                  className="btn-secondary flex-1 py-3 text-sm"
                  onClick={() => setSelected(null)}
                >
                  ✕ Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
