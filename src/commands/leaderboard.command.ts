import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { Category, Game, Variable } from "src-ts";
import { DB } from "../db";
import { Leaderboard, Variable as VariableEntity } from "../db/models";
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

	const gameObj = await SRC.getGame(game, { embed: 'categories.variables,levels' });
	
	if(SRC.isError(gameObj)) {
		interaction.editReply(`Game ${game} does not exist.`);
		return;
	}

	let categoryObj: Category | undefined;

	// Category was provided.
	if(tokens.length > 1)
	{
		categoryObj = gameObj.categories!.data.find(cat => cat.weblink.split("#")[1] === tokens[1]);
		if(!categoryObj) {
			interaction.editReply(`Category ${tokens[1]} does not exist. Try without specifying the category.`);
			return;
		}
	}
	else
	{
		// Provide a menu to select from
		categoryObj = await selectCategory(interaction, gameObj);
	}

	const subcats = await selectVariables(interaction, categoryObj);
	const labels = subcats.map(([subcat, v]) => subcat.values.values[v].label);
	const lb_name = SRC.buildLeaderboardName(gameObj.names.international, categoryObj.name, labels);
	interaction.editReply({ content: `Added the leaderboard ${lb_name}.`, components: [] });
}

async function selectCategory(interaction: CommandInteraction, game: Game): Promise<Category> {
	// Get category from menu
	const catData = game.categories!.data;

	// Make category menu to get the category of the leaderboard
	const catNames = catData.map(cat => ({ value: cat.id, label: cat.name }));
	const menu = buildMenu(catNames, game.id);
	const [message, choiceInt] = await sendMenu(interaction, `Choose a category:`, [ menu ]);
	let categoryId = getResponse(choiceInt);
	const category = catData.find(c => c.id === categoryId)!;

	await interaction.editReply({ content: `Selected the category ${category.name} [${category.id}]`, components: [] });
	await message.delete();

	return category;
}

async function selectVariables(interaction: CommandInteraction, categoryObj: Category): Promise<[Variable, string][]> {
	return Promise.all(categoryObj.variables!.data.filter(v => v['is-subcategory']).map(async subcat => {
		const options = Object.entries(subcat.values.values)
			.map(([k, v]) => ({ value: k, label: v.label }));

		const menu = buildMenu(options, subcat.id);
		const [message, r] = await sendMenu(interaction,
			`Choose a value for the variable ${subcat.name}:`, [ menu ]);

		await message.delete();

		const value = getResponse(r);

		return [ subcat, value ];
	}));
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