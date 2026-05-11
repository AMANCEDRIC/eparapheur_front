/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#094cb2', // Bleu Cryptoneo
        'primary-dim': '#eef4ff',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        tertiary: '#6d5e00', // Or Archival
        surface: {
          lowest: '#ffffff',
          low: '#f8fafc',
          DEFAULT: '#f1f5f9',
          high: '#e2e8f0',
          dim: '#cbd5e1'
        }
      }
    },
  },
  plugins: [],
}

