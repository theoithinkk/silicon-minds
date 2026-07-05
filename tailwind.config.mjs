/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#00E5FF',
        secondary: '#7B61FF',
        bg: '#0A0A0F',
        surface: '#141420',
        'text-primary': '#F0F0F5',
        'text-secondary': '#8888A0',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,229,255,0.12)',
        'glow-md': '0 0 20px rgba(0,229,255,0.2)',
      },
      transitionDuration: {
        fast: '150ms',
        standard: '300ms',
        entrance: '500ms',
      },
      transitionTimingFunction: {
        'ease-custom': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        1: '4px',
        2: '8px',
        4: '16px',
        6: '24px',
        10: '40px',
        16: '64px',
      },
    },
  },
  plugins: [],
};
