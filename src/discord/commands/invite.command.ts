import { SlashCommandBuilder } from "discord.js";
import UserError from "../UserError";
import { Command } from "./command";

const InviteCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite for this bot.'),
	perm: 'mods',
	execute: (interaction) => {
		throw new UserError(`https://discord.com/api/oauth2/authorize?client_id=${process.env.client}&permissions=268438528&scope=bot%20applications.commands`);
	}
}

export default InviteCommand;