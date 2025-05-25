/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/app/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af", // Blue
        secondary: "#6b7280", // Gray
        background: {
          light: "#f9fafb",
          dark: "#111827",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  darkMode: "class",
};
