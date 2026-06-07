/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bnb-primary': '#FF385C',
        'bnb-primary-dark': '#E31C5F',
        'bnb-success': '#008A05',
        'bnb-warning': '#F59E0B',
        'bnb-danger': '#EF4444',
        'bnb-neutral': {
          50: '#F7F7F7',
          100: '#EBEBEB',
          200: '#DDDDDD',
          300: '#B0B0B0',
          400: '#717171',
          500: '#484848',
          600: '#222222',
        },
      },
    },
  },
  plugins: [],
}
