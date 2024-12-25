module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        brandPrimary: 'var(--brand-primary)',
        brandPrimaryDark: 'var(--brand-primary-dark)',
        brandBackground: 'var(--brand-background)',
        brandActive: 'var(--brand-active)',
        brandHeaderBackground: 'var(--brand-header-background)',
        primaryRed: 'var(--primary-red)',
        redHover: 'var(--red-hover)',
        primaryWhite: 'var(--primary-white)',
        whiteHover: 'var(--white-hover)',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
