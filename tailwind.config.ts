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
        xxxl: "2196px",
        tlis_monitor: "3072px",
      },
      fontFamily: {
        sans: ["ArgentumSans-Regular", "system-ui"],
      },
      backgroundImage: {
      },
    },
  },
  plugins: [],
};
export default config;
