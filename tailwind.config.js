export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF2FC', 100: '#DCE6F9', 200: '#B0C4EF',
          700: '#1F3D8F', 800: '#1B3A8C', 900: '#122868', 950: '#0A1740',
        },
        teal: {
          400: '#33D6D9', 500: '#00C4C8', 600: '#00A8AC',
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
