import { CommandInteraction, Role, SlashCommandSubcommandBuilder } from "discord.js";
import { DB } from "../../../db";
import { LeaderboardEntity, TrackedLeaderboardEntity } from "../../../db/entities";
import { LeaderboardNameACL } from "../../autocompleters/lbname.acl";
import UserError from "../../UserError";
import { Subcommand } from "../command";

const LeaderboardSetroleCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('setrole')
		.setDescription('Sets the role for the leaderboard.')
		.addIntegerOption(o => o.setName('leaderboard').setDescription('The leaderboard to change the role of.').setRequired(true).setAutocomplete(true))
		.addRoleOption(o => o.setName('role').setDescription('The role to change to.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction) => {
		await interaction.deferReply();
		
		const tlbRepo = DB.getRepository(TrackedLeaderboardEntity);
		const lbRepo = DB.getRepository(LeaderboardEntity);
		
		const lb_id = interaction.options.getInteger('leaderboard')!;
		const new_role = interaction.options.getRole('role') as Role;

		const lbCrit = { where: { lb_id }, relations: { trackedLeaderboards: true } };
		const lb = await lbRepo.findOne(lbCrit);
		if(!lb)
			throw new UserError(`That leaderboard does not exist.`);

		const tlbCriteria = { where: { guild_id: interaction.guildId!, lb_id } }
		const tlb = await tlbRepo.findOne(tlbCriteria);
		if(!tlb)
			throw new UserError(`This guild does not track the given leaderboard.`);

		if(new_role!.position > interaction.guild!.members.me!.roles.highest.position)
			throw new UserError('Bot does not have permission to modify the specified role.');

		tlb.role_id = new_role.id;
		await tlbRepo.save(tlb);
		await interaction.editReply({ content: `Leaderboard ${lb.lb_name} updated to be tracked with the role <@&${new_role.id}>. Run /update to reflect this change in role holders.`, allowedMentions: { users: [], roles: [] } });
	},
	autocomplete: LeaderboardNameACL
}

export default LeaderboardSetroleCommand;