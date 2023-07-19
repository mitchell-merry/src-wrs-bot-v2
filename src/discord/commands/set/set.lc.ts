import { SlashCommandSubcommandBuilder, ChannelType } from "discord.js";
import { DB } from "../../../db";
import { GuildEntity } from "../../../db/entities";
import { Subcommand } from "../command";

const SetLogChannelCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('wr_channel')
		.setDescription('The channel to post new world records in.')
		.addChannelOption(o => o.setName('wr_channel').setDescription('The channel.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		const channel = interaction.options.getChannel('wr_channel', true);

		if (channel.type !== ChannelType.GuildText) throw new Error('wr_channel should be a text channel.');

		await DB.getRepository(GuildEntity).update(
			{ guild_id: guildEnt.guild_id },
			{ log_channel_id: channel.id }
		);
		
		await interaction.reply({ content: `wr_channel set to <#${channel.id}>.`, allowedMentions: { users: [], roles: [] } });
	}
};

export default SetLogChannelCommand;