import { CommandInteraction } from "discord.js";
import { DB } from "../../../db";
import { Leaderboard, TrackedLeaderboard } from "../../../db/models";
import UserError from "../../UserError";

export async function remove(interaction: CommandInteraction) {
	await interaction.deferReply();

	const tlbRepo = DB.getRepository(TrackedLeaderboard);
	const lbRepo = DB.getRepository(Leaderboard);
	
	const lb_id = interaction.options.getInteger('leaderboard')!;

	const lbCrit = { where: { lb_id }, relations: { trackedLeaderboards: true } };
	const lb = await lbRepo.findOne(lbCrit);
	if(!lb) throw new UserError(`That leaderboard does not exist.`);

	const tlbCriteria = { where: { guild_id: interaction.guildId!, lb_id } }
	const tlb = await tlbRepo.findOne(tlbCriteria);
	if(!tlb) throw new UserError(`This guild does not track the given leaderboard.`);

	// delete the tracking
	await tlbRepo.delete(tlbCriteria.where);

	// if this was the only guild to track this leaderboard, delete the leaderboard entirely
	if(lb.trackedLeaderboards.length === 1) await lbRepo.delete(lbCrit.where);

	interaction.editReply(`Removed the leaderboard ${lb.lb_name}.`);
}