import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { add } from "./lb.add";
import { list } from "./lb.list";
import { remove } from "./lb.remove";
import { setrole } from "./lb.setrole";

export const data = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Manage the leaderboards for this guild.')
	.addSubcommand(sc => sc
		.setName('add')
		.setDescription('Add a leaderboard to this guild.')
		.addStringOption(o => o.setName('game').setDescription('The game abbreviation of the leaderboard to add.').setRequired(true))
		.addRoleOption(o => o.setName('role').setDescription('The role to attach the leaderboard to. Leave blank to generate one.')))
	.addSubcommand(sc => sc
		.setName('remove')
		.setDescription('Remove a leaderboard from this guild.')
		.addIntegerOption(o => o.setName('leaderboard').setDescription('The leaderboard to remove.').setRequired(true).setAutocomplete(true))
		.addBooleanOption(o => o.setName('delete_role').setDescription('Delete the associated role.')))
	.addSubcommand(sc => sc
		.setName('list')
		.setDescription('Lists all leaderboards tracked in this guild.'))
	.addSubcommand(sc => sc
		.setName('setrole')
		.setDescription('Sets the role for the leaderboard.')
		.addIntegerOption(o => o.setName('leaderboard').setDescription('The leaderboard to change the role of.').setRequired(true).setAutocomplete(true))
		.addRoleOption(o => o.setName('role').setDescription('The role to change to.').setRequired(true)));

export const perms = {
	'add': 'mods',
	'remove': 'mods',
	'list': 'all',
	'setrole': 'mods',
};

const subcommands: Record<string, (interaction: CommandInteraction) => Promise<void>> = { 
	'add': add, 
	'remove': remove, 
	'list': list,
	'setrole': setrole,
};

export const execute = async (interaction: CommandInteraction) => {           
	if(!subcommands[interaction.options.getSubcommand()]) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);

	if(!interaction.guildId) throw new Error("Invalid guild id...");
	if(!interaction.guild) throw new Error('Can\'t have guild in Detroit');

	await subcommands[interaction.options.getSubcommand()](interaction);
}