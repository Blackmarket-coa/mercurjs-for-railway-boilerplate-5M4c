const path = require("path")

// get the path of the dependency "@medusajs/ui"
const medusaUI = path.join(
  path.dirname(require.resolve("@medusajs/ui")),
  "**/*.{js,jsx,ts,tsx}"
)

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@medusajs/ui-preset")],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", medusaUI],
  darkMode: "class",
  theme: {
    extend: {
      // Solarpunk theme extensions
      colors: {
        // Forest greens
        forest: {
          50: "#e8faf0",
          100: "#d1f5dc",
          200: "#a7e8bc",
          300: "#78da9a",
          400: "#48bb78",
          500: "#34a362",
          600: "#268751",
          700: "#206c3f",
          800: "#1a5a35",
          900: "#164429",
        },
        // Warm ambers
        amber: {
          50: "#fff8f0",
          100: "#ffefdc",
          200: "#ffdca8",
          300: "#ffc870",
          400: "#f5b432",
          500: "#dc9b28",
          600: "#be7d1e",
          700: "#9b5f14",
          800: "#7a4a10",
          900: "#55310a",
        },
        // Warm neutrals
        cream: {
          50: "#fffdfA",
          100: "#faf7f1",
          200: "#f4f0e7",
          300: "#ebe5d9",
          400: "#d6cebe",
          500: "#b4aa98",
          600: "#8c8270",
          700: "#645c4c",
          800: "#373228",
          900: "#181610",
        },
      },
      boxShadow: {
        "solarpunk-sm": "0 2px 8px rgba(22, 68, 41, 0.08)",
        "solarpunk-md": "0 4px 16px rgba(22, 68, 41, 0.12)",
        "solarpunk-lg": "0 8px 32px rgba(22, 68, 41, 0.16)",
        "amber-glow": "0 0 20px rgba(245, 180, 50, 0.3)",
        "forest-glow": "0 0 20px rgba(72, 187, 120, 0.3)",
      },
      backgroundImage: {
        "gradient-solarpunk": "linear-gradient(135deg, #48bb78 0%, #f5b432 100%)",
        "gradient-forest": "linear-gradient(180deg, #268751 0%, #164429 100%)",
        "gradient-sunrise": "linear-gradient(180deg, #ffc870 0%, #dc9b28 100%)",
        "gradient-nature": "linear-gradient(135deg, rgba(72, 187, 120, 0.3) 0%, rgba(245, 180, 50, 0.3) 100%)",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
    },
  },
  plugins: [],
}
