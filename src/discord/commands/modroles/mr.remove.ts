import { SlashCommandSubcommandBuilder } from "discord.js";
import { DB } from "../../../db";
import { ModeratorRoleEntity } from "../../../db/entities";
import UserError from "../../UserError";
import { Subcommand } from "../command";

const ModrolesRemoveCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('remove')
		.setDescription('Remove a moderator role.')
		.addRoleOption(o => o.setName('role').setDescription('The role.').setRequired(true)),
	perm: 'admin',
	execute: async (interaction, guildEnt) => {
		const roleOption = interaction.options.getRole('role', true);
	
		const role = guildEnt.moderatorRoles.find(mr => mr.role_id === roleOption.id);
		if(!role)
			throw new UserError(`That role is not set as a moderator in this guild.`);
	
		await DB.getRepository(ModeratorRoleEntity).remove(role);
		await interaction.reply(`Removed moderator role '${roleOption.name}'.`);
	}
}

export default ModrolesRemoveCommand;