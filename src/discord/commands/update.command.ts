import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { DB } from "../../db";
import { GuildEntity, TrackedLeaderboard } from "../../db/models";
import UserError from "../UserError";
import * as SRC from '../../speedruncom';
import { RunPlayerUser } from "src-ts";

export const data = new SlashCommandBuilder()
	.setName('update')
	.setDescription('Update the world record roles.');

export const perms = 'mods';

export const execute = async (interaction: CommandInteraction) => {
	interaction.deferReply();

	// check if guild is tracked
	if(!interaction.guild || !interaction.guildId) throw new Error('guild or guildId undefined.');
	const guildRepo = DB.getRepository(GuildEntity);
	const guildEnt = await guildRepo.findOne({ where: { guild_id: interaction.guildId }});
	if(!guildEnt) throw new UserError('Error: this guild is not being tracked!');

	// get all leaderboards tracked by guild
	const tlbRepo = DB.getRepository(TrackedLeaderboard);
	const tracked = await tlbRepo.find({
		where: { guild_id: interaction.guildId },
		relations: {
			leaderboard: { variables: true }
		}
	});
	
	// group leaderboards by role
	const roleLeaderboards: Record<string, TrackedLeaderboard[]> = {};
	tracked.forEach(tlb => {
		if(!roleLeaderboards[tlb.role_id]) roleLeaderboards[tlb.role_id] = [];
		roleLeaderboards[tlb.role_id].push(tlb);
	});
	
	// for every role (wait for all)
	await Promise.all(Object.entries(roleLeaderboards).map(async ([ roleId, tlbs ]) => {
		// fetch role
		let role = await interaction.guild!.roles.fetch(roleId);
		
		// TODO give the user the option of making a new role, attaching an existing role, removing the leaderboard, or ignoring altogether
		if(!role) throw new UserError(`ERROR: role no exist.`);

		// list of accounts to add the role to
		const accounts = [];
		await Promise.all(tlbs.map(async tlb => {

			// format variables
			const variables = Object.fromEntries(tlb.leaderboard.variables.map(variable => {
				return [ `var-${variable.variable_id}`, variable.value ]
			}));

			const lb = await SRC.getLeaderboard(tlb.leaderboard.game_id, tlb.leaderboard.category_id, { top: 1, ...variables });
			if(SRC.isError(lb)) throw new UserError(`Error updating ${tlb.leaderboard.lb_name}`);

			const srcPlayerIds = lb.runs.map(run => run.run.players.filter(p => p.rel === 'user').map(p => (p as RunPlayerUser).id)).flat();
			console.log(srcPlayerIds);
		}));
	}));
}