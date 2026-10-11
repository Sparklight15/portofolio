import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "Arial", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        hand: ["var(--font-caveat)", "Comic Sans MS", "cursive"],
      },
      colors: {
        // NILAI SEMENTARA: ganti dengan palet desainmu
        background: "#FAF8F5",
        surface: "#F1EDE6",
        foreground: "#1C1B1A",
        muted: "#6E6A64",
        border: "#E3DED5",
        primary: {
          DEFAULT: "#1C1B1A",
          foreground: "#FAF8F5",
        },
        accent: "#E4572E",
      },
      fontSize: {
        caption: ["0.8125rem", { lineHeight: "1.25rem" }],
        body: ["1rem", { lineHeight: "1.65rem" }],
        lead: ["1.25rem", { lineHeight: "1.9rem" }],
        h4: ["1.5rem", { lineHeight: "2rem" }],
        h3: ["2rem", { lineHeight: "2.5rem", letterSpacing: "-0.01em" }],
        h2: ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        h1: ["clamp(2.75rem, 7vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        display: ["clamp(3.5rem, 11vw, 8rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
      },
    },
  },
  plugins: [],
};

export default config;