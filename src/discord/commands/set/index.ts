import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandWithSubcommands } from "../command";
import SetAboveRoleCommand from "./set.ar";
import SetListCommand from "./set.list";
import SetRoleDefaultColourCommand from "./set.rdc";

const SetCommand: CommandWithSubcommands = {
	data: new SlashCommandBuilder().setName('set')
		.setDescription('Set server settings. Requires moderator permissions.'),
	subcommands: [ SetAboveRoleCommand, SetRoleDefaultColourCommand, SetListCommand ],
};

export default SetCommand;