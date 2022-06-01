import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Manage the leaderboards for this guild.');

export const perms = {
	'add': 'mods',
	'remove': 'mods',
	'list': 'all'
};

export const execute = async (interaction: CommandInteraction) => {        

}