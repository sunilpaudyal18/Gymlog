/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F4F6F9",
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.7)",
          elevated: "rgba(255, 255, 255, 0.9)",
          card: "rgba(255, 255, 255, 0.65)",
          inactive: "rgba(241, 245, 249, 0.8)",
          highlight: "rgba(255, 255, 255, 0.95)",
        },
        border: {
          DEFAULT: "rgba(203, 213, 225, 0.6)",
          subtle: "rgba(203, 213, 225, 0.5)",
          strong: "rgba(148, 163, 184, 0.6)",
          teal: "#008B8E",
          amber: "#D96B27",
        },
        primary: {
          DEFAULT: "#008B8E",
          hover: "#00A3A6",
          active: "#007A7C",
          soft: "rgba(0, 139, 142, 0.12)",
          subtle: "rgba(0, 139, 142, 0.06)",
          glow: "rgba(0, 139, 142, 0.25)",
        },
        secondary: {
          DEFAULT: "#D96B27",
          hover: "#E57A36",
          active: "#C45B1C",
          soft: "rgba(217, 107, 39, 0.12)",
          subtle: "rgba(217, 107, 39, 0.06)",
          glow: "rgba(217, 107, 39, 0.25)",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#64748B",
          dark: "#0F172A",
          light: "#FFFFFF",
        },
        status: {
          success: "#008B8E",
          "success-soft": "rgba(0, 139, 142, 0.12)",
          warning: "#D96B27",
          "warning-soft": "rgba(217, 107, 39, 0.12)",
          error: "#EF4444",
          "error-soft": "rgba(239, 68, 68, 0.12)",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"SF Mono"', '"Geist Mono"', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'card': '20px',
        'hero': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(15, 23, 42, 0.04)',
        'md': '0 4px 16px rgba(15, 23, 42, 0.06)',
        'lg': '0 12px 32px rgba(15, 23, 42, 0.08)',
        'teal': '0 0 25px rgba(0, 139, 142, 0.25)',
        'teal-lg': '0 0 35px rgba(0, 139, 142, 0.35)',
        'amber': '0 0 25px rgba(217, 107, 39, 0.25)',
        'inner-teal': 'inset 0 0 12px rgba(0, 139, 142, 0.15)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 139, 142, 0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 8px rgba(0, 139, 142, 0.1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
