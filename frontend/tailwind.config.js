/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cozy Pastel Palette
        'pastel-pink': '#FFD6FF',
        'pastel-blue': '#A0E7E5',
        'pastel-peach': '#FFAEBC',
        'pastel-lemon': '#FBE7C6',
        'pastel-lavender': '#E2D5F1',
        'pastel-mint': '#B8E6D3',
      },
      fontFamily: {
        'cute': ['Quicksand', 'Comic Sans MS', 'cursive'],
        'kawaii': ['Kalam', 'Caveat', 'Patrick Hand', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-gentle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg) translateZ(0)' },
          '50%': { transform: 'rotate(3deg) translateZ(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateZ(0)' },
          '50%': { transform: 'translateY(-20px) translateZ(0)' },
        }
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}