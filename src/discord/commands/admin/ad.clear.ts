import { SlashCommandSubcommandBuilder } from "discord.js";
import { clearCommands } from "../../put_cmds";
import { Subcommand } from "../command";

const AdminClearCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('clear_commands')
		.setDescription('Clear all commands of a guild, besides the admin commands.')
		.addStringOption(o => o.setName('guild_id').setDescription('The ID of the guild. Leave this blank to update globally.').setRequired(false)),
	perm: 'superadmin',
	execute: async (interaction) => {
		const guild_id = interaction.options.getString('guild_id') ?? undefined;

		await Promise.all([
			interaction.deferReply(),
			clearCommands(guild_id)
		]);

		await interaction.editReply(`Commands updated!`);
	}
}

export default AdminClearCommand;