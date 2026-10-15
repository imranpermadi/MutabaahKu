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
          emerald: '#059669',
          'emerald-light': '#34D399',
          'emerald-dark': '#065F46',
          sky: '#0284C7',
          'sky-light': '#38BDF8',
          amber: '#F59E0B',
          'amber-light': '#FBBF24',
          sand: '#FEF3C7',
          lavender: '#8B5CF6',
          cream: '#FFFBEB'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Quicksand', 'Nunito', 'sans-serif'],
        arabic: ['Amiri', '"Scheherazade New"', 'Traditional Arabic', 'serif']
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      boxShadow: {
        'chunky': '0 4px 0 0 rgba(0, 0, 0, 0.15)',
        'chunky-emerald': '0 5px 0 0 #047857',
        'chunky-amber': '0 5px 0 0 #D97706',
        'chunky-sky': '0 5px 0 0 #0369A1',
      }
    },
  },
  plugins: [],
}
