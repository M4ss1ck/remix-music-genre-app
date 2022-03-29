module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        light: "#edf6f9",
        dark: "#0b090a",
        primary: "#023e8a",
        secundary: "#c1121f",
        tertiary: "#eb5e28",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
