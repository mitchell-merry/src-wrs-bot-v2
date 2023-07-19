import { SlashCommandSubcommandBuilder, ChannelType } from "discord.js";
import { DB } from "../../../db";
import { GuildEntity } from "../../../db/entities";
import { Subcommand } from "../command";

const SetLogChannelCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('above_role')
		.setDescription('The channel to post new world records in.')
		.addChannelOption(o => o.setName('log_channel').setDescription('The channel.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		const channel = interaction.options.getChannel('log_channel', true);

		if (channel.type !== ChannelType.GuildText) throw new Error('log_channel should be a text channel.');

		await DB.getRepository(GuildEntity).update(
			{ guild_id: guildEnt.guild_id },
			{ log_channel_id: channel.id }
		);
		
		await interaction.reply({ content: `log_channel set to <#&${channel.id}>.`, allowedMentions: { users: [], roles: [] } });
	}
};

export default SetLogChannelCommand;