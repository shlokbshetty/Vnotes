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
        // Obsidian Echo - Dark mode surface levels
        "surface": {
          0: "#111111",    // Background
          1: "#1C1B1B",    // Sidebars
          2: "#201F1F",    // Cards/Panels
          3: "#2a2a2a",    // Active elements
          4: "#353534",    // Hover
          DEFAULT: "#0A0A0C", // Base
        },
        // Obsidian Echo - Light mode surface levels
        "surface-light": {
          0: "#F5F5F4",    // Background
          1: "#EEEEEC",    // Sidebars
          2: "#E8E8E6",    // Cards/Panels
          3: "#E0E0DE",    // Active elements
          4: "#D8D8D6",    // Hover
        },
        // Obsidian Echo - Primary accent colors (design tokens using CSS variables)
        "primary-accent": "rgb(var(--color-primary-accent) / <alpha-value>)",   // Electric Blue #B7C4FF
        "secondary-accent": "rgb(var(--color-secondary-accent) / <alpha-value>)", // Pulse Red #FFBAB0
        "success-accent": "rgb(var(--color-success-accent) / <alpha-value>)",   // Mint Green #6DDC9E

        // Redesign mockups specific colors
        "primary": "#b7c4ff",
        "primary-container": "#3e63dd",
        "on-primary": "#002681",
        "on-primary-container": "#eeeeff",
        "primary-fixed": "#dce1ff",
        "primary-fixed-dim": "#b7c4ff",
        "on-primary-fixed": "#001551",
        "on-primary-fixed-variant": "#0039b4",
        "inverse-primary": "#2c54ce",

        "secondary": "#ffb3b0",
        "secondary-container": "#92011a",
        "on-secondary": "#68000f",
        "on-secondary-container": "#ff9996",
        "secondary-fixed": "#ffdad8",
        "secondary-fixed-dim": "#ffb3b0",
        "on-secondary-fixed": "#410006",
        "on-secondary-fixed-variant": "#92011a",

        "tertiary": "#6ddc9e",
        "tertiary-container": "#007d4d",
        "on-tertiary": "#003920",
        "on-tertiary-container": "#bcffd3",
        "tertiary-fixed": "#8af8b9",
        "tertiary-fixed-dim": "#6ddc9e",
        "on-tertiary-fixed": "#002111",
        "on-tertiary-fixed-variant": "#005231",

        "background": "#131313",
        "on-background": "#e5e2e1",
        "on-surface": "#e5e2e1",
        "surface-dim": "#131313",
        "surface-bright": "#3a3939",
        "surface-variant": "#353534",
        "on-surface-variant": "#c4c5d6",
        "inverse-surface": "#e5e2e1",
        "inverse-on-surface": "#313030",

        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",

        "outline": "#8e909f",
        "outline-variant": "#444654",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        "surface-tint": "#b7c4ff",
        
        // Primary accent color (blue) - legacy
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
        sans: ["Hanken Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Hanken Grotesk", "system-ui", "sans-serif"],
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