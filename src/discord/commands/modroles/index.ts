import { SlashCommandBuilder } from 'discord.js';
import { CommandWithSubcommands } from '../command';
import ModrolesAddCommand from './mr.add';
import ModrolesListCommand from './mr.list';
import ModrolesPruneCommand from './mr.prune';
import ModrolesRemoveCommand from './mr.remove';

const ModrolesCommand: CommandWithSubcommands = {
    data: new SlashCommandBuilder()
        .setName('modroles')
        .setDescription(
            'Manages the moderator roles for the bot. Requires admin permissions.',
        ),
    subcommands: [
        ModrolesAddCommand,
        ModrolesRemoveCommand,
        ModrolesListCommand,
        ModrolesPruneCommand,
    ],
};

export default ModrolesCommand;
