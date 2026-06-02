/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.html'],
  theme: {
    extend: {
      colors: {
        'indigo-primary': '#2E2A8F',
        'indigo-primary-dark': '#211e6a',
        'verana-purple': '#763EF0',
        surface: '#FAFAF8',
        ink: '#111111',
        muted: '#5B5B5B',
        rule: '#E8E6E0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        wordmark: '-0.015em',
      },
      maxWidth: {
        prose: '70ch',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.ink'),
            a: { color: theme('colors.indigo-primary'), textDecoration: 'underline' },
          },
        },
      }),
    },
  },
  plugins: [],
};
