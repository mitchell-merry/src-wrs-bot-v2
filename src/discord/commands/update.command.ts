import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { DB } from "../../db";
import { GuildEntity, TrackedLeaderboard } from "../../db/models";
import UserError from "../UserError";

export const data = new SlashCommandBuilder()
	.setName('update')
	.setDescription('Update the world record roles.');

export const perms = 'mods';

export const execute = async (interaction: CommandInteraction) => {
	// check if guild is tracked
	if(!interaction.guild || !interaction.guildId) throw new Error('guild or guildId undefined.');
	const guildRepo = DB.getRepository(GuildEntity);
	const guildEnt = await guildRepo.findOne({ where: { guild_id: interaction.guildId }});
	if(!guildEnt) throw new UserError('Error: this guild is not being tracked!');

	// get all leaderboards tracked by guild
	const tlbRepo = DB.getRepository(TrackedLeaderboard);
	const tracked = await tlbRepo.find({
		where: { guild_id: interaction.guildId },
		relations: {
			leaderboard: { variables: true }
		}
	});

	interaction.deferReply();
}