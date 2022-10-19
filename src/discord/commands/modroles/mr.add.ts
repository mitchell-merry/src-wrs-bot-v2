import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { DB } from "../../../db";
import { ModeratorRoleEntity } from "../../../db/entities";
import UserError from "../../UserError";
import { Subcommand } from "../command";

const ModrolesAddCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('add')
		.setDescription('Add a moderator role.')
		.addRoleOption(o => o.setName('role').setDescription('The role.').setRequired(true)),
	perm: 'admin',
	execute: async (interaction, guildEnt) => {
		const roleOption = interaction.options.getRole('role', true);
	
		const has = guildEnt.moderatorRoles.find(mr => mr.role_id === roleOption.id);
		if(!!has) throw new UserError(`That role is already set as a moderator in this guild.`);
	
		const role = new ModeratorRoleEntity(interaction.guildId!, roleOption.id);
		await DB.getRepository(ModeratorRoleEntity).save(role);
		await interaction.reply(`Added moderator role <@&${roleOption.id}>.`);
	}
};

export default ModrolesAddCommand;