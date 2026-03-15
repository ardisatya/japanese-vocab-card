/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        japanese: ['"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', 'Meiryo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
