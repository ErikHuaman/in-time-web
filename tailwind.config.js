/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}",
    ],
    safelist: [
      {
        pattern: /(bg|border)-[a-z]+-(300|400|500|600|700)\/(15|50)/,
      },
      {
        pattern: /text-[a-z]+-700/,
      },
      'border'
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  