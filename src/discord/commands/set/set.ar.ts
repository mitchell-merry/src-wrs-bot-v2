import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { DB } from "../../../db";
import { GuildEntity } from "../../../db/entities";
import { Subcommand } from "../command";

const SetAboveRoleCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('above_role')
		.setDescription('The role that new roles get created above.')
		.addRoleOption(o => o.setName('above_role').setDescription('The role.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		const role = interaction.options.getRole('above_role');
		if(!role) throw new Error('/set above_role: role not set / is undefined.');
		
		guildEnt.above_role_id = role.id;
		await DB.getRepository(GuildEntity).save(guildEnt);
		await interaction.reply({ content: `above_role set to <@&${role.id}>.`, allowedMentions: { users: [], roles: [] } });
	}
};

export default SetAboveRoleCommand;