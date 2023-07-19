import 'dotenv/config';
import { APIInteractionGuildMember, GuildManager, GuildMember } from "discord.js";
import { DataSource } from "typeorm";
import { entities, GuildEntity, ModeratorRoleEntity } from "./entities";
import { join } from 'path';

const migrations = [ join(__dirname, 'migrations', '*.{ts,js}') ];
export const DB = new DataSource({
	type: "mysql",
	host: process.env.DBHost || "localhost",
	port: +(process.env.DBPort || 3306),
	username: 'root',
	password: process.env.DBPass,
	database: "srcwrs",
	synchronize: (process.env.DiscordSyncCommands === "true") || false,
	migrationsRun: true,
	entities,
	migrations,
});

console.log(`Will look for migrations at \`${migrations}\`.`);

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
	
	return !!guildRoles.find(role => {
		if(Array.isArray(member.roles)) return member.roles.includes(role.role_id);

		return !!member.roles.cache.get(role.role_id);
	});
}