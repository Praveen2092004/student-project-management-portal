/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Perfect! Matches the theme toggling logic seamlessly.
  theme: {
    extend: {
      colors: {
        // Adding custom glassmorphism and deep SaaS color variables
        brand: {
          darkBg: '#0B0F19',
          cardDark: '#111827',
          cardLight: '#ffffff',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}