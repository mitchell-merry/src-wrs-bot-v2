import { SlashCommandSubcommandBuilder } from "discord.js";
import { DB } from "../../../db";
import { PlayerEntity } from "../../../db/entities";
import UserError from "../../UserError";
import { Subcommand } from "../command";

const PlayerRemoveCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('remove')
		.setDescription('Remove a player association.')
		.addUserOption(o => o.setName('user').setDescription('The discord account.').setRequired(true)),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		const userOpt = interaction.options.getUser('user');
		if(!userOpt)
			throw new UserError('The option user must be set.');
	
		let exists = guildEnt.players.find(p => p.discord_id === userOpt.id);
		if(!exists)
			throw new UserError(`This discord account is not associated with a speedrun.com account.`);
	
		await DB.getRepository(PlayerEntity).remove(exists);
		await interaction.reply({ content: `Association for <@${userOpt.id}> removed!`, allowedMentions: { users: [], roles: [] } });
	}
}

export default PlayerRemoveCommand;