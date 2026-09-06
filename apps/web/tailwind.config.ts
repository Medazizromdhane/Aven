import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5b3df5',
          dark: '#4a2fd6',
        },
      },
    },
  },
  plugins: [],
};

export default config;
