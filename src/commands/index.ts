import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface CommandFile {
	data: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

import * as invite from './invite.command';

export default [ invite ] as CommandFile[];