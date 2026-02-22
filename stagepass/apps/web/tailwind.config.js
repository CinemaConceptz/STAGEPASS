/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stage: {
          bg: "#121212",       // Charcoal Black
          panel: "#1E1E1E",    // Graphite
          panel2: "#2A2A2A",   // Slate
          text: "#FFFFFF",
          mutetext: "#B3B3B3",
          indigo: "#5A3BFF",   // Electric Indigo
          mint: "#00FFC6"      // Neon Mint
        }
      },
      boxShadow: {
        glowMint: "0 0 18px rgba(0,255,198,0.22)",
        glowIndigo: "0 0 22px rgba(90,59,255,0.22)"
      },
      borderRadius: {
        xl2: "1rem"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Placeholder, user can add Unbounded/Manrope
      }
    }
  },
  plugins: []
};