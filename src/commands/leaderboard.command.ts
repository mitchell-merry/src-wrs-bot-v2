import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { DB } from "../db";
import { Leaderboard } from "../db/models";
import * as SRC from '../speedruncom';

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

const link = /^(((https:\/\/|http:\/\/|)(www.|)|)speedrun.com\/|)\w{1,}(\/full_game(#\w{1,}|)|#\w{1,}|\/full_game|\/|)$/;

async function add(interaction: CommandInteraction) {
	const lRepo = DB.getRepository(Leaderboard);

	const gameOpt = interaction.options.getString('game');
	if(!gameOpt || !gameOpt.match(link))
	{
		interaction.reply(`Invalid game/link: ${gameOpt}.`);
		return;
	}

	let tokens = gameOpt.split('/').pop()!.split("#");
	const game = tokens[0];
	if(tokens.length === 1)
	{
		// Get category from menu
		const catData = await SRC.getGameCategories(game);

		if(SRC.isError(catData))
		{
			interaction.reply(catData.message);
			return;
		}

		const catNames = catData.map(cat => cat.name);
		interaction.reply(catNames.join(', '));
	}
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