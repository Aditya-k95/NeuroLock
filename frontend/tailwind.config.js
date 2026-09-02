/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette Tokens from User
        crimson: {
          DEFAULT: '#710014',
          900: '#40000B',
          800: '#58000F',
          700: '#710014', // Primary Crimson Depth
          600: '#8C0019',
          500: '#A8001E',
          400: '#C70F30',
          glow: '#E61A3C',
        },
        sand: {
          DEFAULT: '#B38F6F',
          900: '#4D3B2C',
          800: '#6B533E',
          700: '#8A6C52',
          600: '#A17F62',
          500: '#B38F6F', // Primary Warm Sand
          400: '#C7A689',
          300: '#DBBDA3',
          glow: '#EED5C0',
        },
        pearl: {
          DEFAULT: '#F2F1ED', // Primary Soft Pearl
          50: '#FAF9F7',
          100: '#F2F1ED',
          200: '#E4E2DC',
          300: '#D1CEC5',
          400: '#A8A499',
          500: '#7F7B70',
        },
        obsidian: {
          DEFAULT: '#161616', // Primary Obsidian Black
          950: '#0C0C0C',
          900: '#111111',
          850: '#161616',
          800: '#1D1D1D',
          750: '#242424',
          700: '#2C2C2C',
          600: '#383838',
          500: '#4A4A4A',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'crimson-glow': '0 0 25px -3px rgba(113, 0, 20, 0.55)',
        'crimson-glow-sm': '0 0 12px -2px rgba(168, 0, 30, 0.5)',
        'sand-glow': '0 0 20px -3px rgba(179, 143, 111, 0.35)',
        'sand-glow-sm': '0 0 10px -2px rgba(179, 143, 111, 0.4)',
        'obsidian-card': '0 8px 32px 0 rgba(0, 0, 0, 0.85)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
