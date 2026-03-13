/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'stage-bg': '#0A0A0A',
        'stage-sidebar': '#0F0F0F',
        'stage-panel': '#121212',
        'stage-text': '#F5F5F5',
        'stage-mutetext': '#71717A',
        'stage-mint': '#00FFC6',
        'stage-indigo': '#D946EF',
        'stage-border': 'rgba(255, 255, 255, 0.06)',
      },
      boxShadow: {
        'glowMint': '0 0 20px rgba(0,255,198,0.15)',
        'glowIndigo': '0 0 20px rgba(217,70,239,0.15)',
      },
      borderRadius: {
        'xl2': '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
};
