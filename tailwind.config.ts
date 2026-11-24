import type { Config } from "tailwindcss";

/** `var(--c-x)` holds space-separated RGB channels so opacity modifiers (`bg-ink/10`) still work. */
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
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
