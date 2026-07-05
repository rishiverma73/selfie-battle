// Pool of fun compliment messages shown after scoring each pose.
// Each takes a `points` parameter via template string.

export const COMPLIMENT_TEMPLATES = [
  (pts) => `🔥 On fire! That's a solid ${pts} points!`,
  (pts) => `👑 Ekdum filmy pose! +${pts} points!`,
  (pts) => `🌟 Selfie perfection! ${pts}/100 — stunning!`,
  (pts) => `😍 The camera LOVES you! +${pts} points!`,
  (pts) => `💥 BOOM! That's ${pts} points of pure charisma!`,
  (pts) => `🎬 Award-winning performance! ${pts} points earned!`,
  (pts) => `✨ Absolutely iconic! ${pts} points for you!`,
  (pts) => `🎉 That's what I'm talking about! +${pts} points!`,
  (pts) => `🏆 Our judges are SHOOK! ${pts} points!`,
  (pts) => `😂 We can't handle this level of talent! +${pts} points!`,
  (pts) => `💃 Move over Hollywood — ${pts} points for the new star!`,
  (pts) => `🦋 Absolutely *chef's kiss*! ${pts} points!`,
  (pts) => `🚀 Out of this world! ${pts} points awarded!`,
  (pts) => `😎 Too cool for school — ${pts} points!`,
  (pts) => `🌈 That was magical! +${pts} points!`,
];

/**
 * Returns a random compliment string for a given points value.
 * @param {number} points
 * @returns {string}
 */
export function getRandomCompliment(points) {
  const template = COMPLIMENT_TEMPLATES[Math.floor(Math.random() * COMPLIMENT_TEMPLATES.length)];
  return template(points);
}

/**
 * Awards random points between 70–100.
 * @returns {number}
 */
export function awardRandomPoints() {
  return Math.floor(Math.random() * 31) + 70; // 70–100
}

/**
 * Returns rank label based on total score (out of 500).
 * @param {number} score
 * @returns {{ label: string, emoji: string, color: string }}
 */
export function getRankInfo(score) {
  if (score >= 450) return { label: "Legendary Selfie Royalty", emoji: "👑", color: "text-yellow-400" };
  if (score >= 350) return { label: "Certified Selfie Star", emoji: "⭐", color: "text-purple-300" };
  if (score >= 250) return { label: "Pretty Solid Poser", emoji: "😎", color: "text-pink-300" };
  return { label: "Selfie Rookie — Try Again!", emoji: "🌱", color: "text-green-400" };
}

/**
 * Returns the title based on gender.
 * @param {"Male"|"Female"|"Other"} gender
 * @returns {string}
 */
export function getTitleByGender(gender) {
  if (gender === "Male") return "Selfie King";
  if (gender === "Female") return "Selfie Queen";
  return "Selfie Star";
}
