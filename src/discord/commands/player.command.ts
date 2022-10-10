import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, User } from "discord.js";
import * as SRC from "src-ts";

import { DB } from "../../db";
import { PlayerEntity } from "../../db/entities";
import UserError from "../UserError";

export const data = new SlashCommandBuilder()
	.setName('player')
	.setDescription('Manager player associations between discord and speedrun.com.')
	.addSubcommand(sc => sc
		.setName('add')
		.setDescription('Add a player association.')
		.addUserOption(o => o.setName('user').setDescription('The discord account.').setRequired(true))
		.addStringOption(o => o.setName('src_account').setDescription('The speedrun.com username.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('remove')
		.setDescription('Remove a player association.')
		.addUserOption(o => o.setName('user').setDescription('The discord account.').setRequired(true)))
	.addSubcommand(sc => sc
		.setName('list')
		.setDescription('Lists all player associations in this guild.'));

export const perms = {
	'add': 'mod',
	'remove': 'mod',
	'list': 'all'
};

async function add(interaction: CommandInteraction) {
	const pRepo = DB.getRepository(PlayerEntity);

	const userOpt = interaction.options.getUser('user');
	const srcOpt = interaction.options.getString('src_account');

	if(!srcOpt || !userOpt) throw new UserError('src_account and user must be set.');

	let exists = await pRepo.findOne({ where: { discord_id: userOpt.id } });

	if(exists) throw new UserError(`This discord account is already associated with a speedrun.com account. [${exists.player_id}]`);

	const player = await SRC.getUser(srcOpt);

	if(SRC.isError(player)) throw new UserError(`The given speedrun.com account '${srcOpt}' could not be found.`);

	exists = await pRepo.findOne({ where: { player_id: player.id } });

	if(exists) throw new UserError(`This speedrun.com account is already associated with a discord account. [${exists.discord_id}]`);

	const playerEnt = new PlayerEntity(player.id, userOpt.id);
	playerEnt.src_name = player.names.international;
	await pRepo.save(playerEnt);
	interaction.reply(`Added association for ${userOpt.username} to the speedrun.com account ${player.names.international} [${player.id}]`);
}

async function remove(interaction: CommandInteraction) {
	const pRepo = DB.getRepository(PlayerEntity);

	const userOpt = interaction.options.getUser('user');
	if(!userOpt) throw new UserError('The option user must be set.');

	let exists = await pRepo.findOne({ where: { discord_id: userOpt.id } });
	if(!exists) throw new UserError(`This discord account is not associated with a speedrun.com account.`);

	await pRepo.remove(exists);
	interaction.reply(`Association for ${userOpt.username} [${userOpt.id}] removed!`)
}

async function list(interaction: CommandInteraction) {
	const pRepo = DB.getRepository(PlayerEntity);

	let msg = `The users with an association in this discord are:\n\`\`\`\n`;
	
	let count = 0;

	await interaction.guild!.members.fetch();
	const proms = interaction.guild!.members.cache.map(async member => {
		const playerEnt = await pRepo.findOne({ where: { discord_id: member.id } });
		if(!playerEnt) return '';
		
		count++;
		return `${member.displayName} - ${playerEnt.src_name} [${playerEnt.player_id}]`;
	});

	const lines = await Promise.all(proms);

	msg += `${lines.filter(line => line != '').join('\n')}\n\`\`\``;

	if(count === 0) msg = `There are no users associated with a speedrun.com account in this discord.`;

	interaction.reply(msg);
}

const subcommands: Record<string, (interaction: CommandInteraction) => Promise<void>> = { 
	'add': add, 
	'remove': remove, 
	'list': list
};

export const execute = async (interaction: CommandInteraction) => {        
	if(!subcommands[interaction.options.getSubcommand()]) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);

	if(!interaction.guildId) throw new Error("Invalid guild id...");
	if(!interaction.guild) throw new Error('Can\'t have guild in Detroit');

	await subcommands[interaction.options.getSubcommand()](interaction);
}