import { SlashCommandSubcommandBuilder } from 'discord.js';
import { DB } from '../../../db';
import { GuildEntity } from '../../../db/entities';
import { Subcommand } from '../command';

const SetAboveRoleCommand: Subcommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('above_role')
        .setDescription('The role that new roles get created above.')
        .addRoleOption(o =>
            o
                .setName('above_role')
                .setDescription('The role.')
                .setRequired(true),
        ),
    perm: 'mods',
    execute: async (interaction, guildEnt) => {
        const role = interaction.options.getRole('above_role', true);

        await DB.getRepository(GuildEntity).update(
            { guild_id: guildEnt.guild_id },
            { above_role_id: role.id },
        );

        await interaction.reply({
            content: `above_role set to <@&${role.id}>.`,
            allowedMentions: { users: [], roles: [] },
        });
    },
};

export default SetAboveRoleCommand;
