import { APIInteractionGuildMember } from "discord-api-types/v9";
import { GuildManager, GuildMember } from "discord.js";
import { DataSource } from "typeorm";
import { entities, GuildEntity, ModeratorRoleEntity } from "./models";

export const DB = new DataSource({
	type: "mysql",
	host: process.env.HOST || "localhost",
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

export async function isUserMod(guild_id: string | null, member: GuildMember | APIInteractionGuildMember | null) {
	if(!guild_id || !member) return false;

	const mrRepo = DB.getRepository(ModeratorRoleEntity);
	const guildRoles = await mrRepo.find({ where: { guild_id } });
	
	return guildRoles.find(role => {
		if(Array.isArray(member.roles)) return member.roles.includes(role.role_id);

		return !!member.roles.cache.get(role.role_id);
	});
}