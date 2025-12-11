/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E8B57",
          light: "#3CB371",
        },
        brand: {
          50: "#E7F8EF",
          100: "#D4F0E0",
          200: "#B8E4CB",
          300: "#94D5B3",
          400: "#68C594",
          500: "#2E8B57",
          600: "#257047",
          700: "#1D5837",
          800: "#15412A",
          900: "#0C1B33",
          DEFAULT: "#2E8B57",
        },
        accent: {
          DEFAULT: "#3CB371",
          soft: "#E0F4EA",
          muted: "#D8F1E4",
        },
        ink: {
          DEFAULT: "#0C1B33",
          muted: "#4A5568",
        },
        surface: {
          DEFAULT: "#E7F8EF",
          contrast: "#ffffff",
          muted: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      boxShadow: {
        floating: "0 25px 60px rgba(15, 20, 33, 0.12)",
        card: "0 15px 35px rgba(17, 17, 26, 0.1)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(120deg, #2E8B57 0%, #3CB371 55%, #0C1B33 100%)",
        "section-radial":
          "radial-gradient(circle at 20% 20%, rgba(44,139,87,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(12,27,51,0.2), transparent 55%)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
}