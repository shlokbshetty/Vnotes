/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary accent color (blue)
        "accent": {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          DEFAULT: "#3b82f6"
        },
        // Neutral palette
        "neutral": {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
        // Semantic colors
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#0ea5e9",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      },
      spacing: {
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.02em" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "2xl": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "3xl": ["30px", { lineHeight: "36px", fontWeight: "700" }],
        "4xl": ["36px", { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
}