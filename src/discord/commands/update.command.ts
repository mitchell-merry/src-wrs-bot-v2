import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('update')
	.setDescription('Update the world record roles.');

export const perms = 'mods';

export const execute = async (interaction: CommandInteraction) => {        
	interaction.deferReply();
}