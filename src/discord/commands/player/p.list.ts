import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import PaginatedList from "../../menus/PaginatedList";
import UserError from "../../UserError";
import { Subcommand } from "../command";

const PlayerListCommand: Subcommand = {
	data: new SlashCommandSubcommandBuilder().setName('list')
		.setDescription('Lists all player associations in this guild.'),
	perm: 'mods',
	execute: async (interaction, guildEnt) => {
		await interaction.deferReply();	
		await interaction.guild!.members.fetch();
	
		const items = (await Promise.all(interaction.guild!.members.cache.map(async member => {
			const playerEnt = guildEnt.players.find(p => p.discord_id === member.id);
			if(!playerEnt) return '';
			
			return `<@${member.id}> - ${playerEnt.src_name} [${playerEnt.player_id}]`;
		}))).filter(l => l != '');
	
		if(items.length === 0)
			throw new UserError("This guild has no associations for players.");
	
		await new PaginatedList(items, 15, "This list has expired. Use /player list to spawn a new one.")
			.spawnMenu(interaction);
	}
}

export default PlayerListCommand;