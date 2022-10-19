import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { HexColorString } from "discord.js";
import { DB } from "../../../db";
import { GuildEntity } from "../../../db/entities";
import UserError from "../../UserError";
import { Subcommand } from "../command";

const SetRoleDefaultColourCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('role_default_colour')
		.setDescription('The default colour of new roles created by the bot. Should be a hexcode, e.g. #FEE75C.')
		.addStringOption(o => o.setName('role_default_colour').setDescription('The colour.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		const colour = interaction.options.getString('role_default_colour');
		if(!colour) throw new Error('/set role_default_colour: role_default_colour not set / is undefined.');
		if(!colour.match(/^#[0-9A-Fa-f]{6}$/)) throw new UserError('Colour must be a hexcode, e.g. #FEE75C.');
	
		guildEnt.role_default_colour = colour as HexColorString;
		await DB.getRepository(GuildEntity).save(guildEnt);
		await interaction.reply(`role_default_colour set to ${colour}.`);
	}
};

export default SetRoleDefaultColourCommand;