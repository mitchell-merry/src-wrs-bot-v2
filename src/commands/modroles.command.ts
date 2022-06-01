import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { PermissionLevel } from ".";
import { DB } from "../db";
import { ModeratorRole } from "../db/models";

export const data = new SlashCommandBuilder()
	.setName('modroles')
	.setDescription('Manager the moderator roles for the bot. Requires admin permissions.')
	.addSubcommand(sc => sc
		.setName('add')
		.setDescription('Add a moderator role.')
		.addRoleOption(o => o.setName('role').setDescription('The role.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('remove')
		.setDescription('Remove a moderator role.')
		.addRoleOption(o => o.setName('role').setDescription('The role.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('list')
		.setDescription('Lists all moderator roles for this guild.'));

export const perms = {
	'add': 'admin',
	'remove': 'admin',
	'list': 'admin'
};

async function add(interaction: CommandInteraction) {
	if(!interaction.guildId) throw new Error("Invalid guild id...");
	const mrRepo = DB.getRepository(ModeratorRole);

	const roleOption = interaction.options.getRole('role', true);

	const has = await mrRepo.findOne({ where: { guild_id: interaction.guildId, role_id: roleOption.id } });
	if(!!has)
	{
		interaction.reply(`That role is already set as a moderator in this guild.`);
		return;
	}

	const role = new ModeratorRole(interaction.guildId, roleOption.id);
	await mrRepo.save(role);
	interaction.reply(`Added moderator role '${roleOption.name}'.`);
}

async function remove(interaction: CommandInteraction) {
	if(!interaction.guildId) throw new Error("Invalid guild id...");
	const mrRepo = DB.getRepository(ModeratorRole);

	const roleOption = interaction.options.getRole('role', true);

	const role = await mrRepo.findOne({ where: { guild_id: interaction.guildId, role_id: roleOption.id } });
	if(!role)
	{
		interaction.reply(`That role is not set as a moderator in this guild.`);
		return;
	}

	await mrRepo.remove(role);
	interaction.reply(`Removed moderator role '${roleOption.name}'.`);
	
}

async function list(interaction: CommandInteraction) {
	if(!interaction.guildId) throw new Error("Invalid guild id...");
	if(!interaction.guild) throw new Error('Can\'t have guild in Detroit');

	const mrRepo = DB.getRepository(ModeratorRole);

	const guildRoles = await mrRepo.find({ where: { guild_id: interaction.guildId } });
	
	if(guildRoles.length === 0)
	{
		interaction.reply(`This guild has no moderator roles.`);
		return;
	}

	let msg = `This guild has ${guildRoles.length} modrole(s): \n\`\`\`\n`;

	msg += guildRoles.map(role => {
		const roleDiscordObj = interaction.guild!.roles.cache.get(role.role_id);
		if(!roleDiscordObj?.name) return `${role.role_id} does not exist.`;
		
		return `${roleDiscordObj.name} [${role.role_id}]`;
	}).join('\n');

	msg += `\n\`\`\``;
	interaction.reply(msg);
}

const subcommands: Record<string, (interaction: CommandInteraction) => Promise<void>> = { 
	'add': add, 
	'remove': remove, 
	'list': list
};

export const execute = async (interaction: CommandInteraction) => {        
	if(!subcommands[interaction.options.getSubcommand()]) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);

	subcommands[interaction.options.getSubcommand()](interaction);
}