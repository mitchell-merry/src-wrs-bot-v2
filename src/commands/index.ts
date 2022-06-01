import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

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

export default [ invite, modroles, set, player ] as CommandFile[];