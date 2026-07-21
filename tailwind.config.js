/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
      },
      colors: {
        bg: {
          primary: '#FFFFFF',
          secondary: '#F5F5F5',
          tertiary: '#EAEAEA',
          hover: '#E0E0E0',
        },
        text: {
          primary: '#111113',
          secondary: '#555555',
          disabled: '#999999',
        },
        border: {
          DEFAULT: '#EAEAEA',
          strong: '#CCCCCC',
          focus: '#3B82F6',
        },
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        },
      },
      transitionDuration: {
        DEFAULT: '120ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
    },
  },
  plugins: [],
}
