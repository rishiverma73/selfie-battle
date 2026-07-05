/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        "selfie-pink": {
          50:  "#fff0f7",
          100: "#ffe0ef",
          200: "#ffc2df",
          300: "#ff91c4",
          400: "#ff509e",
          500: "#ff1f7e",
          600: "#f0005e",
          700: "#c80050",
          800: "#a60045",
          900: "#88013d",
        },
        "selfie-purple": {
          50:  "#f5f0ff",
          100: "#ece4ff",
          200: "#daccff",
          300: "#bfa3ff",
          400: "#a070ff",
          500: "#8040ff",
          600: "#6f1fff",
          700: "#5e0fe0",
          800: "#4e0fbb",
          900: "#420e98",
        },
        "selfie-gold": {
          50:  "#fffbea",
          100: "#fff4c2",
          200: "#ffe87a",
          300: "#ffd63d",
          400: "#ffc414",
          500: "#f59e00",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      animation: {
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both",
        "slide-up": "slideUp 0.4s ease-out both",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "wiggle": "wiggle 0.6s ease-in-out",
        "confetti-pop": "confettiPop 0.5s ease-out both",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        slideUp: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 31, 126, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 31, 126, 0.8), 0 0 60px rgba(128, 64, 255, 0.4)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        confettiPop: {
          "0%": { transform: "scale(0) rotate(-10deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      backgroundImage: {
        "game-gradient": "linear-gradient(135deg, #1a0533 0%, #2d0a5c 40%, #4a0a3a 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "score-gradient": "linear-gradient(90deg, #ff1f7e, #8040ff)",
        "button-gradient": "linear-gradient(135deg, #ff1f7e 0%, #8040ff 100%)",
        "gold-gradient": "linear-gradient(135deg, #ffd63d 0%, #f59e00 100%)",
      },
    },
  },
  plugins: [],
};
