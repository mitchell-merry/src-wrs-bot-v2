import { SlashCommandSubcommandBuilder } from 'discord.js';
import PaginatedList from '../../menus/PaginatedList';
import UserError from '../../UserError';
import { Subcommand } from '../command';

const ModrolesListCommand: Subcommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Lists all moderator roles for this guild.'),
    perm: 'mods',
    execute: async (interaction, guildEnt) => {
        await interaction.deferReply();

        if (guildEnt.moderatorRoles.length === 0)
            throw new UserError(`This guild has no moderator roles.`);

        const items = guildEnt.moderatorRoles.map(
            role => `<@&${role.role_id}>`,
        );

        await new PaginatedList(
            items,
            15,
            'This list has expired. Use /modroles list to spawn a new one.',
        ).spawnMenu(interaction);
    },
};

export default ModrolesListCommand;
