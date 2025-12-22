import type { UsersData } from "@shared/SharedTypes.js";
import mysql, { Connection } from "mysql2";

export default class SqlManager {
	private _database: string;
	private _connection: Connection;

	constructor() {
		this._database = process.env.MYSQL_DATABASE as string;
		this._connection = this.createConnectionWithRetry();
	}

	private createConnectionWithRetry(maxRetries: number = 10, delay: number = 2000): Connection {
		const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;
		const connection = mysql.createConnection({
			host: process.env.MYSQL_HOST,
			user: process.env.MYSQL_USER,
			database: this._database,
			password: process.env.MYSQL_PASSWORD,
			port,
		});

		let retries = 0;
		const attemptConnect = async () => {
			connection.connect(async (err) => {
				if (err) {
					retries++;
					if (retries < maxRetries) {
						console.log(`Попытка подключения к MySQL ${retries}/${maxRetries}...`);
						setTimeout(attemptConnect, delay);
					} else {
						console.error("Ошибка при подключении к серверу MySQL после всех попыток: " + err.message);
					}
				} else {
					console.log("Подключение к серверу MySQL успешно установлено");
					try {
						await this.createUsersTable();

						const existingCount = await this.getTotalUserCount();

						if (existingCount === 0) {
							await this.initializeUsers(100000);
						} else {
							console.log(`В таблице уже есть ${existingCount} пользователей, инициализация пропущена`);
						}
					} catch (err) {
						console.error("Ошибка при инициализации пользователей:", err);
					}
				}
			});
		};

		attemptConnect();
		return connection;
	}

	destroy() {
		this._connection.destroy();
	}

	async getUsers(page: number = 1, perPage: number = 20): Promise<UsersData> {
		const offset = (page - 1) * perPage;
		const query = `SELECT * FROM users LIMIT ? OFFSET ?`;
		const users = await this._queryPromiseWithParams(query, [perPage, offset]);
		const totalUserCount = await this.getTotalUserCount();
		return { users, totalUserCount };
	}

	async getUsersByIdSubstring(idSubstring: string, page: number = 1, perPage: number = 20): Promise<UsersData> {
		const offset = (page - 1) * perPage;
		const likePattern = `${idSubstring}%`;

		const query = `
			SELECT * FROM users
			WHERE CONVERT(id, CHAR) LIKE ?
			ORDER BY id
			LIMIT ? OFFSET ?
		`;
		const users = await this._queryPromiseWithParams(query, [likePattern, perPage, offset]);
		const totalUserCount = await this.getUserCountByIdSubstring(idSubstring);
		return { users, totalUserCount };
	}

	async getUserCountByIdSubstring(idSubstring: string) {
		const likePattern = `${idSubstring}%`;
		const query = `
			SELECT COUNT(*) AS count FROM users
			WHERE CONVERT(id, CHAR) LIKE ?
		`;
		const result = await this._queryPromiseWithParams(query, [likePattern]);
		return Array.isArray(result) && result.length > 0 ? result[0].count : 0;
	}

	async getTotalUserCount(): Promise<number> {
		const query = `SELECT COUNT(*) FROM users`;
		const res = await this._queryPromise(query);
		return Array.isArray(res) && res.length > 0 ? res[0]["COUNT(*)"] : 0;
	}

	private _queryPromiseWithParams(query: string, params: any[]): Promise<any> {
		return new Promise((resolve, reject) => {
			this._connection.query(query, params, (err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			});
		});
	}

	private _queryPromise(query: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this._connection.query(query, (err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			});
		});
	}

	async createUsersTable() {
		const query = `
			CREATE TABLE IF NOT EXISTS users (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(100) NOT NULL,
				email VARCHAR(100) NOT NULL UNIQUE,
				age INT NOT NULL,
				city VARCHAR(50),
				phone VARCHAR(20),
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				INDEX idx_email (email)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
		`;

		try {
			await this._queryPromise(query);
			console.log("Таблица users успешно создана или уже существует");
		} catch (err) {
			console.error("Ошибка при создании таблицы users:", err);
			throw err;
		}
	}

	async initializeUsers(count: number = 1000) {
		const cities = [
			"Москва",
			"Санкт-Петербург",
			"Новосибирск",
			"Екатеринбург",
			"Казань",
			"Нижний Новгород",
			"Челябинск",
			"Самара",
			"Омск",
			"Ростов-на-Дону",
		];
		const firstNames = [
			"Иван",
			"Александр",
			"Дмитрий",
			"Максим",
			"Андрей",
			"Сергей",
			"Алексей",
			"Артем",
			"Илья",
			"Михаил",
			"Николай",
			"Владимир",
			"Павел",
			"Роман",
			"Олег",
			"Виктор",
			"Юрий",
			"Евгений",
			"Денис",
			"Антон",
		];
		const lastNames = [
			"Иванов",
			"Петров",
			"Сидоров",
			"Смирнов",
			"Кузнецов",
			"Попов",
			"Соколов",
			"Лебедев",
			"Козлов",
			"Новиков",
			"Морозов",
			"Волков",
			"Соловьев",
			"Васильев",
			"Зайцев",
			"Павлов",
			"Семенов",
			"Голубев",
			"Виноградов",
			"Богданов",
		];

		const values: string[] = [];

		for (let i = 1; i <= count; i++) {
			const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
			const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
			const name = `${firstName} ${lastName}`;
			const email = `user${i}@test.com`;
			const age = Math.floor(Math.random() * 50) + 18; // от 18 до 67 лет
			const city = cities[Math.floor(Math.random() * cities.length)];
			const phone = `+7${Math.floor(Math.random() * 9000000000) + 1000000000}`;

			values.push(`('${name.replace(/'/g, "''")}', '${email}', ${age}, '${city}', '${phone}')`);
		}

		// Разбиваем на батчи по 100 записей для оптимизации
		const batchSize = 100;
		let inserted = 0;

		for (let i = 0; i < values.length; i += batchSize) {
			const batch = values.slice(i, i + batchSize);
			const query = `
				INSERT INTO users (name, email, age, city, phone)
				VALUES ${batch.join(", ")}
				ON DUPLICATE KEY UPDATE email=email;
			`;

			try {
				await this._queryPromise(query);
				inserted += batch.length;
				console.log(`Вставлено пользователей: ${inserted}/${count}`);
			} catch (err) {
				console.error(`Ошибка при вставке батча ${i / batchSize + 1}:`, err);
				throw err;
			}
		}

		console.log(`Инициализация завершена. Всего создано пользователей: ${inserted}`);
		return inserted;
	}
}
