// =============================================
//  FIREBASE CONFIGURATION
// =============================================

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const firebaseConfig = {
  apiKey: "AIzaSyDNCFPIdrR44GtbEEsZZMOZ-V7FUCmmP08",
  authDomain: "admission-planet.firebaseapp.com",
  projectId: "admission-planet",
  storageBucket: "admission-planet.firebasestorage.app",
  messagingSenderId: "974081175341",
  appId: "1:974081175341:web:40e26666d7797b46abada4",
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// =============================================
//  IMAGE COMPRESSION → BASE64
// =============================================
function compressImageToBase64(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const MAX_WIDTH = 480;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

// =============================================
//  LOCAL STORAGE HELPERS
//  Primary storage — always works, free, offline
// =============================================
const LS_KEY = "selfie_battle_data";

function loadLocalData() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch { return {}; }
}

function saveLocalData(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("localStorage full or blocked:", e);
  }
}

/** Save selfie to localStorage */
function saveToLocal({ selfieId, userId, poseName, imageBase64, pointsEarned }) {
  const data = loadLocalData();
  if (!data.selfies) data.selfies = [];
  data.selfies.push({
    selfieId,
    userId,
    poseName,
    imageBase64,
    pointsEarned,
    takenAt: new Date().toISOString(),
  });
  saveLocalData(data);
}

/** Save user to localStorage */
function saveUserToLocal({ userId, name, gender, age }) {
  const data = loadLocalData();
  if (!data.users) data.users = [];
  data.users.push({ userId, name, gender, age, createdAt: new Date().toISOString() });
  saveLocalData(data);
}

/** Save session to localStorage */
function saveSessionToLocal({ sessionId, userId, totalScore, title, selfieIds }) {
  const data = loadLocalData();
  if (!data.sessions) data.sessions = [];
  data.sessions.push({ sessionId, userId, totalScore, title, selfieIds, completedAt: new Date().toISOString() });
  saveLocalData(data);
}

/** Retrieve all selfies from localStorage (for admin viewing) */
export function getAllLocalSelfies() {
  return loadLocalData().selfies || [];
}

// =============================================
//  MAIN HELPER FUNCTIONS
//  1. Always saves to localStorage (guaranteed)
//  2. Also tries Firestore in background (bonus)
// =============================================

export async function saveUser({ name, gender, age }) {
  const userId = uuidv4();

  // ✅ Save to localStorage immediately
  saveUserToLocal({ userId, name, gender, age });

  // 🔄 Try Firestore in background (won't block or crash if it fails)
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { name, gender, age, createdAt: serverTimestamp() });
  } catch (e) {
    console.warn("Firestore saveUser failed (localStorage used instead):", e.message);
  }

  return userId;
}

export async function saveSelfie({ userId, poseName, imageBlob, pointsEarned }) {
  const selfieId = uuidv4();

  // Compress image to base64
  let imageBase64;
  try {
    imageBase64 = await compressImageToBase64(imageBlob);
  } catch (e) {
    // If compression fails, use a placeholder
    imageBase64 = URL.createObjectURL(imageBlob);
    console.warn("Compression failed, using blob URL:", e.message);
  }

  // ✅ Save to localStorage immediately
  saveToLocal({ selfieId, userId, poseName, imageBase64, pointsEarned });

  // 🔄 Try Firestore in background
  try {
    const selfieRef = doc(db, "selfies", selfieId);
    await setDoc(selfieRef, {
      userId,
      poseName,
      imageBase64,
      pointsEarned,
      takenAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Firestore saveSelfie failed (localStorage used instead):", e.message);
  }

  return { selfieId, imageUrl: imageBase64 };
}

export async function saveSession({ userId, totalScore, title, selfieIds }) {
  const sessionId = uuidv4();

  // ✅ Save to localStorage immediately
  saveSessionToLocal({ sessionId, userId, totalScore, title, selfieIds });

  // 🔄 Try Firestore in background
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    await setDoc(sessionRef, {
      userId, totalScore, title, selfieIds,
      completedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Firestore saveSession failed (localStorage used instead):", e.message);
  }

  return sessionId;
}

// =============================================
//  ADMIN FUNCTIONS — Fetch all data from Firestore
// =============================================

/** Fetch all selfies from Firestore (for admin dashboard) */
export async function getAllSelfiesFromFirestore() {
  const q = query(collection(db, "selfies"), orderBy("takenAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Fetch all users from Firestore (for admin dashboard) */
export async function getAllUsersFromFirestore() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Fetch all sessions from Firestore (for admin dashboard) */
export async function getAllSessionsFromFirestore() {
  const q = query(collection(db, "sessions"), orderBy("completedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
