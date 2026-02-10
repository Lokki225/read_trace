import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        border: "var(--border)",
        muted: "var(--muted)",
        "brand-orange": "var(--brand-orange)",
        "brand-orange-hover": "var(--brand-orange-hover)",
        "brand-cream": "var(--brand-cream)",
        "brand-peach": "var(--brand-peach)",
        "brand-charcoal": "var(--brand-charcoal)",
        "brand-gray": "var(--brand-gray)",
        "brand-progress": "var(--brand-progress)",
        "brand-teal": "var(--brand-teal)",
      },
    },
  },
  plugins: [],
} satisfies Config;
