import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import SqlManager from "../sql/SqlManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../../.env") });

const app = express();

const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

const frontendDistPath = path.join(__dirname, "../../../../frontend/dist");
const frontendDistExists = fs.existsSync(frontendDistPath);

const sqlManager = new SqlManager();

if (frontendDistExists) {
	app.use(express.static(frontendDistPath));

	app.get("/api/get-users", async (req, res) => {
		const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
		const perPage = req.query.per_page ? parseInt(req.query.per_page as string, 10) : 20;

		if (page < 1) {
			res.status(400).send({ error: "Page must be greater than 0" });
			return;
		}

		const users = await sqlManager.getUsers(page, perPage);
		res.json(users);
	});

	app.get("/api/get-users-by-id-substring", async (req, res) => {
		const idSubstring = req.query.id_substring as string;
		if (!idSubstring) {
			res.status(400).send({ error: "Id substring is required" });
			return;
		}
		const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
		const perPage = req.query.per_page ? parseInt(req.query.per_page as string, 10) : 20;

		const users = await sqlManager.getUsersByIdSubstring(idSubstring, page, perPage);
		res.json(users);
	});

	app.post('api/update-users-order', async (req, res) => {
		const users = req.body.users;
		if (!users) {
			res.status(400).send({ error: "Users are required" });
			return;
		}
		res.json({ message: "Users order updated" });
	});

	app.get("/", (_req, res) => {
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
