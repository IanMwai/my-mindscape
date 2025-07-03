/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#F8F8F8',
        'secondary-bg': '#E0F2F7',
        'accent-1': '#81C784',
        'accent-2': '#90A4AE',
        'accent-3': '#4DD0E1',
        'text-dark': '#424242',
        'highlight': '#26A69A',
      },
    },
  },
  plugins: [],
};