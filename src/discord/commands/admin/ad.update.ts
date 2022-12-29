import { SlashCommandSubcommandBuilder } from "discord.js";
import { registerAllCommands } from "../../put_cmds";
import { Subcommand } from "../command";

const AdminUpdateCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('update_commands')
		.setDescription('Updates the commands for a guild / global for this bot.')
		.addStringOption(o => o.setName('guild_id').setDescription('The ID of the guild. Leave this blank to update globally.').setRequired(false)),
	perm: 'superadmin',
	execute: async (interaction) => {
		const guild_id = interaction.options.getString('guild_id') ?? undefined;

		await Promise.all([
			interaction.deferReply(),
			registerAllCommands(guild_id)
		]);

		await interaction.editReply(`Commands updated!`);
	}
}

export default AdminUpdateCommand;