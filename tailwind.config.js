/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'charcoal-black': '#222222',
        'dark-gray': '#444444',
        'smoke-gray': '#909090',
        'light-gray': '#c0c0c0',
        'white': '#ffffff',
        'black':'#000000',
        'navy':'#000080',
        'seagreen':'#8fbc8f',
        'color1':'#ffc800',
        'color2':'#f4f4f3',
        'color3':'#005c99',
        'color4':'#9657c9',
      },
      borderColor:{
        gray: {
          300: '#005c99',//変更したい色
        },
      },
    },
  },
  plugins: [],
}
