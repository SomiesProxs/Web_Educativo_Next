/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Esto es crucial para el modo oscuro basado en clases
  theme: {
    extend: {
      // Aquí puedes extender los colores o añadir configuraciones personalizadas
    },
  },
  plugins: [],
}