import { SlashCommandBuilder } from '@discordjs/builders';
import { AutocompleteInteraction, CommandInteraction, WebhookEditMessageOptions } from 'discord.js';

export type PermissionLevel = 'admin' | 'mods' | 'all';

export interface CommandFile {
	data: SlashCommandBuilder;
	perms: Record<string, PermissionLevel> | PermissionLevel;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

import * as invite from './invite.command';
import * as modroles from './modroles.command';
import * as set from './set.command';
import * as player from './player.command';
import * as leaderboard from './leaderboard/leaderboard.command';
import * as update from './update.command';
import UserError from '../UserError';
import { DB, isUserMod } from '../../db';
import { TrackedLeaderboardEntity } from '../../db/entities';
import SRCError from 'src-ts/lib/src/SRCError';

export const commands = [ invite, modroles, set, player, leaderboard, update ] as CommandFile[];

export async function handleSlashCommand(interaction: CommandInteraction) {
	const command = commands.find((c) => c.data.name === interaction.commandName);

	try {

		if(!command) throw new Error(`Command ${interaction.commandName} unknown`);

		// Get the perm level of the command or subcommand.
		let permLevel;
		if(typeof command.perms === 'string') permLevel = command.perms;
		else permLevel = command.perms[interaction.options.getSubcommand()];
		
		if(!permLevel) throw new Error(`Permission level missing for ${interaction.options.getSubcommand()}.`);
		if(typeof interaction.member?.permissions === 'string') throw new Error(`error with ${interaction.member?.permissions}`)

		const userIsAdmin = interaction.user.id === process.env.admin || interaction.member!.permissions.has('ADMINISTRATOR');
		const userIsMod = userIsAdmin || (await isUserMod(interaction.guildId, interaction.member));

		// Check user has correct permission.
		if(permLevel === 'admin' && !userIsAdmin) throw new UserError(`Only admins are allowed to use this command! Loser. Scram!!`);
		else if(permLevel === 'mods' && !userIsMod) throw new UserError(`Only mods and above are allowed to use this! Shame on you. Bad.`);

		await command.execute(interaction);
	} catch (error) {
		const data: WebhookEditMessageOptions = {
			content: "Unknown error occurred.",
			components: [],
			allowedMentions: { users: [], roles: [] }
		};

		if(error instanceof UserError || error instanceof SRCError) {
			data.content = error.message;
		} else {
			console.error(error);
		}

		await ((interaction.replied || interaction.deferred)
			? interaction.editReply(data) 
			: interaction.reply(data));
	}
}

export async function handleAutocomplete(interaction: AutocompleteInteraction) {
	// TODO: Make more modular
	if(interaction.commandName === 'leaderboard'
		&& (interaction.options.getSubcommand() === 'remove' || interaction.options.getSubcommand() === 'setrole')
	) {
		const tlbRepo = DB.getRepository(TrackedLeaderboardEntity);
		const val = interaction.options.getFocused(true).value as string;

		const boards = await tlbRepo.find({ where: { guild_id: interaction.guildId! }, relations: { leaderboard: true } });

		// TODO sort alphabetically
		const response = boards
			.filter(tlb => tlb.leaderboard.lb_name.toLowerCase().includes(val.toLowerCase()))
			.map(tlb => ({
				name: `${tlb.leaderboard.lb_name}`,
				value: tlb.leaderboard.lb_id
			}))
			.slice(0, 25);

		interaction.respond(response);
	}
}