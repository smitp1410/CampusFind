/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          ivory: "#F7F5EF",
          forest: "#153D32",
          "forest-dark": "#0D2720",
          "forest-light": "#1E5244",
          charcoal: "#1B211F",
          "charcoal-dark": "#121615",
          lime: "#C8F169",
          "lime-hover": "#B8E354",
          sage: "#A7B5A5",
          "sage-light": "#CCD6CB",
          grey: "#E6E5DF",
          "grey-light": "#EFEFEA",
          white: "#FFFFFF",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #1B211F',
        'brutal-lg': '6px 6px 0px 0px #1B211F',
        'brutal-lime': '4px 4px 0px 0px #C8F169',
        'editorial': '0 20px 40px -15px rgba(21, 61, 50, 0.08)',
      }
    },
  },
  plugins: [],
}
