import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandWithSubcommands } from "../Command";
import LeaderboardAddCommand from "./lb.add";
import LeaderboardRemoveCommand from "./lb.remove";

const LeaderboardCommand: CommandWithSubcommands = {
	data: new SlashCommandBuilder().setName('leaderboard')
		.setDescription('Manage the leaderboards for this guild.'),
	subcommands: [ LeaderboardAddCommand, LeaderboardRemoveCommand ]
};

export default LeaderboardCommand;