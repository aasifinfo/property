import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#003A5D",
          orange: "#F88D2A",
          sand: "#F6EFE8",
          ink: "#0F172A",
          slate: "#475569",
          line: "#D7E1EA",
          success: "#1F8A5B",
          danger: "#B9382F",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0, 58, 93, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
