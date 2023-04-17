import { SlashCommandBuilder } from "discord.js";
import * as SRC from "src-ts";
import { DB } from "../../db";

import { PlayerEntity, TrackedLeaderboardEntity } from "../../db/entities";
import UserError from "../UserError";
import { Command } from "./command";

const UpdateCommand: Command = {
	data: new SlashCommandBuilder().setName('update').setDescription('Update the world record roles.'),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		await interaction.deferReply();

		const updateLog = (s: string) => console.log(`[${interaction.guildId}] [/update] ${s}`);
		updateLog(`Update run by ${interaction.user.tag}, fetching all members in guild...`);
		await interaction.guild!.members.fetch();
		updateLog('Members fetched.');

		// group leaderboards by role
		const roleLeaderboards: Record<string, TrackedLeaderboardEntity[]> = {};
		guildEnt.trackedLeaderboards.forEach(tlb => {
			if(!roleLeaderboards[tlb.role_id]) roleLeaderboards[tlb.role_id] = [];
			roleLeaderboards[tlb.role_id].push(tlb);
		});
		
		// for every role (wait for all)
		await Promise.all(Object.entries(roleLeaderboards).map(async ([ roleId, tlbs ]) => {
			// fetch role
			let role = await interaction.guild!.roles.fetch(roleId, { cache: false });
			
			// TODO give the user the option of making a new role, attaching an existing role, removing the leaderboard, or ignoring altogether
			if(!role) throw new UserError(`ERROR: role no exist.`);

			const roleLog = (s: string) => updateLog(`[${roleId}] ${s}`);
			roleLog(`Updating @${role.name}`);
			roleLog(`Member(s) with role: ${Array.from(role.members).map(([id, m]) => `${m.user.tag} (${id})`).join(', ')}`);

			// list of accounts to add the role to
			let accounts: string[] = [];
			await Promise.all(tlbs.map(async tlb => {
				const lblog = (s: string) => roleLog(`:: [${tlb.leaderboard.lb_name}] ${s}`);

				// get all sr.c player ids
				const partial: SRC.LeaderboardPartial = {
					game: tlb.leaderboard.game_id,
					category: tlb.leaderboard.category_id,
					level: tlb.leaderboard.level_id,
					variables: Object.fromEntries(tlb.leaderboard.variables.map(variable => [ variable.variable_id, variable.value ]))
				};

				const lb = await SRC.getLeaderboardFromPartial(partial, { top: 1 }, { cache: false }).catch(() => { throw new Error(`Error updating ${tlb.leaderboard.lb_name}`) });

				// guests are ignored
				const srcPlayerIds = lb.runs.map(run => run.run.players.filter(SRC.playerIsUser).map(p => p.id)).flat();
				lblog(`Found WR holder(s) (sr.c): ${srcPlayerIds.join(', ')}`);

				const discPlayerIDs = srcPlayerIds
					.map(id => guildEnt.players.find(p => p.player_id === id))
					.filter((p): p is PlayerEntity => !!p)
					.map(p => p.discord_id);
				
				lblog(`Found WR holder(s) (discord): ${discPlayerIDs.join(', ')}`);
				
				discPlayerIDs.forEach(id => {
					if(!accounts.includes(id)) accounts.push(id);
				});
			}));

			roleLog(`Account(s) should be (discord): ${accounts.join(', ')}`);

			// remove role from accounts that shouldn't have the role, and remove those that already have the role from the accounts list
			await Promise.all(role.members.map(async member => {
				if(accounts.includes(member.id)) accounts = accounts.filter(a => a !== member.id);
				else
				{
					roleLog(`Removing role from ${member.user.tag}...`);
					await member.roles.remove(role!);
				}
			}));

			// add roles to users
			await Promise.all(accounts.map(async a => {
				const user = interaction.guild!.members.cache.get(a);
				if (!user)
				{
					roleLog(`Account ${a} not in the server, removing association!`);
					await DB.getRepository(PlayerEntity).delete({ discord_id: a, guild_id: guildEnt.guild_id });
					return;
				}

				roleLog(`Adding role to ${user.user.tag}...`);
				await user.roles.add(role!);
			}));
			
			roleLog(`Finished @${role.name}!`);
		}));

		updateLog(`Finished updating!`);
		await interaction.editReply('Done updating.');
	}
};

export default UpdateCommand;