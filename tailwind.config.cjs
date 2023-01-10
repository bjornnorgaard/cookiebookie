/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            minHeight: {
                "content": "calc(100vh - 4em)"
            },
            padding: {
                "nav": "3em"
            }
        }
    },
    plugins: [
        require("daisyui"),
        require('@tailwindcss/typography'),
    ],
    daisiui: {
        themes: ["retro", "coffee"],
        darkTheme: "coffee",
        log: false
    }
}
