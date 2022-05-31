import { DataSource } from "typeorm";

export const DB = new DataSource({
	type: "mysql",
	host: "localhost",
	port: +(process.env.PORT || 3306),
	username: 'root',
	password: process.env.MYSQL_ROOT_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	synchronize: true,
	entities: [],
})