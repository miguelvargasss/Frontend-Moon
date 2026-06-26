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
          bg: "#0A0F1E",
          "bg-secondary": "#0f172a",
          "bg-tertiary": "#1e293b",
          accent: "#99f6e4",
          "accent-secondary": "#5eead4",
          tertiary: "#64748B",
        },
      },
      fontFamily: {
        display: ["Bodoni Moda", "serif"],
        body: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: "#0A0F1E",
            foreground: "#E2E8F0",
            primary: {
              50: "#f0fdfa",
              100: "#ccfbf1",
              200: "#99f6e4",
              300: "#5eead4",
              400: "#2dd4a8",
              500: "#14b8a6",
              600: "#0d9488",
              700: "#0f766e",
              800: "#115e59",
              900: "#134e4a",
              DEFAULT: "#99f6e4",
              foreground: "#0A0F1E",
            },
            focus: "#99f6e4",
          },
        },
      },
    }),
  ],
};
