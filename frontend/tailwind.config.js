/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#6366f1',
                'primary-dark': '#4f46e5',
            },
        },
    },
    plugins: [],
};
