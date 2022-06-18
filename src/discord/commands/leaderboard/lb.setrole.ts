import { CommandInteraction, Role, User } from "discord.js";
import { DB } from "../../../db";
import { LeaderboardEntity, TrackedLeaderboardEntity } from "../../../db/models";
import UserError from "../../UserError";

export async function setrole(interaction: CommandInteraction) {
	await interaction.deferReply();
	
	const tlbRepo = DB.getRepository(TrackedLeaderboardEntity);
	const lbRepo = DB.getRepository(LeaderboardEntity);
	
	const lb_id = interaction.options.getInteger('leaderboard')!;
	const new_role = interaction.options.getRole('role') as Role;

	const lbCrit = { where: { lb_id }, relations: { trackedLeaderboards: true } };
	const lb = await lbRepo.findOne(lbCrit);
	if(!lb) throw new UserError(`That leaderboard does not exist.`);

	const tlbCriteria = { where: { guild_id: interaction.guildId!, lb_id } }
	const tlb = await tlbRepo.findOne(tlbCriteria);
	if(!tlb) throw new UserError(`This guild does not track the given leaderboard.`);

	if(new_role!.position > interaction.guild!.me!.roles.highest.position)
	{
		throw new UserError('Bot does not have permission to modify the specified role.');
	}

	tlb.role_id = new_role.id;
	await tlbRepo.save(tlb);
	interaction.editReply('Leaderboard updated. Run /update to reflect this change in role holders.');
}