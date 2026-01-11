import type { Config } from "tailwindcss"

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        primary: "rgba(var(--bg-primary))",
        secondary: "rgba(var(--bg-secondary))",
        tertiary: "rgba(var(--bg-tertiary))",
        disabled: "rgba(var(--bg-disabled))",
        component: {
          DEFAULT: "rgba(var(--bg-component-primary))",
          hover: "rgba(var(--bg-component-primary-hover))",
          secondary: {
            DEFAULT: "rgba(var(--bg-component-secondary))",
            hover: "rgba(var(--bg-component-secondary-hover))",
          },
        },
        action: {
          DEFAULT: "rgba(var(--bg-action-primary))",
          hover: "rgba(var(--bg-action-primary-hover))",
          pressed: "rgba(var(--bg-action-primary-pressed))",
          secondary: {
            DEFAULT: "var(--bg-action-secondary)",
            hover: "var(--bg-action-secondary-hover)",
            pressed: "var(--bg-action-secondary-pressed)",
          },
          tertiary: {
            DEFAULT: "var(--bg-action-tertiary)",
            hover: "var(--bg-action-tertiary-hover)",
            pressed: "var(--bg-action-tertiary-pressed)",
          },
        },
        accent: {
          DEFAULT: "rgba(var(--bg-accent-primary))",
          hover: "rgba(var(--bg-accent-primary-hover))",
          pressed: "rgba(var(--bg-accent-primary-pressed))",
          secondary: {
            DEFAULT: "var(--bg-accent-secondary)",
            hover: "var(--bg-accent-secondary-hover)",
            pressed: "var(--bg-accent-secondary-pressed)",
          },
        },
        positive: {
          DEFAULT: "rgba(var(--bg-positive-primary))",
          hover: "rgba(var(--bg-positive-primary-hover))",
          pressed: "rgba(var(--bg-positive-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-positive-secondary))",
            hover: "rgba(var(--bg-positive-secondary-hover))",
            pressed: "rgba(var(--bg-positive-secondary-pressed))",
          },
        },
        negative: {
          DEFAULT: "rgba(var(--bg-negative-primary))",
          hover: "rgba(var(--bg-negative-primary-hover))",
          pressed: "rgba(var(--bg-negative-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-negative-secondary))",
            hover: "rgba(var(--bg-negative-secondary-hover))",
            pressed: "rgba(var(--bg-negative-secondary-pressed))",
          },
        },
        warning: {
          DEFAULT: "rgba(var(--bg-warning-primary))",
          hover: "rgba(var(--bg-warning-primary-hover))",
          pressed: "rgba(var(--bg-warning-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-warning-secondary))",
            hover: "rgba(var(--bg-warning-secondary-hover))",
            pressed: "rgba(var(--bg-warning-secondary-pressed))",
          },
        },
        // Solarpunk color utilities
        forest: {
          DEFAULT: "rgba(var(--brand-700))",
          light: "rgba(var(--brand-400))",
          dark: "rgba(var(--brand-900))",
        },
        amber: {
          DEFAULT: "rgba(var(--amber-400))",
          light: "rgba(var(--amber-200))",
          dark: "rgba(var(--amber-600))",
        },
      },
      colors: {
        primary: "rgba(var(--content-primary))",
        secondary: "rgba(var(--content-secondary))",
        tertiary: "rgba(var(--content-tertiary))",
        disabled: "rgba(var(--content-disabled))",
        action: {
          DEFAULT: "rgba(var(--content-action-primary))",
          hover: "rgba(var(--content-action-primary-hover))",
          pressed: "rgba(var(--content-action-primary-pressed))",
          on: {
            primary: "rgba(var(--content-action-on-primary))",
            secondary: "rgba(var(--content-action-on-secondary))",
            tertiary: "rgba(var(--content-action-on-tertiary))",
          },
        },
        accent: {
          DEFAULT: "rgba(var(--content-accent-primary))",
          on: {
            primary: "rgba(var(--content-accent-on-primary))",
            secondary: "rgba(var(--content-accent-on-secondary))",
          },
        },
        positive: {
          DEFAULT: "rgba(var(--content-positive-primary))",
          on: {
            primary: "rgba(var(--content-positive-on-primary))",
            secondary: "rgba(var(--content-positive-on-secondary))",
          },
        },
        negative: {
          DEFAULT: "rgba(var(--content-negative-primary))",
          on: {
            primary: "rgba(var(--content-negative-on-primary))",
            secondary: "rgba(var(--content-negative-on-secondary))",
          },
        },
        warning: {
          DEFAULT: "rgba(var(--content-warning-primary))",
          on: {
            primary: "rgba(var(--content-warning-on-primary))",
            secondary: "rgba(var(--content-warning-on-secondary))",
          },
        },
        // Solarpunk color utilities
        forest: {
          DEFAULT: "rgba(var(--brand-700))",
          light: "rgba(var(--brand-500))",
          dark: "rgba(var(--brand-900))",
        },
        "amber-text": {
          DEFAULT: "rgba(var(--amber-600))",
          light: "rgba(var(--amber-400))",
          dark: "rgba(var(--amber-800))",
        },
      },
      borderColor: {
        DEFAULT: "rgba(var(--border-primary))",
        secondary: "rgba(var(--border-secondary))",
        action: "rgba(var(--border-action))",
        accent: "rgba(var(--border-accent))",
        negative: {
          DEFAULT: "rgba(var(--border-negative-primary))",
          secondary: "rgba(var(--border-negative-secondary))",
        },
        positive: {
          DEFAULT: "rgba(var(--border-positive-primary))",
          secondary: "rgba(var(--border-positive-secondary))",
        },
        warning: {
          DEFAULT: "rgba(var(--border-warning-primary))",
          secondary: "rgba(var(--border-warning-secondary))",
        },
        disabled: "rgba(var(--border-disabled))",
        forest: "rgba(var(--brand-400))",
        amber: "rgba(var(--amber-400))",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        full: "1000px",
      },
      fill: {
        primary: "rgba(var(--content-action-on-primary))",
        secondary: "rgba(var(--content-action-on-secondary))",
        disabled: "rgba(var(--content-disabled))",
        accent: "rgba(var(--amber-500))",
        forest: "rgba(var(--brand-500))",
      },
      boxShadow: {
        "solarpunk-sm": "0 2px 8px rgba(22, 68, 41, 0.08)",
        "solarpunk-md": "0 4px 16px rgba(22, 68, 41, 0.12)",
        "solarpunk-lg": "0 8px 32px rgba(22, 68, 41, 0.16)",
        "amber-glow": "0 0 20px rgba(245, 180, 50, 0.3)",
        "forest-glow": "0 0 20px rgba(72, 187, 120, 0.3)",
      },
      backgroundImage: {
        "gradient-solarpunk": "linear-gradient(135deg, rgba(72, 187, 120, 1) 0%, rgba(245, 180, 50, 1) 100%)",
        "gradient-forest": "linear-gradient(180deg, rgba(38, 135, 78, 1) 0%, rgba(22, 68, 41, 1) 100%)",
        "gradient-sunrise": "linear-gradient(180deg, rgba(255, 205, 90, 1) 0%, rgba(220, 155, 40, 1) 100%)",
        "gradient-nature": "linear-gradient(135deg, rgba(120, 218, 153, 0.3) 0%, rgba(255, 225, 140, 0.3) 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config
