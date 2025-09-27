/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}",],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'bangers': ['Bangers', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'comic-yellow': '#FFF5B7',
        'comic-red': '#FF6B6B',
        'comic-blue': '#4ECDC4',
        'comic-green': '#45B7D1',
        'comic-purple': '#9B59B6',
        'comic-orange': '#F39C12',
        'paper': '#FFFEF7',
        'comic-dark': '#0a0a0a',
      },
      boxShadow: {
        'comic': '8px 8px 0px 0px rgba(0,0,0,1)',
        'comic-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
        'comic-dark': '8px 8px 0px 0px rgba(156, 163, 175, 0.8)',
        'comic-sm-dark': '4px 4px 0px 0px rgba(156, 163, 175, 0.6)',
      }
    },
  },
  plugins: [],
}
