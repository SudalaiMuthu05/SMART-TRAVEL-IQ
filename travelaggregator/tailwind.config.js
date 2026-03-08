/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        slateBlue: '#1e3a8a',
        skyPulse: '#0ea5e9',
        seaMint: '#14b8a6'
      },
      boxShadow: {
        glow: '0 10px 40px -12px rgba(14, 165, 233, 0.35)'
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(circle at 20% 20%, rgba(20,184,166,0.35), transparent 50%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.35), transparent 40%), linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #0b1120 100%)'
      }
    }
  },
  plugins: []
}
