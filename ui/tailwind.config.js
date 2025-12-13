/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        dark: '#1A1A1A',
        light: '#F7F7F7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brutal': '8px 8px 0px 0px #000',
        'brutal-sm': '4px 4px 0px 0px #000',
        'brutal-lg': '12px 12px 0px 0px #000',
      },
    },
  },
  plugins: [],
}

