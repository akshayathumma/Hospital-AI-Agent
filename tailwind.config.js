import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#dbeefe",
          200: "#bfe3fe",
          300: "#93d2fd",
          400: "#60b8fa",
          500: "#3b99f6",
          600: "#2579eb",
          700: "#1d63d8",
          800: "#1e50af",
          900: "#1e4589",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out both",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [typography],
};