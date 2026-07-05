/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stellar-purple': '#7c3aed',
        'dark-bg': '#0a0a1a',
        'dark-card': '#1a1a2e',
      },
      backdropBlur: {
        'xl': '20px',
      },
    },
  },
  plugins: [],
}
