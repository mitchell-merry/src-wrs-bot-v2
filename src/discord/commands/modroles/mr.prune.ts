import { SlashCommandSubcommandBuilder } from "discord.js";
import { DB } from "../../../db";
import { ModeratorRoleEntity } from "../../../db/entities";
import UserError from "../../UserError";
import { Subcommand } from "../command";

const ModrolesPruneCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('prune')
		.setDescription('Removes all deleted (stale) roles from the modrole list.'),
	perm: 'admin',
	execute: async (interaction, guildEnt) => {
		await interaction.deferReply();
		await interaction.guild!.roles.fetch();

		const deletedRoles = guildEnt.moderatorRoles.filter(role => !interaction.guild!.roles.cache.get(role.role_id));

		if (deletedRoles.length === 0)
			throw new UserError('This guild has no stale moderator roles.');
		
		await DB.getRepository(ModeratorRoleEntity).remove(deletedRoles);
		await interaction.editReply(`Pruned ${deletedRoles.length} stale roles. Thank you for shopping at Woolies.`);
	}
}

export default ModrolesPruneCommand;