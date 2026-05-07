const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moon: {
          bg: "#060b09",
          "bg-secondary": "#0d1a14",
          "bg-tertiary": "#0f2119",
          accent: "#2dd4a8",
          "accent-secondary": "#34d399",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["Outfit", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: "#060b09",
            foreground: "#e2e8f0",
            primary: {
              50: "#0d2e23",
              100: "#0f3d2e",
              200: "#145c42",
              300: "#1a7a58",
              400: "#22996e",
              500: "#2dd4a8",
              600: "#34d399",
              700: "#5ee0b5",
              800: "#88ead0",
              900: "#b3f3e4",
              DEFAULT: "#2dd4a8",
              foreground: "#060b09",
            },
            focus: "#2dd4a8",
          },
        },
      },
    }),
  ],
};
