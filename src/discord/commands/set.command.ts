import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction, HexColorString } from "discord.js";
import { DB } from "../../db";
import { GuildEntity } from "../../db/entities";
import UserError from "../UserError";
import { CommandWithSubcommands, Subcommand } from "./Command";

const SetAboveRoleCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('above_role')
		.setDescription('The role that new roles get created above.')
		.addRoleOption(o => o.setName('above_role').setDescription('The role.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		const gRepo = DB.getRepository(GuildEntity);
		
		const role = interaction.options.getRole('above_role');
		if(!role) throw new Error('/set above_role: role not set / is undefined.');
		
		guildEnt.above_role_id = role.id;
		await gRepo.save(guildEnt);
		await interaction.reply({ content: `above_role set to <@&${role.id}>.`, allowedMentions: { users: [], roles: [] } });
	}
};

const SetRoleDefaultColourCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('role_default_colour')
		.setDescription('The default colour of new roles created by the bot. Should be a hexcode, e.g. #FEE75C.')
		.addStringOption(o => o.setName('role_default_colour').setDescription('The colour.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		const gRepo = DB.getRepository(GuildEntity);
		
		const colour = interaction.options.getString('role_default_colour');
		if(!colour) throw new Error('/set role_default_colour: role_default_colour not set / is undefined.');
		if(!colour.match(/^#[0-9A-Fa-f]{6}$/)) throw new UserError('Colour must be a hexcode, e.g. #FEE75C.');
	
		guildEnt.role_default_colour = colour as HexColorString;
		await gRepo.save(guildEnt);
		await interaction.reply(`role_default_colour set to ${colour}.`);
	}
};

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
	
		interaction.reply({ content: msg, allowedMentions: { users: [], roles: [] } });
	}
}

const SetCommand: CommandWithSubcommands = {
	data: new SlashCommandBuilder().setName('set')
		.setDescription('Set server settings. Requires moderator permissions.'),
	subcommands: [ SetAboveRoleCommand, SetRoleDefaultColourCommand, SetListCommand ],
};

export default SetCommand;