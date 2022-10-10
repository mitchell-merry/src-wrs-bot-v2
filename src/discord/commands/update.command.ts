import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import * as SRC from "src-ts";

import { DB } from "../../db";
import { GuildEntity, PlayerEntity, TrackedLeaderboardEntity } from "../../db/models";
import UserError from "../UserError";

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
	const tlbRepo = DB.getRepository(TrackedLeaderboardEntity);
	const tracked = await tlbRepo.find({
		where: { guild_id: interaction.guildId },
		relations: {
			leaderboard: { variables: true }
		}
	});
	
	// group leaderboards by role
	const roleLeaderboards: Record<string, TrackedLeaderboardEntity[]> = {};
	tracked.forEach(tlb => {
		if(!roleLeaderboards[tlb.role_id]) roleLeaderboards[tlb.role_id] = [];
		roleLeaderboards[tlb.role_id].push(tlb);
	});
	
	// for every role (wait for all)
	const pRepo = DB.getRepository(PlayerEntity);
	await Promise.all(Object.entries(roleLeaderboards).map(async ([ roleId, tlbs ]) => {
		// fetch role
		let role = await interaction.guild!.roles.fetch(roleId);
		
		// TODO give the user the option of making a new role, attaching an existing role, removing the leaderboard, or ignoring altogether
		if(!role) throw new UserError(`ERROR: role no exist.`);
		console.log(`[${roleId}] Updating @${role.name}`);

		// list of accounts to add the role to
		let accounts: string[] = [];
		await Promise.all(tlbs.map(async tlb => {
			// get all sr.c player ids
			const partial: SRC.LeaderboardPartial = {
				game: tlb.leaderboard.game_id,
				category: tlb.leaderboard.category_id,
				level: tlb.leaderboard.level_id,
				variables: Object.fromEntries(tlb.leaderboard.variables.map(variable => [ variable.variable_id, variable.value ]))
			};

			const lb = await SRC.getLeaderboardFromPartial(partial, { top: 1 }).catch(() => { throw new Error(`Error updating ${tlb.leaderboard.lb_name}`) });

			// guests are ignored
			const srcPlayerIds = lb.runs.map(run => run.run.players.filter(SRC.playerIsUser).map(p => p.id)).flat();
			
			const discPlayerIDs = (await Promise.all(srcPlayerIds.map(async id => 
				await pRepo.findOne({ where: { player_id: id }})
			))).filter((p): p is PlayerEntity => p !== null).map(p => p.discord_id);
			
			discPlayerIDs.forEach(id => {
				if(!accounts.includes(id)) accounts.push(id);
			});
		}));

		// remove role from accounts that shouldn't have the role, and remove those that already have the role from the accounts list
		await Promise.all(role.members.map(async member => {
			if(accounts.includes(member.id)) accounts = accounts.filter(a => a !== member.id);
			else await member.roles.remove(role!);
		}));

		await Promise.all(accounts.map(async a => {
			const user = await interaction.guild!.members.fetch(a);
			await user.roles.add(role!);
		}));
		
		console.log(`[${roleId}] Finished @${role.name}`);
	}));

	interaction.editReply('Done updating.');
}