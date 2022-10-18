import { CommandInteraction, Role } from "discord.js";
import * as SRC from "src-ts";

import { DB } from "../../../db";
import { GuildEntity, LeaderboardEntity, TrackedLeaderboardEntity, VariableEntity } from "../../../db/entities";
import ConfirmationMenu from "../../menus/ConfirmationMenu";
import LeaderboardMenu from "../../menus/LeaderboardMenu";
import UserError from "../../UserError";

const gameRegex = /^\w+$/;

export async function add(interaction: CommandInteraction) {
	await interaction.deferReply();

	const lRepo = DB.getRepository(LeaderboardEntity);
	const gRepo = DB.getRepository(GuildEntity);

	// get the guild entity
	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! } });
	if(!guildEnt) throw new Error(`Guild ${interaction.guildId} is not initialised`);

	// get game and validate it
	const gameOpt = interaction.options.getString('game');
	if(!gameOpt || !gameOpt.match(gameRegex)) throw new UserError(`Invalid game abbreviation: ${gameOpt}. You should use the 'day_seven' part of the game link 'https://www.speedrun.com/day_seven', for example.`);

	// check if we have permissions to manage the role  
	const roleOpt = interaction.options.getRole('role');
	let position = 1;
	let errorRoleName = '';
	if(!roleOpt) {	// if no role was provided, we want to make a new role
		const above_role = await interaction.guild!.roles.fetch(guildEnt.above_role_id);
		if(above_role)
		{
			position = above_role.position + 1;
			errorRoleName = above_role.name;
		}
	} else {
		position = roleOpt.position;
		errorRoleName = roleOpt.name;
	}

	// check we have permission to create/manage a role at this permission
	if(interaction.guild!.me!.roles.highest.position < position) {
		throw new UserError(`Bot does not have permission to create/manage a role at this position. Give the bot a role higher than \`@${errorRoleName}\` [${interaction.guild!.me!.roles.highest.position}, ${position}].`);
	}

	const { game, category, variables, level } = await new LeaderboardMenu().spawnMenu(interaction, gameOpt)

	// build leaderboard name
	const labels = variables.map(([subcat, v]) => subcat.values.values[v].label);
	const lb_name = SRC.buildLeaderboardName(game.names.international, category.name, labels, level?.name);

	// here we should check for dupes
	let board = await LeaderboardEntity.exists(game.id, category.id, variables, level?.id);
	const exists = board && board.trackedLeaderboards.find(tlb => tlb.guild_id === interaction.guildId);
	if(exists) throw new UserError(`This guild is already tracking the leaderboard ${lb_name}.`);

	// confirm with the user that this is the action we want to take
	const message = roleOpt
		? `This will track the leaderboard ${lb_name} in this guild with the role <@&${roleOpt.id}>. Are you sure you wish to do this?`
		: guildEnt.above_role_id === ''
			? `This will track the leaderboard ${lb_name} in this guild with a new role. Are you sure you wish to do this?`
			: `This will track the leaderboard ${lb_name} in this guild with a new role, created above <@&${guildEnt.above_role_id}>. Are you sure you wish to do this?`;
	
	const [ confirmation ] = await new ConfirmationMenu(message).spawnMenu(interaction, "EDIT_REPLY");
	if (confirmation === "NO") throw new UserError('Exited menu!');

	let role: Role;
	if (roleOpt) role = roleOpt as Role;
	else role = await interaction.guild!.roles.create({ name: lb_name, color: guildEnt.role_default_colour, position });

	// save new leaderboard in database
	if(!board) {
		board = new LeaderboardEntity(game.id, category.id, lb_name, level?.id);
		board.variables = variables.map(([subcat, v]) => new VariableEntity(board!, subcat.id, v));	
		board.trackedLeaderboards = [];
	}
	board.trackedLeaderboards.push(new TrackedLeaderboardEntity(interaction.guildId!, board.lb_id, role!.id));
	await lRepo.save(board);

	interaction.editReply({ content: `Added the leaderboard ${lb_name}.`, components: [] });
}