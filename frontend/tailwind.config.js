/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'neon-glow': 'neon-glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        pulse: {
          '0%, 100%': {
            opacity: '0.8'
          },
          '50%': {
            opacity: '0.4'
          }
        },
        'neon-glow': {
          'from': {
            'box-shadow': '0 0 5px #34d399, 0 0 10px #34d399, 0 0 15px #3b82f6'
          },
          'to': {
            'box-shadow': '0 0 10px #34d399, 0 0 20px #34d399, 0 0 30px #3b82f6'
          }
        }
      }
    },
  },
  plugins: [],
}