import { SlashCommandBuilder } from "discord.js";

import { CommandWithSubcommands } from "../command";
import PlayerAddCommand from "./p.add";
import PlayerListCommand from "./p.list";
import PlayerRemoveCommand from "./p.remove";

const PlayerCommand: CommandWithSubcommands = {
	data: new SlashCommandBuilder().setName('player')
		.setDescription('Manages player associations between discord and speedrun.com.'),
	subcommands: [ PlayerAddCommand, PlayerRemoveCommand, PlayerListCommand ]
};

export default PlayerCommand;