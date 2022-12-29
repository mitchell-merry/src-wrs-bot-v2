import { SlashCommandBuilder } from "discord.js";
import { CommandWithSubcommands } from "../command";
import AdminClearCommand from "./ad.clear";
import AdminUpdateCommand from "./ad.update";

const AdminCommand: CommandWithSubcommands = {
	data: new SlashCommandBuilder().setName('admin')
		.setDescription("Administrator commands - for the super-admin only!"),
	subcommands: [ AdminUpdateCommand, AdminClearCommand ]
};

export default AdminCommand;