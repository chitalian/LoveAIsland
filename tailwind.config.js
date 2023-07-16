/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    backgroundColor: (theme) => ({
      ...theme("colors"),
      primary: "#fcfaf8", // '#fcfaf8n',
      secondary: "#ffed4a",
      danger: "#e3342f",
    }),
    extend: {
      colors: {
        betterBlack: {
          light: "#6F727B",
          DEFAULT: "#4B4D53",
          dark: "#27282B",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
