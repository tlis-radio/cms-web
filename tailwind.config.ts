import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "460px",
        xxxl: "2196px",
        tlis_monitor: "3072px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "acoustic-foam": "url('/images/bgimage_29x29.png')",
        "acoustic-foam-round": "url('/images/bgimage_wall_part.png')",
      },
    },
  },
  plugins: [],
};
export default config;