import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import SRC from "src-ts";

import { DB } from "../../db";
import { PlayerEntity } from "../../db/entities";
import PaginatedList from "../menus/PaginatedList";
import UserError from "../UserError";
import { CommandWithSubcommands, Subcommand } from "./command";

const PlayerAddCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('add')
		.setDescription('Add a player association.')
		.addUserOption(o => o.setName('user').setDescription('The discord account.').setRequired(true))
		.addStringOption(o => o.setName('src_account').setDescription('The speedrun.com username.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		const userOpt = interaction.options.getUser('user');
		const srcOpt = interaction.options.getString('src_account');
		if(!srcOpt || !userOpt)
		throw new UserError('src_account and user must be set.');
		
		if(guildEnt.players.find(p => p.discord_id === userOpt.id))
		throw new UserError(`This discord account is already associated with a speedrun.com account.`);
		
		const player = await SRC.getUser(srcOpt);	
		if(guildEnt.players.find(p => p.player_id === player.id))
		throw new UserError(`This speedrun.com account is already associated with a discord account.`);
		
		const playerEnt = new PlayerEntity(interaction.guildId!, player.id, userOpt.id, player.names.international);
		await DB.getRepository(PlayerEntity).save(playerEnt);
		await interaction.reply({ content: `Added association for <@${userOpt.id}> to the speedrun.com account ${player.names.international} [${player.id}]`, allowedMentions: { users: [], roles: [] } });
	}
};

const PlayerRemoveCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('remove')
		.setDescription('Remove a player association.')
		.addUserOption(o => o.setName('user').setDescription('The discord account.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction) => {
		const pRepo = DB.getRepository(PlayerEntity);
	
		const userOpt = interaction.options.getUser('user');
		if(!userOpt) throw new UserError('The option user must be set.');
	
		let exists = await pRepo.findOne({ where: { guild_id: interaction.guildId!, discord_id: userOpt.id } });
		if(!exists) throw new UserError(`This discord account is not associated with a speedrun.com account.`);
	
		await pRepo.remove(exists);
		await interaction.reply({ content: `Association for <@${userOpt.id}> removed!`, allowedMentions: { users: [], roles: [] } });
	}
}

const PlayerListCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('list')
		.setDescription('Lists all player associations in this guild.'),
	perm: 'mods',
	execute: async (interaction) => {
		const pRepo = DB.getRepository(PlayerEntity);
		await interaction.deferReply();	
		await interaction.guild!.members.fetch();
	
		const items = (await Promise.all(interaction.guild!.members.cache.map(async member => {
			const playerEnt = await pRepo.findOne({ where: { guild_id: interaction.guildId!, discord_id: member.id } });
			if(!playerEnt) return '';
			
			return `<@${member.id}> - ${playerEnt.src_name} [${playerEnt.player_id}]`;
		}))).filter(l => l != '');
	
		if(items.length === 0) throw new UserError("This guild has no associations for players.");
	
		await new PaginatedList(items, 15, "This list has expired. Use /player list to sapwn a new one.")
			.spawnMenu(interaction);
	}
}

const PlayerCommand: CommandWithSubcommands = {
	data: new SlashCommandBuilder().setName('player')
		.setDescription('Manages player associations between discord and speedrun.com.'),
	subcommands: [ PlayerAddCommand, PlayerRemoveCommand, PlayerListCommand ]
};

export default PlayerCommand;