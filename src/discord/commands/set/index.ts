import { SlashCommandBuilder } from 'discord.js';
import { CommandWithSubcommands } from '../command';
import SetAboveRoleCommand from './set.ar';
import SetListCommand from './set.list';
import SetRoleDefaultColourCommand from './set.rdc';
import SetRoleDefaultNameCommand from './set.rdn';
import SetLogChannelCommand from './set.lc';

const SetCommand: CommandWithSubcommands = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Set server settings. Requires moderator permissions.'),
    subcommands: [
        SetListCommand,
        SetAboveRoleCommand,
        SetLogChannelCommand,
        SetRoleDefaultColourCommand,
        SetRoleDefaultNameCommand,
    ],
};

export default SetCommand;
