import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import SqlManager from "../sql/SqlManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

const frontendDistPath = path.join(__dirname, "../../../frontend/dist");
const frontendDistExists = fs.existsSync(frontendDistPath);

const sqlManager = new SqlManager();
sqlManager.connect();

if (frontendDistExists) {
	app.use(express.static(frontendDistPath));

	app.get("/api/test", (_req, res) => {
		res.send("test");
	});

	app.get("/{*any}", (_req, res) => {
		res.sendFile(path.join(frontendDistPath, "index.html"));
	});
} else {
	app.get("/", (_req, res) => {
		res.send("Frontend error: dist folder not found");
	});
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	if (frontendDistExists) {
		console.log(`Serving static files from ${frontendDistPath}`);
	} else {
		console.log("Warning: Frontend dist folder not found!");
	}
});
