/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                ink: "#0B0F1A",
                surface: "#FFFFFF",
                muted: "#F5F7FA",
                line: "#E6EAF0",
                primary: "#1D4ED8", // 필요하면 나중에 조정
            },
            borderRadius: {
                xl: "14px",
                "2xl": "18px",
                "3xl": "24px",
            },
            boxShadow: {
                soft: "0 1px 2px rgba(0,0,0,0.04), 0 14px 40px rgba(0,0,0,0.08)",
            },
        },
    },
    plugins: [],
};
