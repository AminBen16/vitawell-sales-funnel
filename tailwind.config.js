/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './blog-frontend.html',
    './blog-frontend-optimized.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
      },
    },
  },
  plugins: [],
}
