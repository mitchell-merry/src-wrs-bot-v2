import { SlashCommandSubcommandBuilder } from 'discord.js';
import { DB } from '../../../db';
import { TrackedLeaderboardEntity } from '../../../db/entities';
import PaginatedList from '../../menus/PaginatedList';
import UserError from '../../UserError';
import { Subcommand } from '../command';

const LeaderboardListCommand: Subcommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Lists all leaderboards tracked in this guild.'),
    perm: 'all',
    execute: async interaction => {
        await interaction.deferReply();

        const tlbRepo = DB.getRepository(TrackedLeaderboardEntity);
        const roles = await interaction.guild!.roles.fetch();

        // get leaderboards tracked by guild
        const boards = await tlbRepo.find({
            where: { guild_id: interaction.guildId! },
            relations: { leaderboard: true },
        });
        if (!boards || boards.length === 0)
            throw new UserError('This guild tracks no leaderboards.');

        // spawn a paginated list
        const items = boards.map(tlb => {
            const role = roles.get(tlb.role_id);
            return `${tlb.leaderboard.lb_name} - <@&${role?.id}>`;
        });

        await new PaginatedList(
            items,
            15,
            'This list has expired. Use /leaderboard list to spawn a new one.',
        ).spawnMenu(interaction);
    },
};

export default LeaderboardListCommand;
