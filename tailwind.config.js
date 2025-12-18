/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' for automatic
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        
        // Semantic Colors
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        
        // Traffic Severity Colors
        severity: {
          minor: {
            DEFAULT: '#10B981',
            bg: '#D1FAE5',
            border: '#6EE7B7',
          },
          moderate: {
            DEFAULT: '#F59E0B',
            bg: '#FEF3C7',
            border: '#FCD34D',
          },
          severe: {
            DEFAULT: '#EF4444',
            bg: '#FEE2E2',
            border: '#FCA5A5',
          },
          critical: {
            DEFAULT: '#DC2626',
            bg: '#FEE2E2',
            border: '#F87171',
          },
        },
        
        // Accent Colors
        emergency: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
        },
        responder: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
        },
        route: {
          DEFAULT: '#8B5CF6',
          bg: '#EDE9FE',
        },
        
        // Extended Gray Scale
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          750: '#243240', // Custom for elevated dark surfaces
          800: '#1F2937',
          900: '#111827',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.25' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.375' }],    // 14px
        base: ['1rem', { lineHeight: '1.5' }],        // 16px
        lg: ['1.125rem', { lineHeight: '1.5' }],      // 18px
        xl: ['1.25rem', { lineHeight: '1.5' }],       // 20px
        '2xl': ['1.5rem', { lineHeight: '1.375' }],   // 24px
        '3xl': ['1.875rem', { lineHeight: '1.25' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '1.25' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],       // 48px
      },
      
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      
      spacing: {
        // 8pt grid system
        0: '0px',
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px
        3: '0.75rem',   // 12px
        4: '1rem',      // 16px
        5: '1.25rem',   // 20px
        6: '1.5rem',    // 24px
        8: '2rem',      // 32px
        10: '2.5rem',   // 40px
        12: '3rem',     // 48px
        16: '4rem',     // 64px
        20: '5rem',     // 80px
        24: '6rem',     // 96px
      },
      
      borderRadius: {
        none: '0',
        sm: '0.25rem',   // 4px
        DEFAULT: '0.5rem',    // 8px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        '2xl': '1.5rem', // 24px
        full: '9999px',
      },
      
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        emergency: '0 10px 25px -5px rgb(220 38 38 / 0.3), 0 4px 6px -4px rgb(220 38 38 / 0.2)',
        glow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5)',
      },
      
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'spin': 'spin 1s linear infinite',
      },
      
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        medium: '300ms',
        slow: '500ms',
      },
      
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      minHeight: {
        touch: '44px',  // Minimum touch target
        button: '44px',
      },
      
      minWidth: {
        touch: '44px',
        button: '44px',
      },
      
      screens: {
        sm: '640px',   // Mobile landscape
        md: '768px',   // Tablet
        lg: '1024px',  // Laptop
        xl: '1280px',  // Desktop
        '2xl': '1536px', // Large desktop
      },
      
      zIndex: {
        map: '0',
        'map-controls': '10',
        'bottom-sheet': '20',
        header: '30',
        'floating-button': '40',
        modal: '50',
        toast: '60',
      },
    },
  },
  plugins: [
    // Add plugins as needed
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}
