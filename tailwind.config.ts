import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF6B1A",
          "orange-dark": "#C44A0B",
          "orange-light": "#FFE9D6",
          navy: "#0C2340",
          "navy-dark": "#061629",
          "navy-light": "#1a2538",
        },
      },
      fontFamily: { sans: ["var(--font-poppins)", "system-ui", "sans-serif"] },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-orange": "pulseOrange 2s ease-in-out infinite",
        "snow-fall": "snowFall 10s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        pulseOrange: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        snowFall: {
          "0%": { transform: "translateY(-10vh) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "90%": { opacity: "0.8" },
          "100%": { transform: "translateY(110vh) translateX(20px)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
