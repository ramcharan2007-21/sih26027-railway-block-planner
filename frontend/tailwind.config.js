/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        railway: {
          dark: '#0b132b',
          navy: '#1c2541',
          blue: '#3a506b',
          cyan: '#5bc0be',
          light: '#f4f6f9',
          border: '#2a3b5c',
          maroon: '#800000',
          accent: '#0284c7'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
