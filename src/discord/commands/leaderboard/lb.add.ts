import { CommandInteraction } from "discord.js";
import { DB } from "../../../db";
import { GuildEntity, Leaderboard, TrackedLeaderboard, Variable as VariableEntity } from "../../../db/models";
import UserError from "../../UserError";
import * as SRC from '../../../speedruncom';
import { buildMenu, getResponse, sendMenu } from "../../util";
import { Category, Game, Variable } from "src-ts";

const gameRegex = /^\w+$/;

export async function add(interaction: CommandInteraction) {
	const lRepo = DB.getRepository(Leaderboard);
	const gRepo = DB.getRepository(GuildEntity);

	// get the guild entity
	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! } });
	if(!guildEnt) throw new Error(`Guild ${interaction.guildId} is not initialised`);

	// get game and validate it
	const gameOpt = interaction.options.getString('game');
	if(!gameOpt || !gameOpt.match(gameRegex)) throw new UserError(`Invalid game/link: ${gameOpt}.`);

	const roleOpt = interaction.options.getRole('role');
	let position = 1;
	let errorRoleName: string = '';
	if(!roleOpt) {	// "make new role"
		// get position of new role
		if(guildEnt.above_role_id && guildEnt.above_role_id !== '')
		{
			const above_role = await interaction.guild!.roles.fetch(guildEnt.above_role_id);
			if(above_role)
			{
				position = above_role.position + 1;
				errorRoleName = above_role.name;
			}
		}
	} else {
		position = roleOpt.position;
		errorRoleName = roleOpt.name;
	}

	// check we have permission to create/manage a role at this permission
	if(position != 1 && interaction.guild!.me!.roles.highest.position < position) {
		throw new UserError(`Bot does not have permission to create/manage a role at this position. Give the bot a role higher than \`@${errorRoleName}\` [${interaction.guild!.me!.roles.highest.position}, ${position}].`);
	}

	await interaction.deferReply();

	// get game object from speedrun.com
	const gameObj = await SRC.getGame(gameOpt, { embed: 'categories.variables,levels' });
	if(SRC.isError(gameObj)) throw new Error(`Game ${gameOpt} does not exist.`);

	// get leaderboard info from user
	const category = await selectCategory(interaction, gameObj);
	const variables = await selectVariables(interaction, category);

	// build leaderboard name
	const labels = variables.map(([subcat, v]) => subcat.values.values[v].label);
	const lb_name = SRC.buildLeaderboardName(gameObj.names.international, category.name, labels);

	// here we should check for dupes
	let board = await Leaderboard.exists(gameObj.id, category.id, variables);
	if(board && board.trackedLeaderboards.find(tlb => tlb.guild_id === interaction.guildId && tlb.lb_id === board!.lb_id))
	{
		throw new UserError(`This guild is already tracking the leaderboard ${lb_name}.`);
	}

	// @ts-ignore create role if one was not provided
	let role: Role | null = roleOpt;
	if(!roleOpt) {
		// @ts-ignore - role_default_colour is guaranteed to be a valid colour, probably.
		role = await interaction.guild!.roles.create({ name: lb_name, color: guildEnt.role_default_colour!, position });
	}

	// save new leaderboard in database
	if(!board) {
		board = new Leaderboard(gameObj.id, category.id, lb_name);
		board.variables = variables.map(([subcat, v]) => new VariableEntity(board!, subcat.id, v));	
		board.trackedLeaderboards = [];
	}
	board.trackedLeaderboards.push(new TrackedLeaderboard(interaction.guildId!, board.lb_id, role!.id));
	await lRepo.save(board);

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