import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const BASE_URL = process.env.VITE_BASE_URL;

export default defineConfig({
	plugins: [tailwindcss(), solid()],
  base: BASE_URL
});
