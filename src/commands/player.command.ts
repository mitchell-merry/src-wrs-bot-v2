import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { DB } from "../db";
import { Player } from "../db/models";
import * as SRC from '../speedruncom';

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
	const pRepo = DB.getRepository(Player);

	const userOpt = interaction.options.getUser('user');
	const srcOpt = interaction.options.getString('src_account');

	if(!srcOpt || !userOpt) {
		interaction.reply('src_account and user must be set.');
		return;
	}

	const player_id = await SRC.getUserId(srcOpt);

	const playerEnt = new Player(player_id, userOpt.id);
	pRepo.save(playerEnt);
	interaction.reply(`Added association for ${userOpt.username} to the speedrun.com account ${srcOpt} [${player_id}]`);
}

async function remove(interaction: CommandInteraction) {
	const pRepo = DB.getRepository(Player);
}

async function list(interaction: CommandInteraction) {
	const pRepo = DB.getRepository(Player);

	let msg = `The users with an association in this discord are:\n\`\`\`\n`;
	const proms = interaction.guild!.members.cache.map(async member => {
		const playerEnt = await pRepo.findOne({ where: { discord_id: member.id } });
		if(!playerEnt) return;

		return `${member.displayName} - ${playerEnt.player_id}`;
	});

	const lines = await Promise.all(proms);

	msg += `${lines.join('\n')}\n\`\`\``;
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

	subcommands[interaction.options.getSubcommand()](interaction);
}