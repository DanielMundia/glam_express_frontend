/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  important: true, // Add this to ensure Tailwind overrides Bootstrap
  theme: {
    extend: {},
  },
  plugins: [],
}

