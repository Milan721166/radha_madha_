/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#D4AF37",
          goldDark: "#B8860B",
          maroon: "#7A1C1C",
          maroonDark: "#4A0E0E",
          cream: "#FAF7F2",
          champagne: "#F7E7CE",
          obsidian: "#141414",
          charcoal: "#262626",
          rose: "#E0A96D"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
