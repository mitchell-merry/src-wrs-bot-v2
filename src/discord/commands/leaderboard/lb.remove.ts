import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction, User } from "discord.js";
import { DB } from "../../../db";
import { LeaderboardEntity, TrackedLeaderboardEntity } from "../../../db/entities";
import { LeaderboardNameACL } from "../../autocompleters/lbname.acl";
import ConfirmationMenu from "../../menus/ConfirmationMenu";
import UserError from "../../UserError";
import { Subcommand } from "../Command";

const LeaderboardRemoveCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('remove')
		.setDescription('Remove a leaderboard from this guild.')
		.addIntegerOption(o => o.setName('leaderboard').setDescription('The leaderboard to remove.').setRequired(true).setAutocomplete(true))
		.addBooleanOption(o => o.setName('delete_role').setDescription('Delete the associated role.')),
	perm: 'mods',
	execute: async (interaction) => {
		await interaction.deferReply();

		const tlbRepo = DB.getRepository(TrackedLeaderboardEntity);
		const lbRepo = DB.getRepository(LeaderboardEntity);
		
		const lb_id = interaction.options.getInteger('leaderboard')!;
		const delete_role = interaction.options.getBoolean('delete_role');

		const lbCrit = { where: { lb_id }, relations: { trackedLeaderboards: true } };
		const lb = await lbRepo.findOne(lbCrit);
		if(!lb) throw new UserError(`That leaderboard does not exist.`);

		const tlbCriteria = { where: { guild_id: interaction.guildId!, lb_id }, relations: { leaderboard: true } };
		const tlb = await tlbRepo.findOne(tlbCriteria);
		if(!tlb) throw new UserError(`This guild does not track the given leaderboard.`);

		const message = delete_role
			? `This will remove tracking for the leaderboard ${tlb.leaderboard.lb_name} in this guild, and delete the associated role <@&${tlb.role_id}>. Are you sure you want to do this?`
			: `This will remove tracking for the leaderboard ${tlb.leaderboard.lb_name} in this guild, and keep the associated role <@&${tlb.role_id}>. Are you sure you want to do this?`;
		
		const [ confirm ] = await new ConfirmationMenu(message).spawnMenu(interaction, "EDIT_REPLY");
		if (confirm === "NO") throw new UserError("Exiting menu.");

		if(delete_role) {
			const boardsWithRole = await tlbRepo.find({ where: { role_id: tlb.role_id } });
			if(boardsWithRole.length > 1) throw new UserError(`Error: More than one leaderboard use the role for this board.`);
			await interaction.guild!.roles.delete(tlb.role_id);
		}

		// delete the tracking
		await tlbRepo.delete(tlbCriteria.where);

		// if this was the only guild to track this leaderboard, delete the leaderboard entirely
		if(lb.trackedLeaderboards.length === 1) await lbRepo.delete(lbCrit.where);

		interaction.editReply(`Removed the leaderboard ${lb.lb_name}.`);
	},
	autocomplete: LeaderboardNameACL
}

export default LeaderboardRemoveCommand;