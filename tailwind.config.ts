import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        surface: "#0F1115",
        mystic: "#1B1830",
        accent: "#6E5BFF",
        "accent-dim": "#4A3DB8",
        frost: "#E8E6F0",
        muted: "#8B8798",
        metal: "#C4C0D4",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mystic":
          "linear-gradient(135deg, #1B1830 0%, #0F1115 50%, #050505 100%)",
        "gradient-accent":
          "linear-gradient(135deg, #6E5BFF 0%, #4A6CF7 50%, #6E5BFF 100%)",
        "gradient-glow":
          "radial-gradient(ellipse at center, rgba(110,91,255,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 60px rgba(110, 91, 255, 0.2)",
        card: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.05)",
        "card-hover":
          "0 35px 60px -15px rgba(110, 91, 255, 0.25), 0 0 0 1px rgba(110, 91, 255, 0.15)",
      },
      animation: {
        breathe: "breathe 6s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
