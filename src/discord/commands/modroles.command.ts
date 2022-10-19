import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { DB } from "../../db";
import { ModeratorRoleEntity } from "../../db/entities";
import PaginatedList from "../menus/PaginatedList";
import UserError from "../UserError";
import { CommandWithSubcommands, Subcommand } from "./command";

const ModrolesAddCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('add')
		.setDescription('Add a moderator role.')
		.addRoleOption(o => o.setName('role').setDescription('The role.').setRequired(true)),
	perm: 'admin',
	execute: async (interaction, guildEnt) => {
		const roleOption = interaction.options.getRole('role', true);
	
		const has = guildEnt.moderatorRoles.find(mr => mr.role_id === roleOption.id);
		if(!!has) throw new UserError(`That role is already set as a moderator in this guild.`);
	
		const role = new ModeratorRoleEntity(interaction.guildId!, roleOption.id);
		await DB.getRepository(ModeratorRoleEntity).save(role);
		await interaction.reply(`Added moderator role <@&${roleOption.id}>.`);
	}
};

const ModrolesRemoveCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('remove')
		.setDescription('Remove a moderator role.')
		.addRoleOption(o => o.setName('role').setDescription('The role.').setRequired(true)),
	perm: 'admin',
	execute: async (interaction) => {
		const mrRepo = DB.getRepository(ModeratorRoleEntity);
	
		const roleOption = interaction.options.getRole('role', true);
	
		const role = await mrRepo.findOne({ where: { guild_id: interaction.guildId!, role_id: roleOption.id } });
		if(!role) throw new UserError(`That role is not set as a moderator in this guild.`);
	
		await mrRepo.remove(role);
		await interaction.reply(`Removed moderator role '${roleOption.name}'.`);
	}
}

const ModrolesListCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('list')
		.setDescription('Lists all moderator roles for this guild.'),
	perm: 'mods',
	execute: async (interaction) => {
		const mrRepo = DB.getRepository(ModeratorRoleEntity);
		await interaction.deferReply();	
	
		const guildRoles = await mrRepo.find({ where: { guild_id: interaction.guildId! } });
		if(guildRoles.length === 0) throw new UserError(`This guild has no moderator roles.`);
	
		const items = guildRoles.map(role => `<@&${role.role_id}>`);
	
		await new PaginatedList(items, 15, "This list has expired. Use /modroles list to spawn a new one.")
			.spawnMenu(interaction);
	}
}

const ModrolesCommand: CommandWithSubcommands = {
	data: new SlashCommandBuilder()
		.setName('modroles')
		.setDescription('Manages the moderator roles for the bot. Requires admin permissions.'),
	subcommands: [ ModrolesAddCommand, ModrolesRemoveCommand, ModrolesListCommand ]
};

export default ModrolesCommand;