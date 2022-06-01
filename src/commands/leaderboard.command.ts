import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Manage the leaderboards for this guild.')
	.addSubcommand(sc => sc
		.setName('add')
		.setDescription('Add a leaderboard to this guild.')
		.addStringOption(o => o.setName('game').setDescription('The game abbreviation of the leaderboard to add.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('remove')
		.setDescription('Remove a leaderboard from this guild.'))
	.addSubcommand(sc => sc
		.setName('list')
		.setDescription('Lists all leaderboards tracked in this guild.'));

export const perms = {
	'add': 'mods',
	'remove': 'mods',
	'list': 'all'
};

async function add(interaction: CommandInteraction) {

}

async function remove(interaction: CommandInteraction) {
	
}

async function list(interaction: CommandInteraction) {
	
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

	subcommands[interaction.options.getSubcommand()](interaction);
}