import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { Subcommand } from "../command";

const SetListCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('list')
		.setDescription('Lists all settings for this guild.'),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		let msg = `The settings for this bot are:\n`;
	
		msg += `\`above_role\`: `;
		const roleDiscordObj = interaction.guild!.roles.cache.get(guildEnt.above_role_id);
		if(!roleDiscordObj || !guildEnt.above_role_id) msg += 'Not set! Will stick to bottom.\n';
		else msg += `${roleDiscordObj.name} [${guildEnt.above_role_id}]\n`;
	
		msg += `\`role_default_colour\`: ${guildEnt.role_default_colour}`;
	
		await interaction.reply({ content: msg, allowedMentions: { users: [], roles: [] } });
	}
};

export default SetListCommand;