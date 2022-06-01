import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { PermissionLevel } from ".";

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
	interaction.reply("adding../");
}

async function remove(interaction: CommandInteraction) {
	interaction.reply("removin  g../");
	
}

async function list(interaction: CommandInteraction) {
	interaction.reply("listing../");
	
}

const subcommands: Record<string, (interaction: CommandInteraction) => Promise<void>> = { 
	'add': add, 
	'remove': remove, 
	'list': list
};

export const execute = async (interaction: CommandInteraction) => {        
	if(!subcommands[interaction.options.getSubcommand()]) { interaction.reply("WHAT!!!"); return; }

	subcommands[interaction.options.getSubcommand()](interaction);
}