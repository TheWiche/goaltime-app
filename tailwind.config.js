/**
 * GoalTime — Tailwind config (sistema de diseño v3, angular / modo claro).
 * Tokens fuente en src/index.css (:root). Documentación: design-system/goaltime/MASTER.md
 *
 * Nota: los nombres legacy (primary, secondary, cta, surface, dark, goaltime) se
 * conservan apuntando a la paleta nueva para no romper clases existentes.
 */
const colors = require("tailwindcss/colors");

/** Escala de acento (azul #2563EB). */
const blue = {
  50: "#eff6ff",
  100: "#dbeafe",
  200: "#bfdbfe",
  300: "#93c5fd",
  400: "#60a5fa",
  500: "#3b82f6",
  600: "#2563eb",
  700: "#1d4ed8",
  800: "#1e40af",
  900: "#1e3a8a",
  950: "#172554",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Neutrales: `gray` se reasigna a zinc para que todo el gris del código sea neutro.
        gray: colors.zinc,

        // --- Tokens semánticos (preferidos en código nuevo) ---
        canvas: "#FAFAFA", // fondo de página
        fg: {
          DEFAULT: "#18181B", // texto principal
          strong: "#0A0A0A", // títulos
          muted: "#52525B", // texto secundario
          subtle: "#71717A", // metadatos, placeholders fuertes
          faint: "#A1A1AA", // deshabilitado
        },
        line: {
          DEFAULT: "#E4E4E7", // borde estándar 1px
          strong: "#D4D4D8", // bordes de inputs / hover
          subtle: "#F4F4F5", // separadores internos (filas de tabla)
        },
        success: { ...colors.green, DEFAULT: "#16A34A" },
        warning: { ...colors.amber, DEFAULT: "#D97706" },
        danger: { ...colors.red, DEFAULT: "#DC2626" },
        info: { ...blue, DEFAULT: "#2563EB" },

        // --- Nombres legacy apuntando a la paleta nueva ---
        primary: { ...blue, DEFAULT: "#2563EB" },
        secondary: { ...colors.zinc, DEFAULT: "#52525B" },
        cta: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          DEFAULT: "#F97316",
        },
        surface: { ...colors.zinc, DEFAULT: "#FAFAFA" },
        dark: {
          ...colors.zinc,
          DEFAULT: "#18181B",
          800: "#27272A",
          900: "#0A0A0A",
        },
        goaltime: { ...blue, DEFAULT: "#2563EB" },
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        heading: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px
      },
      // Radios angulares. xl/2xl/3xl colapsan a 8px para que el código existente se aplane.
      borderRadius: {
        none: "0",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-lg)",
        "3xl": "var(--radius-lg)",
      },
      // Sombras mínimas. lg/xl/2xl colapsan para calmar el código existente.
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-lg)",
        "2xl": "var(--shadow-lg)",
        card: "var(--shadow-xs)",
        "card-hover": "var(--shadow-sm)",
        glass: "var(--shadow-sm)",
        focus: "0 0 0 3px rgba(37, 99, 235, 0.25)",
      },
      // Blur contenido: cualquier backdrop-blur-* heredado queda sutil.
      backdropBlur: {
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "8px",
        "3xl": "8px",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      animation: {
        "fade-in": "fadeIn 150ms ease-out",
        "slide-up": "slideUp 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 160ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98) translateY(4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
