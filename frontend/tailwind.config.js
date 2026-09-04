/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem',
      },
      colors: {
        // Modern SaaS Dark Palette with Purple Tint
        dark: {
          bg: '#0d0a14',       // Base page background
          card: '#151220',     // Slightly lighter card surface
          cardHover: '#1c182d', // Elevated card / active item
          border: '#231d38',   // Subtle border
          input: '#120e1d',    // Input fields
          sidebar: '#0e0a17',  // Sidebar background
        },
        // Primary Accent: Purple to Violet
        brand: {
          purple: '#8b5cf6',
          violet: '#a855f7',
          deep: '#7c3aed',
          glow: 'rgba(139, 92, 246, 0.45)',
        },
        // Secondary Accent: Warm Yellow / Gold
        accent: {
          yellow: '#facc15',
          gold: '#eab308',
          glow: 'rgba(250, 204, 21, 0.4)',
        },
        // Semantic status colors
        status: {
          success: '#10b981',
          warning: '#facc15',
          danger: '#f43f5e',
          info: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
      },
      boxShadow: {
        'saas-card': '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(139, 92, 246, 0.08)',
        'saas-card-hover': '0 15px 35px -5px rgba(0, 0, 0, 0.7), 0 0 20px 2px rgba(139, 92, 246, 0.15)',
        'purple-glow': '0 0 25px -3px rgba(139, 92, 246, 0.5)',
        'purple-glow-sm': '0 0 12px -2px rgba(139, 92, 246, 0.45)',
        'yellow-glow': '0 0 20px -3px rgba(250, 204, 21, 0.4)',
        'yellow-glow-sm': '0 0 10px -2px rgba(250, 204, 21, 0.35)',
        'hero-gradient': '0 12px 40px -5px rgba(139, 92, 246, 0.35), 0 4px 20px -2px rgba(249, 115, 22, 0.25)',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
        'hero-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(28, 24, 45, 0.6) 0%, rgba(21, 18, 32, 0.95) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
