import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0b2545",
          deep: "#081a33",
          light: "#13345e",
        },
        gold: {
          DEFAULT: "#c9a227",
          soft: "#e4c869",
        },
        paper: "#f7f5ef",
      },
      fontFamily: {
        serif: ["Georgia", "'Times New Roman'", "serif"],
        sans: ["'Helvetica Neue'", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
