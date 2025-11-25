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
          DEFAULT: "#1a1a1a",
          light: "#2a2a2a",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E5C158",
        },
        navy: {
          DEFAULT: "#000080",
          light: "#0000A0",
        },
        brand: {
          50: "#f5f6fb",
          100: "#e8e9f5",
          200: "#cfd3e8",
          300: "#b1b9d9",
          400: "#8d98c7",
          500: "#6b77b3",
          600: "#525d94",
          700: "#3c456f",
          800: "#262d48",
          900: "#101428",
          DEFAULT: "#101428",
        },
        accent: {
          DEFAULT: "#ecb22e",
          soft: "#f3c75e",
          muted: "#f9e7b0",
        },
        ink: {
          DEFAULT: "#0b1220",
          muted: "#4b5164",
        },
        surface: {
          DEFAULT: "#f8f7f3",
          contrast: "#ffffff",
          muted: "#e4e2da",
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
          "linear-gradient(120deg, rgba(11,18,32,0.95), rgba(16,20,33,0.8))",
        "section-radial":
          "radial-gradient(circle at top, rgba(236,178,46,0.12), transparent 55%)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
}