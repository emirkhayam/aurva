/** @type {import('tailwindcss').Config} */
// AURVA design tokens — source of truth: ../design-system/aurva/MASTER.md
module.exports = {
  content: [
    './public/*.html',
    './public/admin/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',       // navy — primary surfaces, headings
        'on-primary': '#FFFFFF',
        secondary: '#334155',
        accent: {
          DEFAULT: '#063CC1',     // AURVA brand blue (from logo)
          hover: '#0530A3',
          soft: '#E8EDFB',
        },
        background: '#F8FAFC',
        foreground: '#020617',
        muted: '#E8ECF1',
        'muted-fg': '#475569',
        border: '#E2E8F0',
        destructive: '#DC2626',
        ring: '#0F172A',
      },
      fontFamily: {
        display: ['Lexend', 'system-ui', 'sans-serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '72rem', // max-w-6xl container standard
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        xl: '0 20px 25px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
