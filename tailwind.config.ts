import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f7ffe5",
          100: "#e8ffc5",
          200: "#ccff7a",
          300: "#b5f645",
          400: "#A3FF12",
          500: "#82cc0e",
          600: "#65a00b",
          700: "#4a7808",
          800: "#354f06",
          900: "#1e2d03",
        },
        surface: {
          DEFAULT: "#0D0D0D",
          card: "#1C1C1E",
          elevated: "#2C2C2E",
          border: "#3C3C3E",
        },
        neon: "#A3FF12",
        muted: "#8A8A8E",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
