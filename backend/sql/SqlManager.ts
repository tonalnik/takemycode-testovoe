import mysql from "mysql2";

export default class SqlManager {
	connect() {
		const connection = mysql.createConnection({
			host: "localhost",
			user: "root",
			database: "test",
			password: "",
		});
		connection.connect(function (err) {
			if (err) {
				return console.error("Ошибка: " + err.message);
			} else {
				console.log("Подключение к серверу MySQL успешно установлено");
			}
		});
	}
}
