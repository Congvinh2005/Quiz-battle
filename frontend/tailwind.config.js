/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0A0A0F",
          surface: "#12121A",
          surface2: "#1A1A26",
        },
        brand: {
          primary: "#7C3AED",
          "primary-light": "#A855F7",
          accent: "#06B6D4",
          gold: "#F59E0B",
          green: "#10B981",
          red: "#EF4444",
        },
        text: {
          main: "#F1F0FF",
          muted: "#8B8BA0",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          light: "rgba(255,255,255,0.12)",
        },
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
        "jetbrains-mono": ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "16px",
        pill: "100px",
      },
      boxShadow: {
        glow: "0 0 0 3px rgba(124,58,237,0.3)",
        "glow-accent": "0 0 0 3px rgba(6,182,212,0.25)",
      },
      animation: {
        pulse: "pulse 2s infinite",
        bounce: "bounce 1s infinite alternate",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
        bounce: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
