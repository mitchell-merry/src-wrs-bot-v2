import { GuildManager } from "discord.js";
import { DataSource } from "typeorm";
import { entities, GuildEntity } from "./models";

export const DB = new DataSource({
	type: "mysql",
	host: "localhost",
	port: +(process.env.PORT || 3306),
	username: 'root',
	password: process.env.MYSQL_ROOT_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	synchronize: true,
	entities,
});

export async function synchronizeGuilds(guilds: GuildManager) {
	const guildRepo = DB.getRepository(GuildEntity);
	const syncs = guilds.cache.map(async guild => {
		const guildE = await guildRepo.findOne({ where: { guild_id: guild.id } });
		if(guildE) return null;

		console.log(`Syncing ${guild.id}...`);
		const NewGuild = new GuildEntity(guild.id);
		return guildRepo.save(NewGuild);
	})
	
	await Promise.all(syncs);
}