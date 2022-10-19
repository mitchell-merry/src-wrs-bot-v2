import { AutocompleteInteraction } from "discord.js";
import { DB } from "../../db";
import { TrackedLeaderboardEntity } from "../../db/entities";

export const LeaderboardNameACL = async (interaction: AutocompleteInteraction) => {
	const tlbRepo = DB.getRepository(TrackedLeaderboardEntity);
	const val = interaction.options.getFocused(true).value as string;

	const boards = await tlbRepo.find({ where: { guild_id: interaction.guildId! }, relations: { leaderboard: true } });

	// TODO sort alphabetically
	const response = boards
		.filter(tlb => tlb.leaderboard.lb_name.toLowerCase().includes(val.toLowerCase()))
		.map(tlb => ({
			name: `${tlb.leaderboard.lb_name}`,
			value: tlb.leaderboard.lb_id
		}))
		.slice(0, 25);

	await interaction.respond(response);
}