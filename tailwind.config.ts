import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Dapper Squad brand colors
        brand: {
          gold: '#FFD700',
          'dark-gold': '#B8860B',
          charcoal: '#2C2C2C',
          'light-gray': '#F8F9FA',
          'dark-gray': '#6C757D',
          // Extended brand palette
          platinum: '#E5E5E5',
          pearl: '#F8F8FF',
          champagne: '#F7E7CE',
          bronze: '#CD7F32',
          copper: '#B87333',
          slate: '#708090',
          ash: '#B2BEB5',
          carbon: '#36454F',
        },
        // Accent colors for variety
        accent: {
          emerald: '#50C878',
          sapphire: '#0F52BA',
          ruby: '#E0115F',
          amethyst: '#9966CC',
          coral: '#FF7F50',
          mint: '#98FB98',
        },
        // Semantic colors
        success: {
          primary: '#10B981',
          secondary: '#D1FAE5',
        },
        warning: {
          primary: '#F59E0B',
          secondary: '#FEF3C7',
        },
        error: {
          primary: '#EF4444',
          secondary: '#FEE2E2',
        },
        info: {
          primary: '#3B82F6',
          secondary: '#DBEAFE',
        },
        // High contrast colors
        'high-contrast': {
          light: '#FFFFFF',
          dark: '#000000',
        },
        // Colorblind-safe colors
        'colorblind-safe': {
          primary: '#0173B2',
          secondary: '#DE8F05',
          accent: '#CC78BC',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-playfair)', 'serif'],
        luxury: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      fontSize: {
        // Enhanced typography scale
        'display-large': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-medium': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-small': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '600' }],
        'headline-large': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-medium': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-small': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-large': ['1.375rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '500' }],
        'title-medium': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '500' }],
        'title-small': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '500' }],
        'body-large': ['1rem', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }],
        'body-medium': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.01em', fontWeight: '400' }],
        'body-small': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
        'label-large': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-medium': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'label-small': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      fontWeight: {
        'weight-light': '300',
        'weight-regular': '400',
        'weight-medium': '500',
        'weight-semibold': '600',
        'weight-bold': '700',
        'weight-extrabold': '800',
      },
      // Background utilities for gradient animations
      backgroundSize: {
        'size-200': '200% 100%',
        'size-300': '300% 100%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 0%',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;