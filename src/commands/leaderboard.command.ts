import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { DB } from "../db";
import { Leaderboard, Variable } from "../db/models";
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

	await interaction.deferReply();

	let tokens = gameOpt.split('/').pop()!.split("#");
	const game = tokens[0];
	let categoryId: string;
	if(tokens.length > 1) categoryId = tokens[1];
	else
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
		const [message, choiceInt] = await sendMenu(interaction, `Choose a category:`, [ menu ]);
		categoryId = getResponse(choiceInt);
		const catName = catNames.find(c => c.value === categoryId)!.label;

		interaction.editReply({ content: `Selected the category ${catName} [${categoryId}]`, components: [] });
		message.delete();
	}

	const variables = await SRC.getCategoryVariables(categoryId);

	if(SRC.isError(variables))
	{
		interaction.reply(variables.message);
		return;
	}

	const proms = variables.filter(v => v['is-subcategory']).map(async subcat => {
		const options = Object.entries(subcat.values.values)
			.map(([k, v]) => ({ value: k, label: v.label }));

		const menu = buildMenu(options, subcat.id);
		const [message, r] = await sendMenu(interaction,
			`Choose a value for the variable ${subcat.name}:`, [ menu ]);

		await message.delete();

		const value = getResponse(r);

		return { variable_id: subcat.id, value, valueLabel: subcat.values.values[value].label };
	});

	const results = await Promise.all(proms);
	const lb_name = SRC.buildLeaderboardName(game, categoryId, results.map(v => v.valueLabel));
	interaction.editReply({ content: `Added the leaderboard ${lb_name}.`, components: [] });
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