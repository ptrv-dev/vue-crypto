/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,vue}'],
  theme: {
    extend: {
      container: {
        center: true,
        screens: {
          '2xl': '768px',
        },
        padding: '1rem',
      },
    },
  },
  plugins: [],
};
