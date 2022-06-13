import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('invite')
	.setDescription('Get the invite for this bot.');

export const perms = 'mods';

export const execute = async (interaction: CommandInteraction) => {        
	interaction.reply({ content: `https://discord.com/api/oauth2/authorize?client_id=${process.env.client}&permissions=268438528&scope=bot%20applications.commands` });
}