export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff', 100: '#e0e9ff', 200: '#c7d6fe',
          700: '#3f42ca', 800: '#1B2A5E', 900: '#0F1C42', 950: '#090f25',
        },
        teal: {
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0891b2',
        }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'modal': '0 20px 60px -10px rgb(0 0 0 / 0.15)',
      }
    },
  },
  plugins: [],
}
