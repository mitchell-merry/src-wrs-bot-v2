import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, Interaction, InteractionReplyOptions, MessagePayload, MessagePayloadOption, WebhookEditMessageOptions } from 'discord.js';
import { SRCError } from 'src-ts';

import InviteCommand from './invite.command';
import ModrolesCommand from './modroles';
import SetCommand from './set';
import PlayerCommand from './player';
import LeaderboardCommand from './leaderboard';
import UpdateCommand from './update.command';
import UserError from '../UserError';
import { DB, isUserMod } from '../../db';
import { Command, CommandWithSubcommands, Executer, PermissionLevel } from './command';
import { GuildEntity } from '../../db/entities';
import AdminCommand from './admin';

export const commands = [ InviteCommand, ModrolesCommand, SetCommand, PlayerCommand, LeaderboardCommand, UpdateCommand ];

export const hasSubcommands = (cmd: Command | CommandWithSubcommands): cmd is CommandWithSubcommands => 'subcommands' in cmd;

export async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
	const guildLog = (s: string) => console.log(`[${interaction.guildId!}] ${s}`);
	guildLog(`Command receieved by ${interaction.user.tag}.`);

	const command = [...commands, AdminCommand].find(c => c.data.name === interaction.commandName);
	if (!command)
		throw new Error(`Command ${interaction.commandName} unknown`);
	guildLog(`Found command ${command.data.name}.`);

	let perm: PermissionLevel;
	let execute: Executer;

	if (hasSubcommands(command)) {
		const sc = command.subcommands.find(sc => sc.data.name === interaction.options.getSubcommand());
		if(!sc) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);
		guildLog(`Detected as subcommand ${sc.data.name}.`);

		perm = sc.perm;
		execute = sc.execute;
	} else {
		guildLog(`Detected as top-level command.`);
		perm = command.perm;
		execute = command.execute;
	}
	
	if (typeof interaction.member?.permissions === 'string')
		throw new Error(`error with ${interaction.member?.permissions}`)

	guildLog('Getting user credentials...');
	const userIsSuperAdmin = interaction.user.id === process.env.DiscordAdmin;
	const userIsAdmin = userIsSuperAdmin || interaction.member!.permissions.has('Administrator');
	const userIsMod = userIsAdmin || (await isUserMod(interaction.guildId, interaction.member));
	guildLog(`userIsSuperAdmin: ${userIsSuperAdmin}, userIsAdmin: ${userIsAdmin}, userIsMod: ${userIsMod}`);

	// Check user has correct permission.
	if (perm === 'superadmin' && !userIsSuperAdmin)
		throw new UserError(`Only the best of the best (super-admins) can use this... for shame.`);
	else if (perm === 'admin' && !userIsAdmin)
		throw new UserError(`Only admins are allowed to use this command! Loser. Scram!!`);
	else if (perm === 'mods' && !userIsMod)
		throw new UserError(`Only mods and above are allowed to use this! Shame on you. Bad.`);

	if (!interaction.guild || !interaction.guildId)
		throw new Error('For some reason missing guild');

	guildLog('Getting guild entity...');
	const guildEnt = await DB.getRepository(GuildEntity).findOne({
		where: { guild_id: interaction.guildId },
		relations: {
			trackedLeaderboards: { leaderboard: { variables: true } },
			players: true,
			moderatorRoles: true
		}
	});

	if (!guildEnt)
		throw new Error('Guild not being tracked as an entity for some reason.');

	guildLog(`Found! Executing command.`);
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
		if (interaction.isChatInputCommand()) await handleSlashCommand(interaction);
		if (interaction.isAutocomplete()) await handleAutocomplete(interaction); 
	} catch (error) {
		const data: InteractionReplyOptions = {
			content: "Unknown error occurred.",
			components: [],
			allowedMentions: { users: [], roles: [] }
		};

		if (error instanceof UserError || error instanceof SRCError)
			data.content = error.message;

		if (!(error instanceof UserError))
			console.error(error);

		if (interaction.isCommand()) {
			await ((interaction.replied || interaction.deferred)
				? interaction.editReply(data) 
				: interaction.reply(data));
		}
	}
}