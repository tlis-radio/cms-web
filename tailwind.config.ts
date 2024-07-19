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
        argentumSansRegular: ["ArgentumSans-Regular", "system-ui"],
        argentumSansBold: ["ArgentumSans-Bold", "system-ui"],
        argentumSansMedium: ["ArgentumSans-Medium", "system-ui"],
        argentumSansLight: ["ArgentumSans-Light", "system-ui"],
        argentumSansThin: ["ArgentumSans-Thin", "system-ui"],
      },
      backgroundImage: {
        "acoustic-foam": "url('/images/bgimage.png')",
      },
    },
  },
  plugins: [],
};
export default config;
