import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0d6b62',
          dark: '#084f49',
        },
      },
    },
  },
  plugins: [],
};

export default config;
