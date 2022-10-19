import { AutocompleteInteraction, CommandInteraction, Interaction, WebhookEditMessageOptions } from 'discord.js';
import SRCError from 'src-ts/lib/src/SRCError';

import InviteCommand from './invite.command';
import ModrolesCommand from './modroles.command';
import SetCommand from './set.command';
import PlayerCommand from './player.command';
import LeaderboardCommand from './leaderboard/leaderboard.command';
import UpdateCommand from './update.command';
import UserError from '../UserError';
import { DB, isUserMod } from '../../db';
import { Command, CommandWithSubcommands, Executer, PermissionLevel } from './command';
import { GuildEntity } from '../../db/entities';

export const commands = [ InviteCommand, ModrolesCommand, SetCommand, PlayerCommand, LeaderboardCommand, UpdateCommand ];

export const hasSubcommands = (cmd: Command | CommandWithSubcommands): cmd is CommandWithSubcommands => 'subcommands' in cmd;

export async function handleSlashCommand(interaction: CommandInteraction) {
	const command = commands.find(c => c.data.name === interaction.commandName);
	if (!command) throw new Error(`Command ${interaction.commandName} unknown`);
	
	let perm: PermissionLevel;
	let execute: Executer;

	if (hasSubcommands(command)) {
		const sc = command.subcommands.find(sc => sc.data.name === interaction.options.getSubcommand());
		if(!sc) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);
		
		perm = sc.perm;
		execute = sc.execute;
	} else {
		perm = command.perm;
		execute = command.execute;
	}
	
	if (typeof interaction.member?.permissions === 'string') throw new Error(`error with ${interaction.member?.permissions}`)

	const userIsAdmin = interaction.user.id === process.env.admin || interaction.member!.permissions.has('ADMINISTRATOR');
	const userIsMod = userIsAdmin || (await isUserMod(interaction.guildId, interaction.member));

	// Check user has correct permission.
	if (perm === 'admin' && !userIsAdmin)
		throw new UserError(`Only admins are allowed to use this command! Loser. Scram!!`);
	else if (perm === 'mods' && !userIsMod)
		throw new UserError(`Only mods and above are allowed to use this! Shame on you. Bad.`);

	if (!interaction.guild || !interaction.guildId)
		throw new Error('For some reason missing guild');

	const gRepo = DB.getRepository(GuildEntity);
	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId }});
	if (!guildEnt)
		throw new Error('Guild not being tracked as an entity for some reason.');

	await execute(interaction, guildEnt);
}

export async function handleAutocomplete(interaction: AutocompleteInteraction) {
	const command = commands.find(c => c.data.name === interaction.commandName);
	if (!command) throw new Error(`Command ${interaction.commandName} unknown`);
	
	let acl;
	if (hasSubcommands(command)) {
		const sc = command.subcommands.find(sc => sc.data.name === interaction.options.getSubcommand());
		if(!sc) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);
		
		acl = sc.autocomplete;
	} else {
		acl = command.autocomplete;
	}

	if (!acl) throw new Error(`Error getting autocomplete: Missing autocompleter`);
	
	await acl(interaction);
}

export async function interactionCreate(interaction: Interaction) {
	try {
		if(interaction.isCommand()) await handleSlashCommand(interaction);
		if(interaction.isAutocomplete()) await handleAutocomplete(interaction); 
	} catch (error) {
		const data: WebhookEditMessageOptions = {
			content: "Unknown error occurred.",
			components: [],
			allowedMentions: { users: [], roles: [] }
		};

		if(error instanceof UserError || error instanceof SRCError) {
			data.content = error.message;
			console.error(error);
		} else {
			console.error(error);
		}

		if (interaction.isCommand()) {
			await ((interaction.replied || interaction.deferred)
				? interaction.editReply(data) 
				: interaction.reply(data));
		}
	}
}