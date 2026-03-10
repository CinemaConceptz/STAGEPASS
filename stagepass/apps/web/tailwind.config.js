/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stage: {
          bg: "#2E1A47",       // Deep Purple (Logo Background)
          panel: "#3B225B",    // Slightly lighter purple for cards
          panel2: "#4A2B70",   // Hover state
          text: "#FFFFFF",
          mutetext: "#D1C4E9", // Light Lavender
          indigo: "#D946EF",   // Neon Pink/Purple (Pulse Line)
          mint: "#00FFC6"      // Neon Mint (Circle Rings)
        }
      },
      boxShadow: {
        glowMint: "0 0 18px rgba(0,255,198,0.4)",
        glowIndigo: "0 0 22px rgba(217,70,239,0.4)"
      },
      borderRadius: {
        xl2: "1rem"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      }
    }
  },
  plugins: []
};