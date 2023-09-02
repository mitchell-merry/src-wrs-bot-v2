import { SlashCommandBuilder } from 'discord.js';
import { CommandWithSubcommands } from '../command';
import LeaderboardAddCommand from './lb.add';
import LeaderboardListCommand from './lb.list';
import LeaderboardRemoveCommand from './lb.remove';
import LeaderboardSetroleCommand from './lb.setrole';

const LeaderboardCommand: CommandWithSubcommands = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Manage the leaderboards for this guild.'),
    subcommands: [
        LeaderboardAddCommand,
        LeaderboardRemoveCommand,
        LeaderboardListCommand,
        LeaderboardSetroleCommand,
    ],
};

export default LeaderboardCommand;
