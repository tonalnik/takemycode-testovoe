import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "../types"),
		},
	},
	server: {
		port: process.env.PORT ? Number(process.env.PORT) : 3000,
		open: true,
		sourcemapIgnoreList: false,
	},
	build: {
		sourcemap: true,
	},
});
