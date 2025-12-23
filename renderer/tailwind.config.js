const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/app/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    colors: {
      // use colors only specified
      white: colors.white,
      gray: colors.gray,
      slate: colors.slate,
      blue: colors.blue,
      emerald: colors.emerald,
      rose: colors.rose,
      amber: colors.amber,
      orange: colors.orange,
      purple: colors.purple,
      transparent: 'transparent',
      current: 'currentColor'
    },
    extend: {}
  },
  plugins: []
};
