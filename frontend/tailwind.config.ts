import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'dw-cream': 'var(--cream)',
        'dw-warm': 'var(--warm-white)',
        'dw-ink': 'var(--ink)',
        'dw-muted': 'var(--ink-muted)',
        'dw-orange': 'var(--orange)',
        'dw-orange-light': 'var(--orange-light)',
        'dw-teal': 'var(--teal)',
        'dw-teal-light': 'var(--teal-light)',
        'dw-gold': 'var(--gold)',
        'dw-gold-light': 'var(--gold-light)',
        'dw-border': 'var(--border)',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}

export default config
