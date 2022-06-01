import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export type PermissionLevel = 'admin' | 'mods' | 'all';

export interface CommandFile {
	data: SlashCommandBuilder;
	perms: Record<string, PermissionLevel> | PermissionLevel;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

import * as invite from './invite.command';

export default [ invite ] as CommandFile[];