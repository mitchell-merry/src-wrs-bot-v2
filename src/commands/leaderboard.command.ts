import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { DB } from "../db";
import { Leaderboard } from "../db/models";
import * as SRC from '../speedruncom';
import { buildMenu, getResponse, sendMenu } from "./util";

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
	let category: string;
	if(tokens.length === 1)
	{
		// Get category from menu
		const catData = await SRC.getGameCategories(game);

		if(SRC.isError(catData))
		{
			interaction.reply(catData.message);
			return;
		}

		// Make category menu to get the category of the leaderboard
		const catNames = catData.map(cat => ({ value: cat.id, label: cat.name }));
		const menu = buildMenu(catNames, game);
		const choiceInt = await sendMenu(interaction, `Choose a category:`, [ menu ]);
		category = getResponse(choiceInt);
		const catName = catNames.find(c => c.value === category)!.label;

		choiceInt.update({ content: `Selected the category ${catName} [${category}]`, components: [] });
	}
	else category = tokens[1];
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