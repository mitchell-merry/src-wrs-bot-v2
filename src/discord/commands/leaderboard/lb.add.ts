import { CommandInteraction } from "discord.js";
import * as SRC from "src-ts";

import { DB } from "../../../db";
import { GuildEntity, LeaderboardEntity, TrackedLeaderboardEntity, VariableEntity } from "../../../db/entities";
import ConfirmationMenu from "../../menus/ConfirmationMenu";
import DialogueMenu from "../../menus/DialogueMenu";
import UserError from "../../UserError";
import { buildMenu, getResponse, sendMenu } from "../../util";

const gameRegex = /^\w+$/;

export async function add(interaction: CommandInteraction) {
	const lRepo = DB.getRepository(LeaderboardEntity);
	const gRepo = DB.getRepository(GuildEntity);

	// get the guild entity
	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! } });
	if(!guildEnt) throw new Error(`Guild ${interaction.guildId} is not initialised`);

	// get game and validate it
	const gameOpt = interaction.options.getString('game');
	if(!gameOpt || !gameOpt.match(gameRegex)) throw new UserError(`Invalid game abbreviation: ${gameOpt}. You should use the 'day_seven' part of the game link 'https://www.speedrun.com/day_seven', for example.`);

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
	const gameObj = await SRC.getGame<'categories.variables,levels'>(gameOpt, { embed: 'categories.variables,levels' });

	// get leaderboard info from user
	// choose if levels
	const catType = await selectType(interaction);
	const level = catType === 'per-level' ? await selectLevel(interaction, gameObj.levels.data) : undefined;

	const category = await selectCategory(interaction, gameObj.categories.data, catType);
	const variables = await selectVariables(interaction, category, level);

	// build leaderboard name
	const labels = variables.map(([subcat, v]) => subcat.values.values[v].label);
	const lb_name = SRC.buildLeaderboardName(gameObj.names.international, category.name, labels, level?.name);

	// here we should check for dupes
	let board = await LeaderboardEntity.exists(gameObj.id, category.id, variables, level?.id);
	if(board && board.trackedLeaderboards.find(tlb => tlb.guild_id === interaction.guildId && tlb.lb_id === board!.lb_id))
	{
		throw new UserError(`This guild is already tracking the leaderboard ${lb_name}.`);
	}

	// confirm with the user that this is the action we want to take
	const message = roleOpt
		? `This will track the leaderboard ${lb_name} in this guild with the role <@&${roleOpt.id}>. Are you sure you wish to do this?`
		: guildEnt.above_role_id === ''
			? `This will track the leaderboard ${lb_name} in this guild with a new role. Are you sure you wish to do this?`
			: `This will track the leaderboard ${lb_name} in this guild with a new role, created above <@&${guildEnt.above_role_id}>. Are you sure you wish to do this?`;
	
	const confirmation = await new ConfirmationMenu(message).spawnMenu(interaction, "NEW_DELETE");
	if (confirmation === "NO") throw new UserError('Exited menu!');

	// @ts-ignore create role if one was not provided
	let role: Role | null = roleOpt;
	if(!roleOpt) {
		// @ts-ignore - role_default_colour is guaranteed to be a valid colour, probably.
		role = await interaction.guild!.roles.create({ name: lb_name, color: guildEnt.role_default_colour!, position });
	}

	// save new leaderboard in database
	if(!board) {
		board = new LeaderboardEntity(gameObj.id, category.id, lb_name, level?.id);
		board.variables = variables.map(([subcat, v]) => new VariableEntity(board!, subcat.id, v));	
		board.trackedLeaderboards = [];
	}
	board.trackedLeaderboards.push(new TrackedLeaderboardEntity(interaction.guildId!, board.lb_id, role!.id));
	await lRepo.save(board);

	interaction.editReply({ content: `Added the leaderboard ${lb_name}.`, components: [] });
}

async function selectType(interaction: CommandInteraction): Promise<SRC.CategoryType> {
	const types = [{
		id: 'per-game',
		label: "Full-game"
	}, { 
		id: 'per-level',
		label: "Level"
	}];

	const choice = (await
		new DialogueMenu(`Is the leaderboard a full-game or level category?`, types, "PRIMARY")
		.spawnMenu(interaction, "NEW_DELETE")) as SRC.CategoryType;

	await interaction.editReply({ content: `Selected "${types.find(t => t.id === choice)!.label}"...`, components: [] });

	return choice;
}

async function selectLevel(interaction: CommandInteraction, levels: SRC.Level[]): Promise<SRC.Level> {
	// Make level menu to get the level of the leaderboard
	const levelOptions = levels.map(level => ({ id: level.id, label: level.name }));
	const levelId = await new DialogueMenu(`Choose a level:`, levelOptions, "PRIMARY").spawnMenu(interaction, "NEW_DELETE");
	const level = levels.find(c => c.id === levelId)!;

	await interaction.editReply({ content: `Selected the level ${level.name} [${level.id}]`, components: [] });

	return level;
}

async function selectCategory(interaction: CommandInteraction, categories: SRC.Category<'variables'>[], type: SRC.CategoryType): Promise<SRC.Category<"variables">> {
	// Make category menu to get the category of the leaderboard
	const categoryOptions = categories.filter(cat => cat.type === type).map(cat => ({ id: cat.id, label: cat.name }));
	const categoryId = await new DialogueMenu(`Choose a category:`, categoryOptions, "PRIMARY").spawnMenu(interaction, "NEW_DELETE");
	const category = categories.find(c => c.id === categoryId)!;

	await interaction.editReply({ content: `Selected the category ${category.name} [${category.id}]`, components: [] });

	return category;
}

async function selectVariables(interaction: CommandInteraction, variables: SRC.Variable[], level?: SRC.Level): Promise<[SRC.Variable, string][]> {
	
	return Promise.all(variables.filter(SRC.variableIsSubcategory)
		.filter(v => level === undefined 
			|| v.scope.type === 'all-levels'
			|| (v.scope.type === 'single-level' && v.scope.level === level.id)
		).map(async subcat => {
			const options = Object.entries(subcat.values.values)
				.map(([k, v]) => ({ id: k, label: v.label }));

			const value = await new DialogueMenu(`Choose a value for the variable ${subcat.name}:`, options, "PRIMARY").spawnMenu(interaction, "NEW_DELETE");
			return [ subcat, value ];
		})
	);
}