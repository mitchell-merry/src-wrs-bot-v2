import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, HexColorString } from "discord.js";
import { DB } from "../../db";
import { GuildEntity } from "../../db/entities";
import UserError from "../UserError";

export const data = new SlashCommandBuilder()
	.setName('set')
	.setDescription('Set server settings. Requires moderator permissions.')
	.addSubcommand(sc => sc
		.setName('above_role')
		.setDescription('The role that new roles get created above.')
		.addRoleOption(o => o.setName('above_role').setDescription('The role.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('role_default_colour')
		.setDescription('The default colour of new roles created by the bot. Should be a hexcode, e.g. #FEE75C.')
		.addStringOption(o => o.setName('role_default_colour').setDescription('The colour.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('list')
		.setDescription('Lists all settings for this guild.'));

export const perms = 'mod';

async function above_role(interaction: CommandInteraction, guildEnt: GuildEntity) {
	const gRepo = DB.getRepository(GuildEntity);
	
	const role = interaction.options.getRole('above_role');
	if(!role) throw new Error('/set above_role: role not set / is undefined.');
	
	guildEnt.above_role_id = role.id;
	await gRepo.save(guildEnt);
	await interaction.reply(`above_role set to ${role.name} [${role.id}].`);
}

async function role_default_colour(interaction: CommandInteraction, guildEnt: GuildEntity) {
	const gRepo = DB.getRepository(GuildEntity);
	
	const colour = interaction.options.getString('role_default_colour');
	if(!colour) throw new Error('/set role_default_colour: role_default_colour not set / is undefined.');
	if(!colour.match(/^#[0-9A-Fa-f]{6}$/)) throw new UserError('Colour must be a hexcode, e.g. #FEE75C.');

	guildEnt.role_default_colour = colour as HexColorString;
	await gRepo.save(guildEnt);
	await interaction.reply(`role_default_colour set to ${colour}.`);
}

async function list(interaction: CommandInteraction, guildEnt: GuildEntity) {
	let msg = `The settings for this bot are:\n`;

	msg += `\`above_role\`: `;
	const roleDiscordObj = interaction.guild!.roles.cache.get(guildEnt.above_role_id);
	if(!roleDiscordObj || !guildEnt.above_role_id) msg += 'Not set! Will stick to bottom.\n';
	else msg += `${roleDiscordObj.name} [${guildEnt.above_role_id}]\n`;

	msg += `\`role_default_colour\`: ${guildEnt.role_default_colour}`;

	interaction.reply(msg);
}

const subcommands: Record<string, (interaction: CommandInteraction, guildEnt: GuildEntity) => Promise<void>> = { 
	'above_role': above_role, 
	'role_default_colour': role_default_colour, 
	'list': list,
};

export const execute = async (interaction: CommandInteraction) => {        
	if(!subcommands[interaction.options.getSubcommand()]) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);

	if(!interaction.guildId) throw new Error("Invalid guild id...");
	const gRepo = DB.getRepository(GuildEntity);
	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId } });
	
	if(!guildEnt) throw new Error("Guild is not set...?");

	await subcommands[interaction.options.getSubcommand()](interaction, guildEnt);
}