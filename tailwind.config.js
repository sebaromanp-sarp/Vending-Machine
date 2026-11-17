/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: { brand: { DEFAULT: '#FFC72C', dark: '#E6A800' } },
    },
  },
  plugins: [],
};
