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
          gold: '#c8a96e',
          teal: '#7eb8a6',
          purple: '#a47eb8',
          blue: '#7e9eb8',
          red: '#b87e7e',
          green: '#7eb87e',
          yellow: '#b8a87e',
          sky: '#6ea8c8'
        }
      }
    },
  },
  plugins: [],
}
