import { DataSource } from "typeorm";
import { Guild, Player } from "./models";

export const DB = new DataSource({
	type: "mysql",
	host: "localhost",
	port: +(process.env.PORT || 3306),
	username: 'root',
	password: process.env.MYSQL_ROOT_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	synchronize: true,
	entities: [ Guild, Player ],
})

DB.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    });