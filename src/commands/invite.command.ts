import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('invite')
	.setDescription('Get the invite for this bot.');

export const execute = async (interaction: CommandInteraction) => {        
	if(interaction.user.id == process.env.admin) {
		interaction.editReply({ content: `https://discord.com/api/oauth2/authorize?client_id=${process.env.client}&permissions=268438528&scope=bot%20applications.commands` });
	} else {
		interaction.editReply({ content: 'You must be the admin of this bot to get the invite. Bad! Bad boy.' });
		console.log(`User [${interaction.user.id}] tried to /invite (admin id: [${process.env.admin}])`);
	}
}