import type { Config } from "tailwindcss";

/** `var(--c-x)` holds space-separated RGB channels so opacity modifiers (`bg-ink/10`) still work. */
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "toast-in": { from: { opacity: "0", transform: "translateY(12px) scale(0.98)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "dialog-in": { from: { opacity: "0", transform: "translateY(16px) scale(0.97)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "toast-in": "toast-in 260ms cubic-bezier(0.23,1,0.32,1) both",
        "fade-in": "fade-in 200ms ease-out both",
        "dialog-in": "dialog-in 300ms cubic-bezier(0.23,1,0.32,1) both",
      },
      colors: {
        // theme-aware: values change between light and dark (see globals.css)
        frost: { DEFAULT: v("frost"), 50: v("frost-50") },
        ink: v("ink"),
        deep: { DEFAULT: v("deep"), 900: v("deep-900") },
        crack: v("crack"),
        // fixed: same in both themes (always-dark sections, brand accents)
        snow: "#F3F6F4",
        night: "#12202D",
        brand: "#2E5E8E",
        mist: "#B7C9D8",
        steel: "#7FA2BF",
        reed: "#C5C49B",
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
