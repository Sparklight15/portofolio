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
        background: "#FFFFFF", // White: background utama
        surface: "#EBEBEB", // Gray 100: card, sticky note
        border: "#BDBDBD", // Gray 300: garis, disabled
        muted: "#666666", // Gray 600: caption, label
        charcoal: "#333333", // Charcoal: teks sekunder
        foreground: "#111111", // Black: teks, tombol, garis
      },
      fontSize: {
        display: [
          "clamp(3rem, 10vw, 4.75rem)",
          { lineHeight: "0.9", letterSpacing: "-0.03em", fontWeight: "800" },
        ],
        "display-accent": ["clamp(2.5rem, 7vw, 3.375rem)", { lineHeight: "1" }],
        h1: ["clamp(2rem, 5vw, 2.375rem)", { lineHeight: "1", fontWeight: "800" }],
        h2: ["1.625rem", { lineHeight: "1.08", fontWeight: "800" }],
        body: ["0.9375rem", { lineHeight: "1.7" }],
        label: [
          "0.75rem",
          { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" },
        ],
        caption: ["0.8125rem", { lineHeight: "1.4" }],
        hand: ["clamp(1.4375rem, 3vw, 1.625rem)", { lineHeight: "1", fontWeight: "700" }],
        numeral: ["clamp(3.25rem, 8vw, 5.25rem)", { lineHeight: "0.9", fontWeight: "800" }],
      },
      boxShadow: {
        hard: "6px 6px 0 0 #111111",
      },
    },
  },
  plugins: [],
};

export default config;