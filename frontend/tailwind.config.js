/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === La Tête Dans Les Nuages — charte graphique officielle ===
        // Univers neon/arcade sur fond violet nuit

        // Fonds
        'bg-primary': '#040D21',
        'bg-secondary': '#071333',
        'bg-card': '#0C1A45',

        // Accents neon
        'neon-cyan': '#00D3FF',
        'neon-cyan-light': '#48F4FF',
        'neon-pink': '#FE53BB',
        'neon-yellow': '#FFC700',
        'neon-yellow-bright': '#FFE81C',
        'neon-orange': '#FF6B35',

        // Aliases marque (pour usage rapide)
        brand: '#00D3FF',
        'brand-secondary': '#FE53BB',
        'brand-accent': '#FFC700',

        // Statuts
        'status-success': '#2FBE2C',
        'status-error': '#E73434',
        'status-warning': '#FFC700',
        'status-info': '#2F97ED',
      },
      fontFamily: {
        display: ['Exo2_700Bold'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        'body-bold': ['Inter_700Bold'],
        mono: ['SpaceMono_400Regular'],
      },
    },
  },
  plugins: [],
};
