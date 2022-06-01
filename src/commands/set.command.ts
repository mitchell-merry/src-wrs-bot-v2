import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { PermissionLevel } from ".";
import { DB } from "../db";
import { ModeratorRole } from "../db/models";

export const data = new SlashCommandBuilder()
	.setName('set')
	.setDescription('Set server settings. Requires moderator permissions.')
	.addSubcommand(sc => sc
		.setName('above_role')
		.setDescription('The role that new roles get created above.')
		.addRoleOption(o => o.setName('above_role').setDescription('The role.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('role_colour')
		.setDescription('The colour of new roles created by the bot. Should be a hexcode, e.g. #FEE75C.')
		.addStringOption(o => o.setName('role_colour').setDescription('The colour.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('list')
		.setDescription('Lists all settings for this guild.'));

export const perms = 'mod';

async function above_role(interaction: CommandInteraction) {
	
}

async function role_default_color(interaction: CommandInteraction) {

}

async function list(interaction: CommandInteraction) {
	
}

const subcommands: Record<string, (interaction: CommandInteraction) => Promise<void>> = { 
	'above_role': above_role, 
	'role_default_color': role_default_color, 
	'list': list,
};

export const execute = async (interaction: CommandInteraction) => {        
	if(!subcommands[interaction.options.getSubcommand()]) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);

	subcommands[interaction.options.getSubcommand()](interaction);
}