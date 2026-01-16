import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-pink": "#ff4fd8",
        "neon-cyan": "#39e6ff",
        "neon-purple": "#9b5bff",
        "deep-black": "#05030a",
        "deep-purple": "#1b0b2f",
        "deep-teal": "#031d23"
      },
      boxShadow: {
        "neon-pink": "0 0 20px rgba(255,79,216,0.55)",
        "neon-cyan": "0 0 20px rgba(57,230,255,0.55)",
        "neon-purple": "0 0 24px rgba(155,91,255,0.6)"
      },
      fontFamily: {
        display: ["'Orbitron'", "system-ui", "sans-serif"],
        mono: ["'Share Tech Mono'", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-120%)", opacity: "0" },
          "30%": { opacity: "0.6" },
          "60%": { opacity: "0.9" },
          "100%": { transform: "translateX(120%)", opacity: "0" }
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.3" },
          "50%": { opacity: "0.8" }
        }
      },
      animation: {
        sweep: "sweep 1.6s ease-in-out",
        pulseGlow: "pulseGlow 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
