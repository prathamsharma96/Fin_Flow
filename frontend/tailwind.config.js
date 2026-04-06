/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f1117',
          800: '#13151f',
          700: '#1a1d2e',
          600: '#1e2030',
          500: '#2d2d3a',
        },
      },
    },
  },
  plugins: [],
}
