import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "./command";

const InviteCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite for this bot.'),
	perm: 'mods',
	execute: async (interaction) => {
		return interaction.reply({
			content: `https://discord.com/api/oauth2/authorize?client_id=${process.env.client}&permissions=268438528&scope=bot%20applications.commands`
		});
	}
}

export default InviteCommand;