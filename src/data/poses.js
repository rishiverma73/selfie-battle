// Pool of 15 pose challenges. 5 are picked at random per session (no repeats).
// v2 feature: add `keypointRef` field with MoveNet/PoseNet reference keypoints
// for real pose-accuracy scoring in a future iteration.

export const ALL_POSES = [
  {
    id: "cool_pose",
    emoji: "😎",
    name: "Cool Pose",
    description: "Wear your sunglasses (or pretend to!) and give a side smirk. Channel your inner rockstar!",
  },
  {
    id: "duck_face",
    emoji: "🤳",
    name: "Duck Face Deluxe",
    description: "Classic pout selfie — lips out, hand on chin, tilt your head just a little!",
  },
  {
    id: "bollywood_star",
    emoji: "🕺",
    name: "Bollywood Star",
    description: "Point dramatically to the sky like a Bollywood hero entry shot. OWN that moment!",
  },
  {
    id: "bunny_ears",
    emoji: "🐰",
    name: "Bunny Ears",
    description: "Make peace signs near your head for classic bunny ears. Extra points for the wiggle!",
  },
  {
    id: "shocked_face",
    emoji: "😱",
    name: "Shocked Face",
    description: "Open mouth WIDE, eyes as big as you can go — like you just saw a ghost! Hands on cheeks for extra drama!",
  },
  {
    id: "power_pose",
    emoji: "💪",
    name: "Power Pose",
    description: "Flex your arm like a superhero showing off their muscles. You ARE the main character!",
  },
  {
    id: "laughing_out_loud",
    emoji: "😂",
    name: "Laughing Out Loud",
    description: "Genuine big belly laugh — head tilted back, mouth open wide, eyes squinting with joy!",
  },
  {
    id: "thinking_pose",
    emoji: "🧐",
    name: "Big Brain Pose",
    description: "Finger on chin, eyes looking thoughtfully upward. You're solving the mysteries of the universe!",
  },
  {
    id: "heart_hands",
    emoji: "❤️",
    name: "Heart Hands",
    description: "Make a heart shape with your thumbs and index fingers and show it to the camera. Spread the love!",
  },
  {
    id: "attitude_shot",
    emoji: "🔥",
    name: "Attitude Shot",
    description: "One eyebrow raised, zero smiles — pure BOSS energy. Stare into the camera like you own the place!",
  },
  {
    id: "royal_wave",
    emoji: "👑",
    name: "Royal Wave",
    description: "Hand raised, slow gracious wave — you're royalty greeting your subjects. Chin slightly up!",
  },
  {
    id: "shaka",
    emoji: "🤙",
    name: "Shaka Brah",
    description: "Hang loose! Thumb and pinky out, other fingers curled. Big chill smile. Aloha vibes only!",
  },
  {
    id: "chef_kiss",
    emoji: "🤌",
    name: "Chef's Kiss",
    description: "Fingers pinched together, a little kiss motion toward the camera. *Perfection!*",
  },
  {
    id: "superhero_landing",
    emoji: "🦸",
    name: "Superhero Landing",
    description: "One fist forward like you're about to take flight. You just saved the world — look the part!",
  },
  {
    id: "model_pout",
    emoji: "💅",
    name: "Model Pout",
    description: "Fierce model energy — slight pout, look slightly away from camera, one hand up near your face. Strike a POSE!",
  },
];

/**
 * Picks `count` random, non-repeating poses from the pool.
 * @param {number} count - Number of poses to pick (default 5)
 * @returns {Array} Array of pose objects
 */
export function pickRandomPoses(count = 5) {
  const shuffled = [...ALL_POSES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
