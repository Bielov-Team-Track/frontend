import { error } from "console";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "mobile-s": "320px",
      "mobile-m": "375px",
      "mobile-l": "425px",
      tablet: "768px",
      desktop: "1024px",
      "desktop-l": "1440px",
    },
    extend: {
      colors: {
        background: "#292929",
        "background-content": "#ffffff",
        foreground: "#141414",
        "foreground-content": "#ebebeb",
        neutral: "#ffffff",
        "neutral-content": "#38686b",
        primary: "#38686B",
        "primary-content": "#ffffff",
        secondary: "#be3f23",
        "secondary-content": "#ffffff",
        accent: "#ff7d00",
        "accent-content": "#000000",
        error: "#ff4d6d",
        "error-content": "#ffffff",
        success: "#00c851",
        "success-content": "#ffffff",
        warning: "#ffbb33",
        "warning-content": "#000000",
      },
      fontSize: {
        xs: [
          "0.75rem",
          {
            lineHeight: "1rem",
          },
        ],
        sm: [
          "0.875rem",
          {
            lineHeight: "1.25rem",
          },
        ],
        base: [
          "0.875rem",
          {
            lineHeight: "1.375rem",
          },
        ],
        lg: [
          "1rem",
          {
            lineHeight: "1.5rem",
          },
        ],
        xl: [
          "1.125rem",
          {
            lineHeight: "1.75rem",
          },
        ],
        "2xl": [
          "1.25rem",
          {
            lineHeight: "1.875rem",
          },
        ],
        "3xl": [
          "1.5rem",
          {
            lineHeight: "2rem",
          },
        ],
        "4xl": [
          "1.75rem",
          {
            lineHeight: "2.25rem",
          },
        ],
        "5xl": [
          "2rem",
          {
            lineHeight: "2.5rem",
          },
        ],
        "mobile-xs": [
          "0.75rem",
          {
            lineHeight: "1rem",
          },
        ],
        "mobile-sm": [
          "0.8125rem",
          {
            lineHeight: "1.125rem",
          },
        ],
        "mobile-base": [
          "0.875rem",
          {
            lineHeight: "1.375rem",
          },
        ],
        "mobile-lg": [
          "0.9375rem",
          {
            lineHeight: "1.4375rem",
          },
        ],
        "tablet-base": [
          "1rem",
          {
            lineHeight: "1.5rem",
          },
        ],
        "tablet-lg": [
          "1.125rem",
          {
            lineHeight: "1.625rem",
          },
        ],
        "desktop-base": [
          "1.0625rem",
          {
            lineHeight: "1.5625rem",
          },
        ],
        "desktop-lg": [
          "1.1875rem",
          {
            lineHeight: "1.6875rem",
          },
        ],
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      minHeight: {
        "screen-safe":
          "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
      maxWidth: {
        mobile: "480px",
        tablet: "768px",
        desktop: "1200px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};
export default config;
