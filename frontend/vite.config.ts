import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	server: {
		port: process.env.FRONTEND_PORT ? Number(process.env.FRONTEND_PORT) : 3000,
		open: true,
	},
});
