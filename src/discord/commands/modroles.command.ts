import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { DB } from "../../db";
import { ModeratorRoleEntity } from "../../db/entities";
import PaginatedList from "../menus/PaginatedList";
import UserError from "../UserError";

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
	const mrRepo = DB.getRepository(ModeratorRoleEntity);

	const roleOption = interaction.options.getRole('role', true);

	const has = await mrRepo.findOne({ where: { guild_id: interaction.guildId!, role_id: roleOption.id } });
	if(!!has) throw new UserError(`That role is already set as a moderator in this guild.`);

	const role = new ModeratorRoleEntity(interaction.guildId!, roleOption.id);
	await mrRepo.save(role);
	interaction.reply(`Added moderator role '${roleOption.name}'.`);
}

async function remove(interaction: CommandInteraction) {
	const mrRepo = DB.getRepository(ModeratorRoleEntity);

	const roleOption = interaction.options.getRole('role', true);

	const role = await mrRepo.findOne({ where: { guild_id: interaction.guildId!, role_id: roleOption.id } });
	if(!role) throw new UserError(`That role is not set as a moderator in this guild.`);

	await mrRepo.remove(role);
	interaction.reply(`Removed moderator role '${roleOption.name}'.`);
	
}

async function list(interaction: CommandInteraction) {
	const mrRepo = DB.getRepository(ModeratorRoleEntity);
	await interaction.deferReply();	

	const guildRoles = await mrRepo.find({ where: { guild_id: interaction.guildId! } });
	if(guildRoles.length === 0) throw new UserError(`This guild has no moderator roles.`);

	const items = guildRoles.map(role => `<@&${role.role_id}> [${role.role_id}]`);

	await new PaginatedList(items, 15, "This list has expired. Use /modroles list to spawn a new one.")
		.spawnMenu(interaction);
}

const subcommands: Record<string, (interaction: CommandInteraction) => Promise<void>> = { 
	'add': add, 
	'remove': remove, 
	'list': list
};

export const execute = async (interaction: CommandInteraction) => {        
	if(!subcommands[interaction.options.getSubcommand()]) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);

	if(!interaction.guildId) throw new Error("Invalid guild id...");
	if(!interaction.guild) throw new Error('Can\'t have guild in Detroit');

	await subcommands[interaction.options.getSubcommand()](interaction);
}