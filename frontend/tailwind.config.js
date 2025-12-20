/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark command center theme
        'command': {
          bg: '#0a0e1a',
          surface: '#131821',
          elevated: '#1a1f2e',
          border: '#232938',
          muted: '#2a3140',
        },
        // Electric accent colors for urgency
        'pulse': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Alert system - high contrast
        'alert': {
          critical: '#ff0844',
          severe: '#ff2f5e',
          high: '#ff6b35',
          moderate: '#ffd23f',
          low: '#06ffa5',
          info: '#00d9ff',
        },
        // Status indicators
        'status': {
          active: '#ff0844',
          progress: '#ffd23f',
          resolved: '#06ffa5',
          pending: '#00d9ff',
        },
        // Neon highlights
        'neon': {
          cyan: '#00ffff',
          magenta: '#ff00ff',
          green: '#00ff41',
          orange: '#ff6b35',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'display-sm': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.05em', fontWeight: '800' }],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 0.15s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)',
          },
          '50%': {
            opacity: '0.7',
            boxShadow: '0 0 40px rgba(14, 165, 233, 0.8)',
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%': { opacity: '0.95' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(14, 165, 233, 0.3)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.5)',
        'glow-lg': '0 0 30px rgba(14, 165, 233, 0.7)',
        'alert-critical': '0 0 30px rgba(255, 8, 68, 0.6)',
        'alert-high': '0 0 20px rgba(255, 107, 53, 0.5)',
        'neon': '0 0 15px currentColor',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(circle at center, rgba(14, 165, 233, 0.15), transparent 70%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [],
}
